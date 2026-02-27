export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  backdropUrl: string;
  vimeoId: string;
  genre: string[];
  year: number;
  duration: string;
  rating: string;
}

export interface Category {
  title: string;
  movies: Movie[];
}

declare global {
  interface Window {
    Telegram: any;
  }
}