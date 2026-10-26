import React, { useState } from 'react';
import { INITIAL_LIBRARY_BOOKS } from '../../lib/mockData';
import { LibraryBook } from '../../types';
import { 
  BookOpen, 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  BookMarked
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const LibraryPortal: React.FC = () => {
  const [books, setBooks] = useState<LibraryBook[]>(INITIAL_LIBRARY_BOOKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [reservedBookIds, setReservedBookIds] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  const categories = ['All', 'Computer Science', 'Software Engineering', 'Artificial Intelligence', 'Programming Languages', 'Distributed Systems'];

  const filtered = books.filter(b => {
    if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleReserveBook = (book: LibraryBook) => {
    if (reservedBookIds.includes(book.id)) {
      addNotification(
        'Library Notice',
        `You already have an active reservation for "${book.title}". Pick it up at the circulation counter.`,
        'alert'
      );
      return;
    }

    setReservedBookIds([...reservedBookIds, book.id]);
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b));
    addNotification(
      'Library Reservation Confirmed',
      `Hold placed on "${book.title}". Pick up within 24 hours at Central Library Desk with OTP #LIB-${Math.floor(1000 + Math.random() * 9000)}.`,
      'academic'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              Central Digital Library & OPAC
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Dr. APJ Abdul Kalam Central Library
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Search over 65,000 print volumes, 120,000 IEEE/Springer e-journals & reserve physical copies
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-navy-950/70 p-3.5 rounded-2xl border border-navy-700 text-xs">
              <p className="text-slate-400 font-medium">Standard Hours:</p>
              <p className="font-bold text-white mt-0.5">08:00 AM — 11:00 PM</p>
              <p className="text-brand-cyan text-[10px] font-semibold mt-0.5">24x7 During Examination Months</p>
            </div>
          </div>
        </div>

        {/* Search Bar in Banner */}
        <div className="mt-6 pt-5 border-t border-navy-800">
          <div className="relative">
            <Search className="w-5 h-5 text-brand-cyan absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog by Book Title, Author Name, or ISBN..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 text-white placeholder-slate-400 border border-white/20 focus:outline-none focus:border-brand-cyan text-sm"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-brand-cyan text-navy-950 shadow-sm'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Books Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((book) => {
          const isReserved = reservedBookIds.includes(book.id);
          const hasCopies = book.availableCopies > 0;

          return (
            <div
              key={book.id}
              className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:border-brand-cyan/60 hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded-xl shadow-md border border-slate-200 dark:border-navy-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                      {book.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1 leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      By: {book.author}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-navy-800">
                  <div className="flex justify-between">
                    <span>ISBN:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{book.isbn}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shelf Location:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-brand-cyan" />
                      <span>{book.shelfLocation}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Availability:</span>
                    <span className={`font-bold ${hasCopies ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {hasCopies ? `${book.availableCopies} / ${book.totalCopies} Available` : 'All Copies Checked Out'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  onClick={() => handleReserveBook(book)}
                  disabled={!hasCopies || isReserved}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    isReserved
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                      : hasCopies
                      ? 'bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>{isReserved ? 'Reserved (Pickup OTP Ready)' : hasCopies ? 'Reserve Copy' : 'Join Waitlist'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
