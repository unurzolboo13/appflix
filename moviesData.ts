import { Movie } from './types';

export const moviesData: Movie[] = [
  {
    id: '1',
    title: 'Example Movie',
    description: 'This is an example movie description.',
    thumbnailUrl: 'https://via.placeholder.com/300x450',
    backdropUrl: 'https://via.placeholder.com/1920x1080',
    vimeoId: '76979871',
    genre: ['Drama', 'Action'],
    year: 2023,
    duration: '1h 30m',
    rating: 'PG-13'
  },
  {
    id: '2',
    title: 'Another Movie',
    description: 'Another example movie.',
    thumbnailUrl: 'https://via.placeholder.com/300x450',
    backdropUrl: 'https://via.placeholder.com/1920x1080',
    vimeoId: '76979871',
    genre: ['Comedy'],
    year: 2022,
    duration: '1h 45m',
    rating: 'PG'
  }
];
