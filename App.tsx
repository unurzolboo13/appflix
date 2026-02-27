import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieModal from './components/MovieModal';
import VideoPlayer from './components/VideoPlayer';
import Search from './components/Search';
import AdminPanel from './components/AdminPanel';
import { Movie } from './types';
import { flixService } from './services/flixService';
import { MOCK_MOVIES } from './constants';
import { Loader2 } from 'lucide-react';

// --- Loading Placeholder for a single card with 0-100% counter ---
const SkeletonCard = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col animate-pulse">
      <div className="relative aspect-[2/3] w-full bg-neutral-900 rounded-md overflow-hidden flex flex-col items-center justify-center border border-neutral-800">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[shimmer_1.5s_infinite]" />
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-red-600/20 border-t-red-600 animate-spin mb-2" />
            <span className="text-[14px] text-white font-mono font-bold">{progress}%</span>
        </div>
      </div>
      <div className="h-3 w-3/4 bg-neutral-800 rounded mt-2" />
    </div>
  );
};

// --- Sub-component for individual movie cards with image loading logic ---
const MovieCard: React.FC<{ movie: Movie; onClick: (movie: Movie) => void }> = ({ movie, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setProgress(100);
      setLoaded(true);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 15) + 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [movie.thumbnailUrl]);

  return (
    <div 
      onClick={() => onClick(movie)}
      className="cursor-pointer flex flex-col group transition-transform duration-300 hover:scale-105"
    >
      <div className="relative aspect-[2/3] w-full bg-neutral-900 rounded-md overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_1.2s_infinite]" />
            <div className="relative z-20 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border-2 border-red-600/20 border-t-red-600 animate-spin mb-2" />
              <span className="text-[12px] text-white font-mono font-bold drop-shadow-md">{progress}%</span>
            </div>
          </div>
        )}
        
        <img 
          ref={imgRef}
          src={movie.thumbnailUrl} 
          alt={movie.title} 
          className={`object-cover w-full h-full transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => {
            setProgress(100);
            setLoaded(true);
          }}
          onError={() => setLoaded(true)}
          loading="lazy"
        />
      </div>
      <p className="mt-2 text-[11px] md:text-sm text-gray-300 font-semibold line-clamp-2 leading-tight">
        {movie.title}
      </p>
    </div>
  );
};

function App() {
  const [movies, setMovies] = useState<Movie[]>([]); // Start empty to show skeletons
  const [allMoviesForSearch, setAllMoviesForSearch] = useState<Movie[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initFetch = async () => {
      try {
        // Changed to load 6 movies initially for faster response
        const { movies: initialBatch, lastDoc } = await flixService.getInitialMovies(6);
        if (initialBatch.length > 0) {
          setTimeout(() => {
            setMovies(initialBatch);
            setLastVisibleDoc(lastDoc);
            setIsInitialLoading(false);
          }, 800);
        } else {
          // If collection is empty, automatically upload initial data to "flix"
          console.log("Collection empty, initializing flix...");
          await flixService.uploadMovies();
          const { movies: newBatch, lastDoc: newLastDoc } = await flixService.getInitialMovies(6);
          setMovies(newBatch.length > 0 ? newBatch : MOCK_MOVIES.slice(0, 6));
          setLastVisibleDoc(newLastDoc);
          setHasMore(newBatch.length > 0);
          setIsInitialLoading(false);
        }
        const all = await flixService.getAllMovies();
        setAllMoviesForSearch(all);
      } catch (error) {
        console.error("Fetch failed:", error);
        setMovies(MOCK_MOVIES.slice(0, 6));
        setIsInitialLoading(false);
      }
    };

    initFetch();

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#000000');
    }
    
    if (window.location.hash === '#adminstratorweb') setIsAdmin(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isInitialLoading) {
        fetchNextBatch();
      }
    }, { threshold: 0.1 });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, lastVisibleDoc, isInitialLoading]);

  const fetchNextBatch = async () => {
    if (!lastVisibleDoc || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const { movies: nextBatch, lastDoc } = await flixService.getMoreMovies(lastVisibleDoc, 4);
      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setMovies(prev => [...prev, ...nextBatch]);
        setLastVisibleDoc(lastDoc);
      }
    } catch (error) {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleMovieClick = (movie: Movie) => setSelectedMovie(movie);
  const handlePlay = (movie: Movie) => { setSelectedMovie(null); setPlayingMovie(movie); };

  if (isAdmin) {
    return (
        <AdminPanel 
            movies={allMoviesForSearch.length > 0 ? allMoviesForSearch : movies} 
            onAddMovie={async (m) => { setMovies(prev => [m, ...prev]); await flixService.addMovie(m); }} 
            onUpdateMovie={async (m) => { setMovies(prev => prev.map(old => old.id === m.id ? m : old)); await flixService.updateMovie(m); }}
            onDeleteMovie={async (id) => { setMovies(prev => prev.filter(m => m.id !== id)); await flixService.deleteMovie(id); }}
            onClose={() => setIsAdmin(false)}
        />
    );
  }

  return (
    <div className="relative min-h-screen bg-netflix-black text-white font-sans selection:bg-red-600 selection:text-white pb-10">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />

      <main>
        {/* Initial Loading or Hero Section */}
        {isInitialLoading || movies.length === 0 ? (
          <div className="h-[65vh] md:h-[80vh] w-full bg-neutral-900 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
             <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-red-600/20 border-t-red-600 animate-spin mb-4" />
                <p className="text-xl font-bold text-gray-400">Өгөгдлийг уншиж байна...</p>
             </div>
          </div>
        ) : (
          <Hero 
            movie={movies[0]} 
            onPlay={handlePlay}
            onInfo={handleMovieClick}
          />
        )}

        <div className="relative z-10 -mt-10 px-4 md:px-12 pb-12">
            <h2 className="text-lg font-bold mb-4 text-gray-200">Таны сонирхолд</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                {isInitialLoading ? (
                    // Show 6 skeleton cards with progress to match initial fetch
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ))
                )}
            </div>

            <div ref={loadMoreRef} className="w-full flex flex-col items-center justify-center py-12">
                {isLoadingMore && (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                        <p className="text-xs text-gray-500 animate-pulse">Дараагийн хэсгийг уншиж байна...</p>
                    </div>
                )}
            </div>
        </div>
      </main>

      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
          onPlay={handlePlay} 
        />
      )}

      {playingMovie && (
        <VideoPlayer 
          vimeoId={playingMovie.vimeoId} 
          onClose={() => setPlayingMovie(null)} 
        />
      )}

      <Search 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        allMovies={allMoviesForSearch.length > 0 ? allMoviesForSearch : movies}
        onMovieClick={handleMovieClick}
        onAdminUnlock={() => setIsAdmin(true)}
      />
      
      <footer className="mt-10 px-12 py-8 text-gray-500 text-sm text-center border-t border-gray-900">
        <p>&copy; 2024 flix.</p>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(12deg); }
          100% { transform: translateX(200%) skewX(12deg); }
        }
      `}</style>
    </div>
  );
}

export default App;