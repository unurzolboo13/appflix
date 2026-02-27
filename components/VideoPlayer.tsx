import React from 'react';
import { X } from 'lucide-react';

interface VideoPlayerProps {
  vimeoId: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ vimeoId, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 z-50"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div className="w-full h-full md:w-[90%] md:h-[90%] relative">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo Player"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlayer;