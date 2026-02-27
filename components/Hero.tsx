import React, { useState, useEffect } from 'react';
import { Play, Info } from 'lucide-react';
import { Movie } from '../types';

interface HeroProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
}

const Hero: React.FC<HeroProps> = ({ movie, onPlay, onInfo }) => {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoaded(false);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) {
          clearInterval(interval);
          return prev;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [movie.id]);

  return (
    <div className="relative h-[65vh] md:h-[80vh] w-full text-white overflow-hidden bg-black">
      {/* Background Image Loading Overlay */}
      {!loaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
           {/* Shimmer line */}
           <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800 overflow-hidden">
              <div 
                className="h-full bg-red-600 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
           </div>
           <div className="animate-pulse flex flex-col items-center">
              <div className="w-48 h-8 bg-neutral-800 rounded mb-4" />
              <div className="w-32 h-4 bg-neutral-800 rounded mb-2" />
              <div className="w-64 h-4 bg-neutral-800 rounded" />
           </div>
        </div>
      )}

      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full">
        <img 
          src={movie.backdropUrl} 
          alt={movie.title} 
          className={`w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
          fetchPriority="high"
          onLoad={() => {
            setProgress(100);
            setLoaded(true);
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className={`absolute bottom-[15%] md:bottom-[20%] left-4 md:left-12 max-w-xl z-10 p-2 transition-all duration-700 transform ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg mb-4">
          {movie.title}
        </h1>
        <div className="flex items-center space-x-2 text-green-400 font-bold text-sm mb-4">
            <span>{movie.rating}</span>
            <span className="text-gray-300 font-normal">{movie.year}</span>
        </div>
        <p className="text-sm md:text-lg text-gray-200 drop-shadow-md mb-6 line-clamp-3 md:line-clamp-none">
          {movie.description}
        </p>

        <div className="flex space-x-3">
          <button 
            onClick={() => onPlay(movie)}
            className="flex items-center bg-white text-black px-4 py-2 md:px-8 md:py-3 rounded font-bold hover:bg-opacity-80 transition active:scale-95 shadow-lg"
          >
            <Play className="w-5 h-5 mr-2 fill-black" />
            Тоглуулах
          </button>
          <button 
            onClick={() => onInfo(movie)}
            className="flex items-center bg-gray-500 bg-opacity-70 text-white px-4 py-2 md:px-8 md:py-3 rounded font-bold hover:bg-opacity-50 transition active:scale-95 shadow-lg"
          >
            <Info className="w-5 h-5 mr-2" />
            Дэлгэрэнгүй
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;