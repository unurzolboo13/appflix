import React, { useState } from 'react';
import { X, Search as SearchIcon, Sparkles, Loader2 } from 'lucide-react';
import { Movie } from '../types';
import { getGeminiRecommendations } from '../services/geminiService';

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
  allMovies: Movie[];
  onMovieClick: (movie: Movie) => void;
  onAdminUnlock: () => void;
}

const Search: React.FC<SearchProps> = ({ isOpen, onClose, allMovies, onMovieClick, onAdminUnlock }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Check for Admin Command (Case insensitive)
    if (query.trim().toLowerCase() === '/adminstratorweb') {
        onAdminUnlock();
        onClose();
        return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // 1. Basic text filter first (instant)
      const textMatches = allMovies.filter(m => 
        m.title.toLowerCase().includes(query.toLowerCase())
      );

      // 2. Ask Gemini for semantic matches
      const geminiIds = await getGeminiRecommendations(query, allMovies);
      
      const aiMatches = allMovies.filter(m => geminiIds.includes(m.id));

      // Combine and deduplicate
      const combined = [...textMatches, ...aiMatches];
      const uniqueResults = Array.from(new Set(combined.map(m => m.id)))
        .map(id => combined.find(m => m.id === id)!);

      setResults(uniqueResults);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-netflix-black z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-netflix-dark">
        <h2 className="text-white font-bold text-lg">AI Хайлт</h2>
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 md:p-8">
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Та юу үзмээр байна вэ? (Жишээ нь: 'Байгалийн тухай кино')"
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            />
            {isLoading && (
               <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-600 w-5 h-5 animate-spin" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
             <Sparkles className="w-3 h-3 text-yellow-500" /> Powered by Gemini AI
          </p>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {hasSearched && results.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 mt-10">
            Кино олдсонгүй. Өөр үгээр хайгаад үзнэ үү.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {results.map((movie) => (
              <div 
                key={movie.id} 
                onClick={() => {
                  onMovieClick(movie);
                  onClose();
                }}
                className="cursor-pointer group relative"
              >
                <img 
                  src={movie.thumbnailUrl} 
                  alt={movie.title} 
                  className="rounded w-full h-auto aspect-[2/3] object-cover group-hover:opacity-75 transition"
                />
                 <div className="mt-2 text-white text-sm font-medium">{movie.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;