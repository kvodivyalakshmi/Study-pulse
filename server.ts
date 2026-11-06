import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI SDK (server-side only) with compliant timeout (>= 10s)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    timeout: 18000,
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary fast model and fallback
const PRIMARY_MODEL = 'gemini-flash-lite-latest';
const SECONDARY_MODEL = 'gemini-flash-latest';

// Robust helper to run content generation with timeout & multi-model fallback
async function generateWithFallback(params: {
  contents: string | any;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const config: any = {};
  if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
  if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
  if (params.temperature !== undefined) config.temperature = params.temperature;

  // Try primary fast model
  try {
    const res = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: params.contents,
      config,
    });
    if (res.text) return res.text;
  } catch (err: any) {
    console.warn(`Primary model ${PRIMARY_MODEL} error:`, err?.message || err);
  }

  // Try secondary model
  try {
    const res = await ai.models.generateContent({
      model: SECONDARY_MODEL,
      contents: params.contents,
      config,
    });
    if (res.text) return res.text;
  } catch (err: any) {
    console.warn(`Secondary model ${SECONDARY_MODEL} error:`, err?.message || err);
  }

  return null;
}

// Persona-rich offline fallback responses
function getFallbackMentorResponse(message: string, persona: string): string {
  const m = message.toLowerCase();

  if (persona === 'Nova') {
    if (m.includes('tired') || m.includes('hard') || m.includes('overwhelmed') || m.includes('motivation')) {
      return `Hey! High-five for showing up today—that's already 80% of the battle! 🚀\n\nHere's our 5-minute rule right now: Pick ONE small equation, flashcard, or paragraph. Set a 5-minute timer and just glance at it. 9 times out of 10, once you start, momentum takes over. You have got this! Let's conquer this first step!`;
    }
    return `Let's sprint! 🔥 Break your immediate subject into 2 quick 20-minute focus blocks. Do 3 practice questions right now without checking the solutions first. Small active wins build unstoppable momentum!`;
  }

  if (persona === 'Aria') {
    return `Take a calm, deep breath. Learning is a marathon of consistency, not a sprint of stress. 🌱\n\nWhen you feel overwhelmed by a large syllabus, zoom in on just today's single unit. Clear your desk, take 3 mindful breaths, and work through one concept at a time. Your mind consolidates memory best when you remain calm and patient with yourself.`;
  }

  if (persona === 'Orion') {
    return `Let's look at the data and strategy. 🎯\n\n1. **High-Yield Rule**: Identify the 20% of syllabus topics that generate 80% of test questions.\n2. **Time-Boxing**: Allocate 45-minute strict deep work blocks with zero notifications.\n3. **Error Analysis**: Log every incorrect practice answer in an error journal to prevent repeat mistakes. What is your highest priority exam or deadline this week?`;
  }

  // Default Sage
  if (m.includes('feynman')) {
    return `The Feynman Technique is one of our best tools! Here is the 4-step framework:\n\n1. **Choose a Concept**: Write the topic title at the top of a blank page.\n2. **Explain it to a 10-year-old**: Write down the mechanism using everyday words and analogies. No textbook jargon allowed!\n3. **Identify the Gap**: The exact moment you feel stuck or reach for technical jargon is where your understanding is weak. Go back to your notes and fix that exact spot.\n4. **Refine and Simplify**: Re-explain until the reasoning flows naturally.`;
  }

  if (m.includes('calculus') || m.includes('math') || m.includes('physics')) {
    return `For quantitative subjects like Calculus and Physics, passive reading yields almost zero retention. \n\nInstead: \n1. **Trace the Derivations**: Don't just memorize formulas; understand what rate of change or boundary conditions they represent.\n2. **Do Reps with Closed Books**: Solve 3 problem sets from scratch before looking at solutions.\n3. **Maintain a Mistake Log**: Categorize errors as algebra slip-ups versus conceptual gaps. Which specific chapter are you studying right now?`;
  }

  if (m.includes('schedule') || m.includes('plan') || m.includes('time')) {
    return `Here is a balanced study plan: Begin with your most cognitively demanding subject first during your peak energy hours. Use 25-minute Pomodoro sessions with 5-minute breaks. Interleave two different subjects (e.g. 50 minutes of analytical problem solving followed by 30 minutes of concept flashcards) to boost neural consolidation!`;
  }

  return `I am right here with you! Let's approach this strategically: \n\n1. What is the single most urgent topic or goal on your syllabus today?\n2. What part feels most challenging right now?\n\nTell me where you want to start, and we will break it down into simple, actionable steps together.`;
}

