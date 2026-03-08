import { DataSource } from './types';
import { newsSource } from './news-source';
import { tmdbSource } from './tmdb-source';
import { spoonacularSource } from './spoonacular-source';

export const dataSources: DataSource[] = [newsSource, tmdbSource, spoonacularSource];

export function getDataSource(id: string): DataSource | undefined {
  return dataSources.find(s => s.config.id === id);
}

export * from './types';
