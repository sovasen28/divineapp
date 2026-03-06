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
    <div className="min-h-screen font-sans selection:bg-sepia-200">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-sepia-50/80 backdrop-blur-md border-b border-sepia-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-sepia-900 p-2 rounded-lg">
              <BookOpen className="text-sepia-50 w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">বাইবেল স্কলার AI</h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium opacity-60">
            <span>গভীর ব্যাখ্যা</span>
            <span>•</span>
            <span>ঐতিহাসিক প্রেক্ষাপট</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Search Section */}
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl sm:text-5xl font-serif mb-4 leading-tight">
              বাইবেলের গভীর রহস্য উন্মোচন করুন
            </h2>
            <p className="text-lg opacity-70 max-w-2xl mx-auto">
              যেকোনো পদ বা ধর্মতাত্ত্বিক প্রশ্ন টাইপ করুন এবং Gemini AI-এর মাধ্যমে বিস্তারিত ব্যাখ্যা পান।
            </p>
          </motion.div>

          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="যেমন: যোহন ৩:১৬ এর ব্যাখ্যা দিন..."
              className="w-full bg-white border-2 border-sepia-200 rounded-2xl px-6 py-5 pr-16 text-lg focus:outline-none focus:border-sepia-900 transition-all shadow-sm group-hover:shadow-md"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-sepia-900 text-sepia-50 p-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['আদিপুস্তক ১:১', 'মথি ৫:৩-১২', 'প্রেম কি?', 'ঈশ্বরের করুণা'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSearch(undefined, suggestion)}
                className="text-sm px-4 py-1.5 rounded-full border border-sepia-200 hover:bg-sepia-100 transition-colors opacity-70 hover:opacity-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* History Sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-sepia-100/50 rounded-2xl p-5 border border-sepia-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold flex items-center gap-2">
                  <History className="w-4 h-4" /> ইতিহাস
                </h3>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-xs opacity-50 hover:opacity-100 hover:text-red-600 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-xs opacity-40 italic">কোনো ইতিহাস নেই</p>
                ) : (
                  history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(undefined, h.query)}
                      className="w-full text-left text-sm p-2 rounded-lg hover:bg-white transition-all truncate opacity-70 hover:opacity-100"
                    >
                      {h.query}
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Result Area */}
          <section className="lg:col-span-3 order-1 lg:order-2 min-h-[400px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full py-12 text-center"
                >
                  <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-20" />
                  <p className="font-serif italic opacity-60">OpenRouter (DeepSeek R1) বিশ্লেষণ করছে...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-2xl text-center"
                >
                  <p>{error}</p>
                  <button onClick={() => handleSearch()} className="mt-4 text-sm font-bold underline">আবার চেষ্টা করুন</button>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-sepia-200 rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Sparkles className="w-48 h-48" />
                  </div>
                  <div className="markdown-body relative z-10">
                    <Markdown>{result}</Markdown>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full py-12 text-center opacity-30"
                >
                  <BookOpen className="w-16 h-16 mb-4" />
                  <p className="font-serif italic">আপনার যাত্রা শুরু করতে একটি পদ খুঁজুন</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-12 border-t border-sepia-200 mt-12 text-center opacity-40 text-sm">
        <p>© {new Date().getFullYear()} বাইবেল স্কলার AI • OpenRouter (DeepSeek R1) দ্বারা চালিত</p>
      </footer>
    </div>
  );
}