// 1. Study Companion Mentor Chat Endpoint
app.post('/api/mentor/chat', async (req, res) => {
  try {
    const { message, persona = 'Sage', studentContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const personaInstructions: Record<string, string> = {
      Sage: 'You are Sage, a wise, warm, and encouraging academic mentor and study guide. You offer structured guidance, metacognitive learning strategies (Feynman technique, active recall, spaced repetition), and practical encouragement.',
      Nova: 'You are Nova, an energetic, enthusiastic, and highly motivational study coach. You keep energy high, celebrate small wins, give punchy study tactics, and keep the student fired up.',
      Aria: 'You are Aria, a calm, mindful, and reassuring study companion. You help manage exam stress, prevent burnout, encourage healthy study-life balance, and maintain focused serenity.',
      Orion: 'You are Orion, an analytical, strategic academic advisor. You focus on efficiency, time-blocking, deliberate practice, prioritized syllabus coverage, and systematic problem solving.',
    };

    const personaPrompt = personaInstructions[persona] || personaInstructions['Sage'];

    let contextText = '';
    if (studentContext) {
      contextText = `
Student Academic Context:
- Active Subjects: ${(studentContext.subjects || []).join(', ') || 'General Studies'}
- Current Primary Goal: ${studentContext.currentGoal || 'Exam preparation & Syllabus mastery'}
- Study Streak: ${studentContext.streakDays || 0} days
- Level & XP: Level ${studentContext.level || 1} (${studentContext.xp || 0} XP)
- Recent Tasks: ${(studentContext.recentTasks || []).join('; ') || 'None'}
`;
    }

    const systemInstruction = `${personaPrompt}
${contextText}
Keep your answer concise (2-4 paragraphs maximum), highly actionable, warm, and academically empowering. Use clear bullet points if giving study steps. Avoid unnecessary fluff. Always stay in character as a supportive study companion.`;

    const generatedText = await generateWithFallback({
      contents: message,
      systemInstruction,
      temperature: 0.7,
    });

    const reply = generatedText || getFallbackMentorResponse(message, persona);
    return res.json({ reply, persona });
  } catch (err: any) {
    console.error('Error in mentor chat:', err);
    return res.json({
      reply: getFallbackMentorResponse(req.body?.message || '', req.body?.persona || 'Sage'),
      persona: req.body?.persona || 'Sage',
    });
  }
});

// 2. Syllabus Module Auto-Breakdown Endpoint
app.post('/api/syllabus/generate', async (req, res) => {
  try {
    const { subjectName, targetExamOrGrade, durationWeeks = 4 } = req.body;

    if (!subjectName) {
      return res.status(400).json({ error: 'Subject name is required' });
    }

    const prompt = `Generate a realistic, high-quality syllabus breakdown for a student studying: "${subjectName}".
Target goal / exam: ${targetExamOrGrade || 'Standard academic curriculum'}
Timeframe: ${durationWeeks} weeks.

Return ONLY a valid JSON object matching this structure:
{
  "modules": [
    {
      "title": "Module Title",
      "estimatedHours": number,
      "difficulty": "Easy" | "Medium" | "Hard",
      "topics": ["topic 1", "topic 2", "topic 3"]
    }
  ]
}
Provide 3 to 4 realistic modules covering key concepts in logical progression.`;

    const generatedJson = await generateWithFallback({
      contents: prompt,
      responseMimeType: 'application/json',
      temperature: 0.3,
    });

    if (generatedJson) {
      try {
        const parsed = JSON.parse(generatedJson.trim());
        if (parsed.modules && Array.isArray(parsed.modules)) {
          return res.json(parsed);
        }
      } catch (e) {
        console.warn('JSON parse error in syllabus generator:', e);
      }
    }

    // Default high-quality structured syllabus fallback
    return res.json({
      modules: [
        {
          title: `Unit 1: Fundamentals & Core Principles of ${subjectName}`,
          estimatedHours: 6,
          difficulty: 'Easy',
          topics: ['Core Definitions & Foundational Models', 'Key Axioms & Terminology', 'Introductory Worked Examples'],
        },
        {
          title: `Unit 2: Applied Analysis & Problem Solving`,
          estimatedHours: 8,
          difficulty: 'Medium',
          topics: ['Analytical Frameworks & Methodologies', 'Standard Problem Sets & Proofs', 'Case Applications'],
        },
        {
          title: `Unit 3: Advanced Topics & Exam Mastery`,
          estimatedHours: 6,
          difficulty: 'Hard',
          topics: ['High-Yield Synthesis Problems', 'Common Traps & Edge Cases', 'Timed Review & Self-Assessment'],
        },
      ],
    });
  } catch (err) {
    console.error('Error in syllabus generator:', err);
    return res.json({
      modules: [
        {
          title: `Unit 1: Foundations of ${req.body?.subjectName || 'Subject'}`,
          estimatedHours: 5,
          difficulty: 'Easy',
          topics: ['Core Definitions', 'Essential Formulas', 'Diagnostic Practice'],
        },
        {
          title: 'Unit 2: High-Yield Applications',
          estimatedHours: 8,
          difficulty: 'Medium',
          topics: ['Step-by-step problem sets', 'Concept mapping', 'Synthesis exercises'],
        },
      ],
    });
  }
});

// 3. Personalized Study Schedule Recommendations Endpoint
app.post('/api/schedule/recommend', async (req, res) => {
  try {
    const { subjects, availableHoursDaily = 3, targetGoals, preferredTimeOfDay = 'Morning' } = req.body;

    const prompt = `Based on the following student academic profile, recommend a personalized daily study schedule:
Subjects: ${JSON.stringify(subjects || [])}
Available daily study hours: ${availableHoursDaily}
Target goals: ${JSON.stringify(targetGoals || [])}
Preferred peak study time: ${preferredTimeOfDay}

Return ONLY a valid JSON object matching this structure:
{
  "recommendations": [
    {
      "timeBlock": "e.g. 08:30 - 09:45",
      "subject": "Subject name",
      "activity": "Specific study task or lesson focus",
      "technique": "e.g. Pomodoro, Active Recall, Feynman Method",
      "rationale": "Brief 1-sentence cognitive explanation"
    }
  ],
  "strategyAdvice": "1-2 sentences of actionable pacing tips"
}`;

    const generatedJson = await generateWithFallback({
      contents: prompt,
      responseMimeType: 'application/json',
      temperature: 0.4,
    });

    if (generatedJson) {
      try {
        const parsed = JSON.parse(generatedJson.trim());
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          return res.json(parsed);
        }
      } catch (e) {
        console.warn('JSON parse error in schedule recommendation:', e);
      }
    }

    // Default intelligent schedule fallback
    const primarySubj = subjects?.[0]?.name || 'Primary Subject';
    const secondarySubj = subjects?.[1]?.name || subjects?.[0]?.name || 'Secondary Subject';

    return res.json({
      recommendations: [
        {
          timeBlock: preferredTimeOfDay === 'Morning' ? '08:30 - 09:45 (75m)' : '18:00 - 19:15 (75m)',
          subject: primarySubj,
          activity: 'Deep Focus Session: Active problem sets & complex syllabus units',
          technique: 'Pomodoro (3x 25m Focus + 5m Breaks)',
          rationale: 'High cognitive demand early in your designated study slot maximizes memory consolidation.',
        },
        {
          timeBlock: preferredTimeOfDay === 'Morning' ? '10:00 - 10:50 (50m)' : '19:30 - 20:20 (50m)',
          subject: secondarySubj,
          activity: 'Concept Mapping & Note Synthesis',
          technique: 'Feynman Technique & Self-Explanation',
          rationale: 'Reviewing secondary material via explanation cements long-term memory retrieval pathways.',
        },
        {
          timeBlock: preferredTimeOfDay === 'Morning' ? '11:00 - 11:30 (30m)' : '20:30 - 21:00 (30m)',
          subject: 'Review & Micro-Drills',
          activity: 'Spaced Retrieval Flashcards & Tomorrow Plan',
          technique: 'Spaced Repetition',
          rationale: 'A brief closing retrieval session solidifies today’s learning before cognitive fatigue sets in.',
        },
      ],
      strategyAdvice: 'Tackle the highest difficulty syllabus unit during your initial block, take a screen-free walk during breaks, and wrap up with flashcard retrieval.',
    });
  } catch (err) {
    console.error('Error generating schedule recommendation:', err);
    return res.json({
      recommendations: [
        {
          timeBlock: 'Block 1 (45 mins)',
          subject: 'Core Subject',
          activity: 'Deep Focus active review on weakest lesson',
          technique: 'Pomodoro',
          rationale: 'Prioritizing challenging syllabus units early optimizes memory consolidation.',
        },
        {
          timeBlock: 'Block 2 (30 mins)',
          subject: 'Secondary Subject',
          activity: 'Practice problems & self-quizzing',
          technique: 'Active Recall',
          rationale: 'Interleaving subjects prevents cognitive fatigue.',
        },
      ],
      strategyAdvice: 'Take short 5-minute movement breaks between blocks to maintain high mental sharpness.',
    });
  }
});

