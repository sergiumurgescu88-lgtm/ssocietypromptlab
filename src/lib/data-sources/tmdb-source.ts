import { DataSource, DataSourceConfig, RawRecord, CleanRecord, FetchResult } from './types';

const config: DataSourceConfig = {
  id: 'tmdb',
  name: 'TMDB',
  icon: 'Film',
  description: 'Movie and TV show metadata from The Movie Database. Plots, genres, ratings, and cast information.',
  color: 'hsl(150 60% 45%)',
  freeTierLimit: '40 requests/10s',
  fields: [
    {
      key: 'genre',
      label: 'Genre',
      type: 'select',
      options: [
        { label: 'Action', value: 'action' },
        { label: 'Comedy', value: 'comedy' },
        { label: 'Drama', value: 'drama' },
        { label: 'Sci-Fi', value: 'scifi' },
        { label: 'Horror', value: 'horror' },
        { label: 'Documentary', value: 'documentary' },
      ],
      default: 'scifi',
    },
    {
      key: 'type',
      label: 'Content Type',
      type: 'select',
      options: [
        { label: 'Movies', value: 'movie' },
        { label: 'TV Shows', value: 'tv' },
      ],
      default: 'movie',
    },
    {
      key: 'limit',
      label: 'Number of items',
      type: 'number',
      default: 50,
      min: 10,
      max: 300,
    },
  ],
};

const MOVIE_TITLES = [
  'Stellar Horizons', 'The Last Algorithm', 'Neon Shadows', 'Echoes of Tomorrow',
  'Quantum Drift', 'Iron Pulse', 'Crimson Protocol', 'Silent Frequency',
  'Digital Nomad', 'Paradox Engine', 'Void Walker', 'Chrome Heart',
  'Binary Sunset', 'The Forgotten Code', 'Omega Station',
];

const PLOTS = [
  'In a dystopian future where AI controls society, a group of rebels discovers a hidden algorithm that could restore humanity\'s free will.',
  'A brilliant scientist accidentally opens a portal to a parallel universe, unleashing creatures that threaten to destroy both worlds.',
  'When a mysterious signal is detected from deep space, an international crew embarks on a dangerous mission to find its source.',
  'A retired detective is drawn back into a web of conspiracy when evidence from an old case resurfaces with alarming implications.',
  'Two strangers discover they share the same recurring dream, leading them on a journey to uncover a truth that defies explanation.',
];

const ACTORS = ['Emma Stone', 'Oscar Isaac', 'Florence Pugh', 'Pedro Pascal', 'Zendaya', 'Timothée Chalamet'];
const DIRECTORS = ['Denis Villeneuve', 'Greta Gerwig', 'Jordan Peele', 'Chloé Zhao', 'Bong Joon-ho'];
const KEYWORDS = ['dystopia', 'technology', 'survival', 'conspiracy', 'identity', 'time-travel', 'AI', 'space'];

function generateMockMovie(index: number, genre: string): RawRecord {
  const title = MOVIE_TITLES[index % MOVIE_TITLES.length];
  const year = 2020 + Math.floor(Math.random() * 6);
  const rating = (5 + Math.random() * 4.5).toFixed(1);

  return {
    title: `${title}${index > 14 ? ` ${Math.floor(index / 15) + 1}` : ''}`,
    overview: PLOTS[index % PLOTS.length],
    genre,
    rating: parseFloat(rating),
    voteCount: 100 + Math.floor(Math.random() * 5000),
    releaseDate: `${year}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
    runtime: 85 + Math.floor(Math.random() * 90),
    cast: [ACTORS[index % ACTORS.length], ACTORS[(index + 1) % ACTORS.length]],
    director: DIRECTORS[index % DIRECTORS.length],
    keywords: [KEYWORDS[index % KEYWORDS.length], KEYWORDS[(index + 2) % KEYWORDS.length]],
    posterUrl: `https://image.tmdb.org/t/p/w500/placeholder${index}.jpg`,
    budget: (10 + Math.floor(Math.random() * 190)) * 1000000,
    revenue: (20 + Math.floor(Math.random() * 800)) * 1000000,
  };
}

export const tmdbSource: DataSource = {
  config,
  async fetch(params) {
    const limit = params.limit || 50;
    const genre = params.genre || 'scifi';

    await new Promise(r => setTimeout(r, 600 + Math.random() * 1000));

    const records: RawRecord[] = [];
    for (let i = 0; i < limit; i++) {
      records.push(generateMockMovie(i, genre));
    }
    return { records, total: limit, source: 'tmdb' };
  },
  transform(raw) {
    return raw.map((r, i) => ({
      id: `tmdb-${i}-${Date.now()}`,
      text: `${r.title}\n\n${r.overview}`,
      metadata: {
        title: r.title,
        plot: r.overview,
        genre: r.genre,
        rating: r.rating,
        voteCount: r.voteCount,
        releaseDate: r.releaseDate,
        runtime: r.runtime,
        cast: r.cast,
        director: r.director,
        keywords: r.keywords,
        budget: r.budget,
        revenue: r.revenue,
      },
      source: 'TMDB',
      timestamp: r.releaseDate,
    }));
  },
};
