import React from 'react';
import { Movie } from '../types';

interface RowProps {
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const Row: React.FC<RowProps> = ({ title, movies, onMovieClick }) => {
  return (
    <div className="mb-8 px-4 md:px-12">
      <h2 className="text-lg md:text-xl font-semibold text-white mb-3 hover:text-gray-300 cursor-pointer transition">
        {title}
      </h2>
      
      {/* Mobile View: Vertical Grid with Titles */}
      <div className="grid grid-cols-3 gap-3 md:hidden">
        {movies.map((movie) => (
          <div 
            key={movie.id}
            onClick={() => onMovieClick(movie)}
            className="cursor-pointer flex flex-col group"
          >
            <div className="relative aspect-[2/3] w-full">
                <img 
                  src={movie.thumbnailUrl} 
                  alt={movie.title} 
                  className="rounded-md object-cover w-full h-full"
                />
                {/* Optional: Darken on touch/hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-md" />
            </div>
            <p className="text-[10px] text-gray-300 mt-1 line-clamp-2 leading-tight font-medium">
              {movie.title}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop View: Horizontal Scroll with Titles */}
      <div className="hidden md:flex overflow-x-auto space-x-4 pb-4 no-scrollbar scroll-smooth">
        {movies.map((movie) => (
          <div 
            key={movie.id}
            onClick={() => onMovieClick(movie)}
            className="flex-none w-[180px] cursor-pointer flex flex-col group transition-transform duration-300 hover:scale-105"
          >
            <div className="relative w-full h-[270px]">
              <img 
                src={movie.thumbnailUrl} 
                alt={movie.title} 
                className="rounded-md object-cover w-full h-full"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-md" />
            </div>
            
            <p className="mt-2 text-sm text-gray-400 font-medium text-center line-clamp-1 group-hover:text-white transition-colors">
              {movie.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Row;