// 4. Tailored Subject Tips & Daily Motivation Endpoint
app.post('/api/tips/daily', async (req, res) => {
  try {
    const { subjects = [] } = req.body;
    const subjectList = subjects.map((s: any) => s.name || s).join(', ') || 'General Academic';

    const prompt = `Generate a personalized daily motivational quote and 3 practical, subject-tailored study tips for a student studying: ${subjectList}.

Return ONLY a valid JSON object matching this structure:
{
  "quote": {
    "text": "Inspiring quote text",
    "author": "Quote author"
  },
  "tips": [
    {
      "subject": "Specific subject name or Active Learning",
      "title": "Short title of tip",
      "description": "Concrete 1-2 sentence actionable learning tip"
    }
  ]
}`;

    const generatedJson = await generateWithFallback({
      contents: prompt,
      responseMimeType: 'application/json',
      temperature: 0.6,
    });

    if (generatedJson) {
      try {
        const parsed = JSON.parse(generatedJson.trim());
        if (parsed.quote && parsed.tips) {
          return res.json(parsed);
        }
      } catch (e) {
        console.warn('JSON parse error in daily tips:', e);
      }
    }

    return res.json({
      quote: {
        text: 'Continuous effort—not strength or intelligence—is the key to unlocking our potential.',
        author: 'Winston Churchill',
      },
      tips: [
        {
          subject: subjects[0]?.name || 'Active Learning',
          title: 'The 2-Minute Retrieval Test',
          description: 'Before opening your textbook, write down everything you remember from your last session from memory.',
        },
        {
          subject: subjects[1]?.name || 'STEM & Practice',
          title: 'Interleaved Practice Sets',
          description: 'Mix different problem types within the same practice set to train conceptual discrimination on exam day.',
        },
        {
          subject: 'General Study',
          title: 'Self-Explanation Invariants',
          description: 'Explain each solution step out loud: why is this formula applicable, and what would break if constraints changed?',
        },
      ],
    });
  } catch (err) {
    console.error('Error generating daily tips:', err);
    return res.json({
      quote: {
        text: 'Action is the foundational key to all success.',
        author: 'Pablo Picasso',
      },
      tips: [
        {
          subject: 'Universal Tip',
          title: 'Self-Explanation Method',
          description: 'Explain the mechanism out loud in your own words without glancing at the textbook.',
        },
      ],
    });
  }
});

