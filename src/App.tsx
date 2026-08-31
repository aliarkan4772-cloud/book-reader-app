import React, { useState } from 'react';
import { 
  BookOpen, 
  Bookmark, 
  Settings, 
  Sun, 
  Moon, 
  BookMarked, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Search
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  content: string;
  currentPage: number;
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([
    {
      id: '1',
      title: 'شاهنامه فردوسی',
      author: 'حکیم ابوالقاسم فردوسی',
      content: 'به نام خداوند جان و خرد / کزین برتر اندیشه برنگذرد\nخداوند نام و خداوند جای / خداوند روزی ده رهنمای\nخداوند کیوان و گردان سپهر / فروزنده ماه و زرتشت و مهر...',
      currentPage: 1,
    },
    {
      id: '2',
      title: 'شازده کوچولو',
      author: 'آنتوان دو سنت‌اگزوپری',
      content: 'اگر گلی را دوست داشته باشی که در ستاره‌ای است، رویایی است که شب‌هنگام به آسمان نگاه کنی. همه ستاره‌ها پر از گل خواهند بود...',
      currentPage: 1,
    }
  ]);

  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveBook(null)}>
          <BookOpen className="w-7 h-7 text-amber-500" />
          <h1 className="text-xl font-bold tracking-wide">Bibliotheque</h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'sepia' : theme === 'sepia' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-white/10 transition"
            title="تغییر تم"
          >
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-600" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {!activeBook ? (
          /* Library View */
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

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="جستجوی کتاب یا نویسنده..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-amber-500 transition text-sm"
              />
            </div>

            {/* Book Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBooks.map((book) => (
                <div 
                  key={book.id}
                  onClick={() => setActiveBook(book)}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 cursor-pointer transition flex flex-col justify-between group shadow-sm hover:shadow-amber-500/5"
                >
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-amber-500 transition">{book.title}</h3>
                    <p className="text-sm opacity-70 mt-1">{book.author}</p>
                  </div>
                  <div className="flex items-center justify-between mt-6 text-xs opacity-50 border-t border-white/5 pt-3">
                    <span>صفحه {book.currentPage}</span>
                    <ChevronLeft className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Reader View */
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <button 
                onClick={() => setActiveBook(null)}
                className="flex items-center gap-1 text-sm font-medium opacity-80 hover:opacity-100 hover:text-amber-500 transition"
              >
                <ChevronRight className="w-4 h-4" /> بازگشت به کتابخانه
              </button>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="px-2.5 py-1 rounded-lg border border-white/10 text-xs font-bold"
                >
                  A-
                </button>
                <span className="text-xs opacity-70">{fontSize}px</span>
                <button 
                  onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                  className="px-2.5 py-1 rounded-lg border border-white/10 text-xs font-bold"
                >
                  A+
                </button>
              </div>
            </div>

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

      {/* Add Book Modal */}
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
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5"
              >
                انصراف
              </button>
              <button 
                onClick={handleAddBook}
                className="px-4 py-2 rounded-xl text-sm bg-amber-600 hover:bg-amber-700 font-medium"
              >
                ذخیره کتاب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
