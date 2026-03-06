import { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Sparkles, Loader2, History, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { explainVerse } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SearchHistory {
  query: string;
  timestamp: number;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('bible_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (q: string) => {
    const newHistory = [{ query: q, timestamp: Date.now() }, ...history.filter(h => h.query !== q)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('bible_history', JSON.stringify(newHistory));
  };

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = customQuery || query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await explainVerse(searchQuery);
      setResult(response || "No explanation found.");
      saveToHistory(searchQuery);
      if (!customQuery) setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('bible_history');
  };

  return (
    <div className="min-h-screen font-sans selection:bg-accent/20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-paper-50/80 backdrop-blur-xl border-b border-paper-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-ink-900 p-2.5 rounded-xl shadow-lg shadow-ink-900/10">
              <BookOpen className="text-paper-50 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-ink-900">বাইবেল স্কলার AI</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-40 -mt-1">Scholarly Analysis</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest opacity-40">
            <span className="hover:opacity-100 transition-opacity cursor-default">ঐতিহাসিক প্রেক্ষাপট</span>
            <span className="hover:opacity-100 transition-opacity cursor-default">তাত্ত্বিক গভীরতা</span>
            <span className="hover:opacity-100 transition-opacity cursor-default">ব্যবহারিক শিক্ষা</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-20">
        {/* Hero Section */}
        <section className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl sm:text-7xl font-display mb-6 leading-[1.1] tracking-tight text-ink-900">
              বাইবেলের গভীর রহস্য <br />
              <span className="italic font-serif font-light text-accent">উন্মোচন করুন</span>
            </h2>
            <p className="text-xl text-ink-700/60 max-w-2xl mx-auto font-serif italic">
              যেকোনো পদ বা ধর্মতাত্ত্বিক প্রশ্ন টাইপ করুন এবং DeepSeek R1-এর মাধ্যমে বিস্তারিত তাত্ত্বিক ও ঐতিহাসিক ব্যাখ্যা পান।
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-ink-900/5 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="যেমন: যোহন ৩:১৬ এর ব্যাখ্যা দিন..."
                  className="w-full bg-white border border-paper-200 rounded-2xl px-8 py-6 pr-20 text-xl focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all shadow-xl shadow-ink-900/5 placeholder:opacity-30"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-ink-900 text-paper-50 p-4 rounded-xl hover:bg-accent active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
                </button>
              </div>
            </form>

            {/* Quick Suggestions */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              {['আদিপুস্তক ১:১', 'মথি ৫:৩-১২', 'প্রেম কি?', 'ঈশ্বরের করুণা'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSearch(undefined, suggestion)}
                  className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full border border-paper-200 bg-white/50 hover:bg-white hover:border-accent hover:text-accent transition-all opacity-60 hover:opacity-100 shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* History Sidebar */}
          <aside className="lg:col-span-3 order-2 lg:order-1 sticky top-32">
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-paper-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-lg flex items-center gap-2 text-ink-900">
                  <History className="w-5 h-5 opacity-40" /> ইতিহাস
                </h3>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all opacity-30 hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {history.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs opacity-30 font-bold uppercase tracking-widest">খালি</p>
                  </div>
                ) : (
                  history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(undefined, h.query)}
                      className="w-full text-left text-sm py-3 px-4 rounded-xl hover:bg-white hover:shadow-sm transition-all truncate text-ink-700/60 hover:text-ink-900 font-medium border border-transparent hover:border-paper-200"
                    >
                      {h.query}
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Result Area */}
          <section className="lg:col-span-9 order-1 lg:order-2 min-h-[500px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-[500px] text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
                    <Loader2 className="w-16 h-16 animate-spin mb-6 text-accent relative z-10" />
                  </div>
                  <p className="font-display text-2xl italic text-ink-900/40 animate-pulse">DeepSeek R1 গভীরভাবে বিশ্লেষণ করছে...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50/50 border border-red-100 text-red-800 p-10 rounded-3xl text-center backdrop-blur-sm"
                >
                  <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2">দুঃখিত, একটি সমস্যা হয়েছে</h3>
                  <p className="opacity-70 mb-6">{error}</p>
                  <button onClick={() => handleSearch()} className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">আবার চেষ্টা করুন</button>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white border border-paper-200 rounded-[2.5rem] p-10 sm:p-16 shadow-2xl shadow-ink-900/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                    <Sparkles className="w-64 h-64" />
                  </div>
                  <div className="markdown-body relative z-10">
                    <Markdown>{result}</Markdown>
                  </div>
                  
                  <div className="mt-16 pt-8 border-t border-paper-100 flex items-center justify-between opacity-30 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <span>Analysis Complete</span>
                    <span>DeepSeek R1 Reasoning</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[500px] text-center"
                >
                  <div className="w-24 h-24 bg-paper-100 rounded-full flex items-center justify-center mb-6 opacity-40">
                    <BookOpen className="w-10 h-10 text-ink-900" />
                  </div>
                  <h3 className="font-display text-2xl text-ink-900/30 mb-2">আপনার যাত্রা শুরু করুন</h3>
                  <p className="font-serif italic text-ink-900/20">একটি পদ বা প্রশ্ন টাইপ করে অনুসন্ধান করুন</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-20 border-t border-paper-200 mt-20 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-ink-900 p-2 rounded-lg opacity-20">
            <BookOpen className="text-paper-50 w-5 h-5" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-30">বাইবেল স্কলার AI</p>
            <p className="text-sm text-ink-700/40">© {new Date().getFullYear()} • OpenRouter (DeepSeek R1) দ্বারা চালিত</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
