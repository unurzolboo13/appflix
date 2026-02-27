import React, { useState, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';

interface NavbarProps {
  onSearchClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearchClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceholderClick = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    // In a real app, this would filter or navigate.
    // For now, we just indicate interaction.
    console.log(`${name} clicked`);
  };

  return (
    <nav className={`fixed top-0 w-full z-40 transition-colors duration-300 ${isScrolled ? 'bg-netflix-black bg-opacity-90 backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <h1 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-netflix-red text-2xl md:text-3xl font-bold tracking-tighter cursor-pointer select-none"
          >
            flix
          </h1>
          
          {/* Desktop Links (Hidden on mobile) */}
          <div className="hidden md:flex space-x-4 text-sm text-gray-200">
            <a href="#" onClick={handleScrollTop} className="hover:text-white transition font-medium">Нүүр</a>
            <a href="#" onClick={(e) => handlePlaceholderClick(e, 'Series')} className="hover:text-white transition">Цуврал</a>
            <a href="#" onClick={(e) => handlePlaceholderClick(e, 'Movies')} className="hover:text-white transition">Кино</a>
            <a href="#" onClick={(e) => handlePlaceholderClick(e, 'New')} className="hover:text-white transition">Шинэ & Тренд</a>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-white">
          <button onClick={onSearchClick} className="focus:outline-none" title="Search">
            <Search className="w-6 h-6 hover:text-gray-300 transition" />
          </button>
          
          <button className="focus:outline-none" title="Notifications">
            <Bell className="w-6 h-6 hover:text-gray-300 transition hidden sm:block" />
          </button>

          <div 
            className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition"
            title="Profile"
          >
             <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;