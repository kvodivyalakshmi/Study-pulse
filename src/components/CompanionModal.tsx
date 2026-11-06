import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { CompanionPersona, ChatMessage } from '../types';
import {
  X,
  Send,
  Bot,
  Sparkles,
  Zap,
  Heart,
  Compass,
  Lightbulb,
  Trash2,
  BookOpen,
  RefreshCw,
} from 'lucide-react';

const PERSONAS: {
  id: CompanionPersona;
  name: string;
  role: string;
  description: string;
  color: string;
  icon: any;
  greeting: string;
}[] = [
  {
    id: 'Sage',
    name: 'Sage',
    role: 'Wise Academic Mentor',
    description: 'Structured strategies, metacognition, Feynman technique & gentle encouragement.',
    color: 'from-indigo-500 to-purple-600',
    icon: Sparkles,
    greeting: `Hello! I'm Sage, your academic mentor and study guide. Whether you need a step-by-step breakdown of a tough syllabus topic, an exam strategy, or advice on active recall—I'm right here with you. What are we tackling today?`,
  },
  {
    id: 'Nova',
    name: 'Nova',
    role: 'High-Energy Study Coach',
    description: 'Pumps you up, celebrates micro-wins, fast-paced sprint tactics & high momentum.',
    color: 'from-amber-500 to-rose-500',
    icon: Zap,
    greeting: `Hey! Nova here! 🚀 Ready to turn study dread into pure momentum? Let's crush a quick focus sprint or tackle that intimidating task right now. What's on your desk?`,
  },
  {
    id: 'Aria',
    name: 'Aria',
    role: 'Mindful Study Companion',
    description: 'Stress reduction, calm focus, anti-burnout pacing & balanced serenity.',
    color: 'from-emerald-500 to-teal-600',
    icon: Heart,
    greeting: `Welcome. I'm Aria. 🌱 Take a slow, grounding breath. We'll approach your studies with calm clarity and zero panic. What lesson or deadline is on your mind?`,
  },
  {
    id: 'Orion',
    name: 'Orion',
    role: 'Analytical Strategy Advisor',
    description: 'Time-blocking, ruthless prioritization, high-yield exam preparation & logic.',
    color: 'from-sky-500 to-blue-600',
    icon: Compass,
    greeting: `Greetings. I'm Orion. 🎯 Let's optimize your study hours with high-yield prioritization and systematic problem sets. Where is our biggest opportunity today?`,
  },
];

export const CompanionModal: React.FC = () => {
  const {
    companionModalOpen,
    setCompanionModalOpen,
    gamification,
    changePersona,
    subjects,
    goals,
    tasks,
    addToast,
  } = useStudy();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const current =
      PERSONAS.find((p) => p.id === gamification.selectedPersona) || PERSONAS[0];
    return [
      {
        id: 'msg-init',
        sender: 'companion',
        text: current.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Update greeting if persona changes and chat only has 1 message
  const handleSelectPersona = (newPersona: CompanionPersona) => {
    changePersona(newPersona);
    const pInfo = PERSONAS.find((p) => p.id === newPersona) || PERSONAS[0];
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-persona-switch-${Date.now()}`,
        sender: 'companion',
        text: `Switched companion mode to ${pInfo.name} (${pInfo.role}). ${pInfo.greeting}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!companionModalOpen) return null;

  const currentPersonaInfo =
    PERSONAS.find((p) => p.id === gamification.selectedPersona) || PERSONAS[0];

  const quickPrompts = [
    'How should I approach my hardest syllabus topic today?',
    'Give me a 3-step action plan to prepare for my exam',
    'I feel low on motivation—give me a 5-minute jumpstart routine',
    'How do I use the Feynman technique on my current subject?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Timeout safety controller (22s max)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000);

    try {
      const activeSubjectNames = subjects.map((s) => s.name);
      const activeGoal = goals.find((g) => !g.isCompleted)?.title || 'General Academic Mastery';
      const pendingTasks = tasks
        .filter((t) => t.status !== 'completed')
        .map((t) => t.title)
        .slice(0, 3);

      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          persona: gamification.selectedPersona,
          studentContext: {
            subjects: activeSubjectNames,
            currentGoal: activeGoal,
            streakDays: gamification.streakDays,
            level: gamification.level,
            xp: gamification.xp,
            recentTasks: pendingTasks,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const companionReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'companion',
        text:
          data.reply ||
          `Here is my recommendation: Break this topic into an immediate 20-minute focus sprint. Focus exclusively on active practice questions rather than passive reading!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, companionReply]);
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.warn('Mentor response fallback triggered:', e);

      // Intelligent instant fallback tailored to query
      let fallbackText = `I hear you! When approaching this, start with your highest-yield priority topic first. Use 25-minute Pomodoro sessions and write down explanations in your own words (Feynman technique) rather than passive highlighting. You have got this!`;
      const lower = text.toLowerCase();
      if (lower.includes('motivation') || lower.includes('tired') || lower.includes('overwhelmed')) {
        fallbackText = `Take a deep breath. Procrastination is usually just an emotional response to an overwhelming task, not a lack of discipline.\n\nUse the **5-Minute Rule**: Sit at your desk and commit to studying for only 5 minutes. If you want to stop after 5 minutes, you have permission to stop. But 90% of the time, overcoming that initial inertia is all you need. Ready to try 5 minutes?`;
      } else if (lower.includes('feynman')) {
        fallbackText = `The Feynman Technique consists of 4 clear steps:\n\n1. **Choose your concept** and write its name on blank paper.\n2. **Explain it to a beginner** using simple everyday analogies.\n3. **Pinpoint the gaps** whenever you struggle or use textbook jargon.\n4. **Review your notes to clarify** and repeat until crystal clear!`;
      } else if (lower.includes('exam') || lower.includes('plan')) {
        fallbackText = `Here is our 3-Step Exam Action Plan:\n\n1. **High-Yield Audit**: Identify the core 20% of formulas or mechanisms responsible for 80% of test points.\n2. **Active Problem Sets**: Solve past problems with closed notes under timed constraints.\n3. **Error Analysis**: Create a dedicated mistake log to review the night before the exam.`;
      }

      const fallbackMsg: ChatMessage = {
        id: `msg-fallback-${Date.now()}`,
        sender: 'companion',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `msg-clear-${Date.now()}`,
        sender: 'companion',
        text: `Fresh slate! What would you like to review, plan, or solve right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    addToast({ title: 'Chat Reset', message: 'Chat history cleared.', type: 'info' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full h-[88vh] max-h-[720px] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${currentPersonaInfo.color} flex items-center justify-center text-white shadow-sm`}
            >
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {currentPersonaInfo.name}
                </h3>
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                  {currentPersonaInfo.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Study Buddy & Academic Mentor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCompanionModalOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close mentor modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Persona Selector Bar */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
            Select Companion:
          </span>
          {PERSONAS.map((p) => {
            const isSelected = gamification.selectedPersona === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPersona(p.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md shrink-0 transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs border border-indigo-200 dark:border-indigo-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={p.description}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${currentPersonaInfo.color} flex items-center justify-center text-white shrink-0 mt-0.5 text-xs shadow-xs`}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`text-[10px] mt-1.5 ${
                      isUser ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${currentPersonaInfo.color} flex items-center justify-center text-white shrink-0 mt-0.5 text-xs animate-pulse`}
              >
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
                <span className="ml-1 font-medium">{currentPersonaInfo.name} is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Suggestions */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Quick ask:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${currentPersonaInfo.name} for study advice, syllabus breakdown, or motivation...`}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
