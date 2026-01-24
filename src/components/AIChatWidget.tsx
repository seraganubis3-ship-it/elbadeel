'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Bot,
  Send,
  X,
  MessageCircle,
  Minimize2,
  Maximize2,
  Sparkles,
  User,
  RefreshCw,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean; // For typewriter effect
}

// Quick Actions Configuration
const QUICK_ACTIONS = [
  { label: '📦 تتبع طلب', text: 'أريد تتبع حالة طلبي' },
  { label: '💰 الأسعار', text: 'ما هي أسعار الخدمات؟' },
  { label: '📜 الأوراق المطلوبة', text: 'ما هي الأوراق المطلوبة؟' },
  { label: '📞 خدمة العملاء', text: 'أريد التحدث مع موظف خدمة العملاء' },
];

export default function AIChatWidget() {
  // ----------------------------------------------------------------------
  // 1. HOOKS
  // ----------------------------------------------------------------------
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Helper to render markdown (bold, links, lists)
  const renderMessage = (text: string) => {
    const lines = text.split('\n');
    const renderedLines: JSX.Element[] = [];

    lines.forEach((line, index) => {
      // Check for bullet points
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const content = isBullet ? line.trim().substring(2) : line;

      // Parse links and bold within the line
      const parsedContent = parseLinksAndBold(content);

      if (isBullet) {
        renderedLines.push(
          <div key={index} className='flex items-start gap-2 mb-1'>
            <span className='mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0' />
            <span>{parsedContent}</span>
          </div>
        );
      } else {
        renderedLines.push(
          <div key={index} className={`${line.trim() === '' ? 'h-2' : 'min-h-[1.5em] mb-1'}`}>
            {parsedContent}
          </div>
        );
      }
    });

    return renderedLines;
  };

  const parseLinksAndBold = (text: string) => {
    // First, process links: [Label](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseBold(text.substring(lastIndex, match.index)));
      }
      parts.push(
        <a
          key={`link-${match.index}`}
          href={match[2]}
          className='text-blue-600 dark:text-blue-400 font-bold hover:underline mx-1'
          target={match[2]?.startsWith('http') ? '_blank' : '_self'}
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(parseBold(text.substring(lastIndex)));
    }
    return parts.length > 0 ? parts : parseBold(text);
  };

  const parseBold = (text: string) => {
    // Regex for **bold** (non-greedy, captures anything inside including special chars)
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Render bold text
      parts.push(
        <strong key={`bold-${match.index}`} className='font-bold'>
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Audio refs for sound effects usually go here, skipping for now to keep it simple

  const isHidden = pathname?.startsWith('/admin');

  // Auto-scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Welcome Message
  useEffect(() => {
    setMessages(prev => {
      if (prev.length > 0) return prev;
      return [
        {
          id: 'welcome',
          text: 'مرحباً بك في منصة البديل! 👋\n\nأنا مساعدك الذكي، جاهز لمساعدتك في استخراج أوراقك الحكومية وتتبع طلباتك.\n\nكيف يمكنني خدمتك اليوم؟',
          isUser: false,
          timestamp: new Date(),
        },
      ];
    });
  }, []);

  // ----------------------------------------------------------------------
  // 2. LOGIC
  // ----------------------------------------------------------------------
  const playSendSound = () => {
    // Placeholder for sound effect
  };

  const playReceiveSound = () => {
    // Placeholder for sound effect
  };

  const sendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText.trim();
    if (!textToSend || isLoading) return;

    setInputText('');
    setShowQuickActions(false);
    playSendSound();

    // Optimistic User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const userInfo = {
        message: userMessage.text,
        userId: session?.user?.id || '',
        userEmail: session?.user?.email || '',
        userName: session?.user?.name || '',
        isAuthenticated: !!session, // Important for the backend logic
        currentPath: pathname,
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();

      // Simulate Typewriter Effect Response
      setIsLoading(false);
      playReceiveSound();

      const aiMessageId = (Date.now() + 1).toString();
      const fullText = data.response || 'عذراً، حدث خطأ بسيط. هل يمكنك المحاولة مرة أخرى؟';

      // Add empty message first then animate it (Simulated logic here, usually handled by a Typewriter component)
      // For simplicity in this widget, we'll just show it.
      // To render typewriter, we can use a custom renderer or just show full text.
      // Let's stick to full text for stability, but with a slight delay to feel natural.

      const aiMessage: Message = {
        id: aiMessageId,
        text: fullText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setIsLoading(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '❌ يبدو أن هناك مشكلة في الاتصال. يرجى المحاولة لاحقاً أو الاتصال بنا.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (actionText: string) => {
    sendMessage(actionText);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        text: 'مرحباً بك مجدداً! كيف يمكنني مساعدتك؟',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setShowQuickActions(true);
  };

  // ----------------------------------------------------------------------
  // 3. UI RENDER
  // ----------------------------------------------------------------------

  if (isHidden) return null;

  return (
    <div className='fixed inset-0 pointer-events-none z-[9999] font-sans antialiased rtl'>
      <AnimatePresence mode='wait'>
        {/* === Launcher Button === */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1 }}
            className='pointer-events-auto fixed bottom-6 left-6'
          >
            <button
              onClick={() => setIsOpen(true)}
              className='flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-600/60 transition-all duration-300 relative group'
            >
              <div className='absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-20'></div>
              <Bot className='w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md' />
              <span className='absolute -top-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-green-500 border-2 border-white'></span>
              </span>
            </button>
            {/* Tooltip - Positioned ABOVE the button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className='absolute bottom-20 left-1/2 -translate-x-1/2 w-max bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-bold shadow-xl pointer-events-none whitespace-nowrap border border-gray-100 hidden sm:block'
            >
              مساعدك الذكي 🤖
              {/* Arrow pointing down to the button */}
              <div className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-l border-gray-100 transform -rotate-45'></div>
            </motion.div>
          </motion.div>
        )}

        {/* === Chat Window === */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              pointer-events-auto flex flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-2xl border border-white/20 backdrop-blur-xl
              ${
                isMinimized
                  ? 'fixed bottom-24 left-6 w-[300px] h-auto rounded-2xl'
                  : 'fixed bottom-0 left-0 right-0 top-auto w-full h-[85vh] rounded-t-[2rem] sm:bottom-24 sm:left-6 sm:right-auto sm:top-auto sm:w-[380px] sm:h-[650px] sm:rounded-2xl'
              }
            `}
          >
            {/* Header */}
            <div
              className='bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-5 flex items-center justify-between cursor-pointer relative overflow-hidden'
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {/* Abstract Background Shapes */}
              <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl'></div>
              <div className='absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl'></div>

              <div className='flex items-center gap-3 relative z-10'>
                <div className='relative'>
                  <div className='bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10'>
                    <Bot className='w-6 h-6 text-white' />
                  </div>
                  <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full'></div>
                </div>
                <div>
                  <h3 className='text-white font-black text-lg tracking-wide flex items-center gap-2'>
                    المساعد الذكي
                    <Sparkles className='w-4 h-4 text-yellow-300 animate-pulse' />
                  </h3>
                  <p className='text-blue-100 text-xs font-medium opacity-90'>
                    {isLoading ? 'يكتب الآن...' : 'متصل ومستعد للمساعدة'}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-1 relative z-10'>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    resetChat();
                  }}
                  className='p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all'
                  title='بدء محادثة جديدة'
                >
                  <RefreshCw className='w-4 h-4' />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className='p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all'
                >
                  {isMinimized ? (
                    <Maximize2 className='w-4 h-4' />
                  ) : (
                    <Minimize2 className='w-4 h-4' />
                  )}
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className='p-2 text-white/70 hover:text-red-200 hover:bg-red-500/20 rounded-xl transition-all'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <>
                <div
                  className='flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-950/50 space-y-6 scroll-smooth'
                  ref={chatContainerRef}
                >
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start items-end gap-2'}`}
                    >
                      {!msg.isUser && (
                        <div className='w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center shrink-0 border border-white shadow-sm'>
                          <Bot className='w-5 h-5 text-blue-600' />
                        </div>
                      )}

                      <div
                        className={`
                        max-w-[85%] rounded-2xl p-4 shadow-sm text-sm leading-7 relative group
                        ${
                          msg.isUser
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-gray-100 dark:border-slate-700 rounded-bl-none'
                        }
                      `}
                      >
                        {renderMessage(msg.text)}
                        <div
                          className={`text-[10px] mt-1 opacity-50 ${msg.isUser ? 'text-blue-100' : 'text-slate-400'}`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {msg.isUser && (
                        <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-white shadow-sm'>
                          <User className='w-5 h-5 text-gray-600' />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className='flex justify-start items-end gap-2'
                    >
                      <div className='w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center shrink-0'>
                        <Bot className='w-5 h-5 text-blue-600' />
                      </div>
                      <div className='bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-bl-none p-4 shadow-sm'>
                        <div className='flex gap-1.5'>
                          <div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                          <div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                          <div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions Chips */}
                {showQuickActions && !isLoading && (
                  <div className='px-4 py-2 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm border-t border-gray-100 dark:border-slate-800'>
                    <p className='text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-bold px-1'>
                      استفسارات سريعة
                    </p>
                    <div className='flex gap-2 overflow-x-auto no-scrollbar pb-2'>
                      {QUICK_ACTIONS.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(action.text)}
                          className='whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm hover:shadow-md active:scale-95'
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className='p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 relative z-20'>
                  <div className='relative group'>
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder='اكتب استفسارك هنا...'
                      className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl px-5 py-4 pl-14 resize-none border-2 border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 transition-all text-sm max-h-32 min-h-[60px] scrollbar-thin shadow-inner'
                      rows={1}
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!inputText.trim() || isLoading}
                      className='absolute left-2 bottom-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95'
                    >
                      {isLoading ? (
                        <RefreshCw className='w-4 h-4 animate-spin' />
                      ) : (
                        <Send className='w-4 h-4' />
                      )}
                    </button>
                  </div>
                  <div className='text-center mt-3 flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity'>
                    <span className='text-[10px] font-medium text-slate-400'>Powered by</span>
                    <span className='text-[10px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                      ALBADIL AI
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles for this widget */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
