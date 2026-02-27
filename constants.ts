import { Movie, Category } from './types';
import { moviesData } from './moviesData';

// We now load the initial data from moviesData.ts
export const MOCK_MOVIES: Movie[] = moviesData as Movie[];

export const CATEGORIES: Category[] = [
  {
    title: 'Тренд болж буй',
    movies: MOCK_MOVIES.slice(0, 5)
  },
  {
    title: 'Шинэ бүтээлүүд',
    movies: [...MOCK_MOVIES].reverse().slice(0, 5)
  },
  {
    title: 'Хамгийн их үзэлттэй',
    movies: MOCK_MOVIES.filter((_, i) => i % 2 === 0).slice(0, 5)
  }
];

export const HERO_MOVIE = MOCK_MOVIES[1];