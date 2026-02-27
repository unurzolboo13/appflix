import React, { useState } from 'react';
import { X, Play, Plus, ThumbsUp, Check, Share2 } from 'lucide-react';
import { Movie } from '../types';

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, onClose, onPlay }) => {
  const [inList, setInList] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!movie) return null;

  const toggleList = () => setInList(!inList);
  const toggleLike = () => setLiked(!liked);

  const handleShare = () => {
    // 1. Try Telegram WebApp Share
    if (window.Telegram?.WebApp?.switchInlineQuery) {
        window.Telegram.WebApp.switchInlineQuery(movie.title, ['users', 'groups', 'channels']);
        return;
    }

    // 2. Try Native Browser Share
    if (navigator.share) {
        navigator.share({
            title: movie.title,
            text: `Watch ${movie.title} on flix!`,
            url: 'https://t.me/flex_ex_bot/okey'
        }).catch((e) => console.log('Share dismissed', e));
        return;
    }

    // 3. Fallback to Clipboard
    navigator.clipboard.writeText(`Watch ${movie.title} here: https://t.me/flex_ex_bot/okey`)
        .then(() => alert('Холбоос хуулагдлаа! (Link copied)'))
        .catch(() => alert('Failed to copy link'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative bg-netflix-dark w-full max-w-3xl rounded-lg overflow-hidden shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-3 right-3 z-20 bg-black bg-opacity-50 rounded-full p-1.5 text-white hover:bg-white hover:text-black transition"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Header Image */}
            <div className="relative h-64 md:h-96 w-full">
                <img 
                    src={movie.backdropUrl} 
                    alt={movie.title} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark to-transparent" />
                
                <div className="absolute bottom-6 left-6 md:left-10 w-3/4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{movie.title}</h2>
                    <div className="flex items-center space-x-3">
                         <button 
                            onClick={() => onPlay(movie)}
                            className="flex items-center bg-white text-black px-6 py-2 rounded font-bold hover:bg-opacity-80 transition"
                        >
                            <Play className="w-5 h-5 mr-2 fill-black" />
                            Тоглуулах
                        </button>
                        
                        {/* My List Button */}
                        <button 
                            onClick={toggleList}
                            className={`p-2 border rounded-full transition ${inList ? 'border-green-500 text-green-500 hover:text-green-400' : 'border-gray-400 text-gray-300 hover:border-white hover:text-white'}`}
                            title={inList ? "Remove from My List" : "Add to My List"}
                        >
                            {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>

                        {/* Like Button */}
                        <button 
                            onClick={toggleLike}
                            className={`p-2 border rounded-full transition ${liked ? 'border-red-600 text-red-600 hover:text-red-500' : 'border-gray-400 text-gray-300 hover:border-white hover:text-white'}`}
                            title={liked ? "Unlike" : "Like"}
                        >
                            <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                        </button>

                        {/* Share Button */}
                        <button 
                            onClick={handleShare}
                            className="p-2 border border-gray-400 rounded-full text-gray-300 hover:border-white hover:text-white transition"
                            title="Share"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Body */}
            <div className="p-6 md:p-10 flex flex-col md:flex-row gap-6">
                <div className="flex-1 text-white">
                    <div className="flex items-center space-x-3 mb-4 text-sm md:text-base">
                        <span className="text-green-400 font-bold">{movie.rating}</span>
                        <span className="text-gray-400">{movie.year}</span>
                        <span className="border border-gray-500 px-1 text-xs rounded text-gray-400">HD</span>
                        <span className="text-gray-400">{movie.duration}</span>
                    </div>
                    <p className="text-gray-300 text-sm md:text-lg leading-relaxed mb-4">
                        {movie.description}
                    </p>
                </div>
                
                <div className="w-full md:w-1/3 text-sm text-gray-400">
                    <div className="mb-2">
                        <span className="text-gray-500">Төрөл: </span>
                        <span className="text-white">{movie.genre.join(', ')}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Хэл: </span>
                        <span className="text-white">Монгол / Англи</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MovieModal;