// 5. Inbuilt Active Recall Quiz & Q&A Generator Endpoint
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { topic, difficulty = 'Medium', count = 4, subjectName } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `You are a master academic examiner. Generate an active recall multiple-choice quiz with exactly ${count} challenging, conceptual questions for a student studying: "${topic}" (Subject: ${subjectName || 'General Academic'}).
Difficulty Level: ${difficulty}.

Return ONLY a valid JSON object matching this structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear, precise conceptual question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear 1-2 sentence explanation of why this answer is correct and why other choices are misconceptions.",
      "hint": "Subtle hint pointing towards the underlying principle without giving away the answer directly."
    }
  ]
}
Ensure questions test deep understanding, mechanisms, and common student misconceptions rather than trivial trivia.`;

    const generatedJson = await generateWithFallback({
      contents: prompt,
      responseMimeType: 'application/json',
      temperature: 0.35,
    });

    if (generatedJson) {
      try {
        const parsed = JSON.parse(generatedJson.trim());
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return res.json(parsed);
        }
      } catch (e) {
        console.warn('JSON parse error in quiz generator:', e);
      }
    }

    // High-quality fallback questions based on topic keywords
    const t = topic.toLowerCase();
    let fallbackQuestions = [
      {
        id: 'q-fb-1',
        question: `Which of the following best characterizes the primary invariant or core mechanism in ${topic}?`,
        options: [
          'It preserves equilibrium or structural balance under state transformations',
          'It operates in unbounded time without constraint checking',
          'It replaces analytical reasoning with randomized guessing',
          'It functions independently of initial boundary conditions',
        ],
        correctIndex: 0,
        explanation: `In ${topic}, foundational laws or invariants ensure system consistency and valid state progression under defined constraints.`,
        hint: 'Think about conservation rules and structural constraints.',
      },
      {
        id: 'q-fb-2',
        question: `When analyzing boundary cases or edge conditions in ${topic}, what is the most common pitfall to avoid?`,
        options: [
          'Assuming linearity or stability across non-linear critical points',
          'Double checking unit dimensions and algebraic signs',
          'Verifying base cases before recursive expansion',
          'Documenting intermediate state transformations',
        ],
        correctIndex: 0,
        explanation: 'Failing to account for critical points and phase shifts is the most frequent conceptual error across academic problem solving.',
        hint: 'Consider what breaks when inputs approach zero or infinity.',
      },
      {
        id: 'q-fb-3',
        question: `How does the Feynman technique recommend validating true mastery of ${topic}?`,
        options: [
          'Explaining the mechanism simply without relying on specialized jargon',
          'Rereading the textbook chapter three consecutive times passively',
          'Memorizing final formulas without checking intermediate derivations',
          'Skipping practice problems if the lecture was understood',
        ],
        correctIndex: 0,
        explanation: 'The Feynman technique posits that true mastery allows you to explain the core intuition to a beginner in plain, unambiguous terms.',
        hint: 'Active teaching reveals hidden conceptual blind spots.',
      },
    ];

    if (t.includes('tree') || t.includes('data') || t.includes('algorithm')) {
      fallbackQuestions = [
        {
          id: 'q-dsa-1',
          question: 'In a balanced Binary Search Tree (AVL tree), what is the balance factor of a node defined as?',
          options: [
            'Height of Left Subtree - Height of Right Subtree',
            'Number of Left Children * Number of Right Children',
            'Depth of the node from the root',
            'Total leaf nodes divided by internal nodes',
          ],
          correctIndex: 0,
          explanation: 'The balance factor is calculated as height(left) - height(right) and must stay within {-1, 0, 1} for AVL balance.',
          hint: 'It measures the difference in heights between the two subtrees.',
        },
        {
          id: 'q-dsa-2',
          question: 'What rotation sequence is required when a node is inserted into the Right Subtree of a Left Child?',
          options: [
            'Left-Right Double Rotation (LR Rotation)',
            'Single Right Rotation',
            'Single Left Rotation',
            'Right-Right Double Rotation',
          ],
          correctIndex: 0,
          explanation: 'A left rotation on the child followed by a right rotation on the parent resolves the inner-elbow imbalance.',
          hint: 'It requires two rotations in opposite directions.',
        },
        {
          id: 'q-dsa-3',
          question: 'What is the worst-case search time complexity in a degenerate, un-balanced Binary Search Tree?',
          options: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'],
          correctIndex: 0,
          explanation: 'If items are inserted in sorted order, an unbalanced BST degenerates into a linked list, degrading search to O(N).',
          hint: 'Think about what happens when keys arrive in strictly ascending order.',
        },
      ];
    } else if (t.includes('chem') || t.includes('chiral') || t.includes('sn1') || t.includes('reaction')) {
      fallbackQuestions = [
        {
          id: 'q-chem-1',
          question: 'What characterizes a meso compound despite possessing multiple stereocenters?',
          options: [
            'It possesses an internal plane of symmetry and is optically inactive',
            'It rotates plane-polarized light by exactly 90 degrees',
            'It has no asymmetric carbon atoms whatsoever',
            'It cannot form enantiomeric pairs under any conditions',
          ],
          correctIndex: 0,
          explanation: 'Meso compounds contain chiral centers but possess an internal symmetry plane (or inversion center), canceling optical rotation.',
          hint: 'Look for internal symmetry dividing the molecule into mirror halves.',
        },
        {
          id: 'q-chem-2',
          question: 'Which reaction mechanism involves a carbocation intermediate and leads to racemization at a chiral center?',
          options: ['SN1 Substitution', 'SN2 Substitution', 'E2 Elimination', 'Syn-addition'],
          correctIndex: 0,
          explanation: 'The planar sp2 carbocation in an SN1 reaction can be attacked with equal probability from either face, creating a racemic mixture.',
          hint: 'A two-step mechanism where the leaving group departs first.',
        },
      ];
    }

    return res.json({ questions: fallbackQuestions });
  } catch (err) {
    console.error('Error generating quiz:', err);
    return res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Vite server integration
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyPulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
