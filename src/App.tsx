import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  BookOpen, 
  Sun, 
  Moon, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  content: string;
  currentPage: number;
}

export default function App() {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('app_books');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'شاهنامه فردوسی',
        author: 'حکیم ابوالقاسم فردوسی',
        content: 'به نام خداوند جان و خرد / کزین برتر اندیشه برنگذرد\nخداوند نام و خداوند جای / خداوند روزی ده رهنمای...',
        currentPage: 1,
      },
      {
        id: '2',
        title: 'شازده کوچولو',
        author: 'آنتوان دو سنت‌اگزوپری',
        content: 'اگر گلی را دوست داشته باشی که در ستاره‌ای است، رویایی است که شب‌هنگام به آسمان نگاه کنی...',
        currentPage: 1,
      }
    ];
  });

  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('app_books', JSON.stringify(books));
  }, [books]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowApiKeyModal(false);
  };

  const handleAddBook = () => {
    if (!newTitle || !newContent) return;
    const newBook: Book = {
      id: Date.now().toString(),
      title: newTitle,
      author: newAuthor || 'ناشناس',
      content: newContent,
      currentPage: 1,
    };
    setBooks([...books, newBook]);
    setNewTitle('');
    setNewAuthor('');
    setNewContent('');
    setShowAddModal(false);
  };

  const handleDeleteBook = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBooks(books.filter(b => b.id !== id));
    if (activeBook?.id === id) setActiveBook(null);
  };

  const toggleSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fa-IR';
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const generateAiSummary = async (content: string) => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setLoadingAi(true);
    setAiSummary('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `لطفاً متن زیر از یک کتاب را به زبان فارسی بسیار روان، مفید و در چند جمله خلاصه و تحلیل کن:\n\n${content}`,
      });
      setAiSummary(response.text || 'امکان دریافت خلاصه وجود نداشت.');
    } catch (err) {
      setAiSummary('خطا در ارتباط با کلید API Gemini. لطفاً کلید خود را بررسی کنید.');
    } finally {
      setLoadingAi(false);
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#F4ECD8] text-[#4A3E3D]';
      case 'light':
        return 'bg-[#F9F9F9] text-[#1A1A1A]';
      default:
        return 'bg-[#0A0A0A] text-[#E0D8D0]';
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen font-['Vazirmatn'] transition-colors duration-300 ${getThemeClasses()}`}>
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveBook(null); window.speechSynthesis?.cancel(); setIsSpeaking(false); }}>
          <BookOpen className="w-7 h-7 text-amber-500" />
          <h1 className="text-xl font-bold tracking-wide">Bibliotheque</h1>
        </div>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'sepia' : theme === 'sepia' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-white/10 transition"
          title="تغییر تم"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-600" />}
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {!activeBook ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">کتابخانه من</h2>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition font-medium text-sm shadow-lg"
              >
                <Plus className="w-4 h-4" /> افزودن کتاب
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute right-3 top-3 w-5 h-5 opacity-40" />
              <input 
                type="text" 
                placeholder="جستجوی کتاب یا نویسنده..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-amber-500 transition text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBooks.map((book) => (
                <div 
                  key={book.id}
                  onClick={() => { setActiveBook(book); setAiSummary(''); }}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 cursor-pointer transition flex flex-col justify-between group shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-amber-500 transition">{book.title}</h3>
                      <p className="text-sm opacity-70 mt-1">{book.author}</p>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteBook(book.id, e)}
                      className="text-red-400 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-6 text-xs opacity-50 border-t border-white/5 pt-3">
                    <span>آماده مطالعه</span>
                    <ChevronLeft className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <button 
                onClick={() => { setActiveBook(null); window.speechSynthesis?.cancel(); setIsSpeaking(false); }}
                className="flex items-center gap-1 text-sm font-medium opacity-80 hover:opacity-100 hover:text-amber-500 transition"
              >
                <ChevronRight className="w-4 h-4" /> بازگشت
              </button>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleSpeech(activeBook.content)}
                  className={`p-2 rounded-xl border border-white/10 transition ${isSpeaking ? 'bg-amber-600 text-white' : ''}`}
                  title="پخش صوتی"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => generateAiSummary(activeBook.content)}
                  disabled={loadingAi}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 text-amber-500 text-xs font-medium hover:bg-amber-600/30 transition disabled:opacity-50"
                >
                  {loadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  تحلیل هوشمند
                </button>
                <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="px-2.5 py-1 rounded-lg border border-white/10 text-xs font-bold">A-</button>
                <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="px-2.5 py-1 rounded-lg border border-white/10 text-xs font-bold">A+</button>
              </div>
            </div>

            {aiSummary && (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm">
                <div className="flex items-center gap-2 font-bold text-amber-500 mb-1">
                  <Sparkles className="w-4 h-4" /> تحلیل هوشمند Gemini:
                </div>
                <p className="leading-relaxed">{aiSummary}</p>
              </div>
            )}

            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">{activeBook.title}</h1>
              <p className="text-sm opacity-60 mb-6">{activeBook.author}</p>
              
              <div 
                className="leading-relaxed whitespace-pre-wrap p-6 rounded-2xl bg-white/5 border border-white/5 shadow-inner"
                style={{ fontSize: `${fontSize}px` }}
              >
                {activeBook.content}
              </div>
            </div>
          </div>
        )}
      </main>

      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141414] text-white p-6 rounded-2xl border border-white/10 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">تنظیم API Key Gemini</h3>
            <p className="text-xs opacity-60 mb-4">برای استفاده از تحلیل هوشمند متن، کلید Gemini API خود را وارد کنید.</p>
            <input 
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowApiKeyModal(false)} className="px-4 py-2 rounded-xl text-sm border border-white/10">انصراف</button>
              <button onClick={() => saveApiKey(apiKey)} className="px-4 py-2 rounded-xl text-sm bg-amber-600 font-medium">ذخیره</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141414] text-white p-6 rounded-2xl border border-white/10 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">افزودن کتاب جدید</h3>
            <div className="space-y-3">
              <input 
                type="text"
                placeholder="عنوان کتاب"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500"
              />
              <input 
                type="text"
                placeholder="نام نویسنده"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500"
              />
              <textarea 
                placeholder="متن کتاب..."
                rows={5}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-sm border border-white/10">انصراف</button>
              <button onClick={handleAddBook} className="px-4 py-2 rounded-xl text-sm bg-amber-600 font-medium">ذخیره کتاب</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
