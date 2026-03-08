import { DataSource, DataSourceConfig, RawRecord, CleanRecord, FetchResult } from './types';

const config: DataSourceConfig = {
  id: 'newsapi',
  name: 'NewsAPI',
  icon: 'Newspaper',
  description: 'Global news articles from 80,000+ sources. Headlines, descriptions, and full content with sentiment labels.',
  color: 'hsl(239 84% 67%)',
  freeTierLimit: '100 requests/day',
  fields: [
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Technology', value: 'technology' },
        { label: 'Business', value: 'business' },
        { label: 'Science', value: 'science' },
        { label: 'Health', value: 'health' },
        { label: 'Sports', value: 'sports' },
        { label: 'Entertainment', value: 'entertainment' },
      ],
      default: 'technology',
    },
    {
      key: 'language',
      label: 'Language',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
      ],
      default: 'en',
    },
    {
      key: 'limit',
      label: 'Number of articles',
      type: 'number',
      default: 50,
      min: 10,
      max: 500,
    },
  ],
};

const MOCK_HEADLINES = [
  'AI Startup Raises $200M in Series C Funding',
  'New Study Reveals Climate Change Accelerating Faster Than Expected',
  'Tech Giants Report Record Quarterly Earnings',
  'Breakthrough in Quantum Computing Achieved by Research Team',
  'Global Markets Rally After Central Bank Announcement',
  'Autonomous Vehicles Pass Major Safety Milestone',
  'New Renewable Energy Source Discovered in Deep Ocean',
  'Space Agency Announces Plans for Mars Colony by 2040',
  'Cryptocurrency Regulation Framework Proposed by EU',
  'Revolutionary Medical Treatment Shows 95% Success Rate',
  'Social Media Platform Launches AI-Powered Content Moderation',
  'Electric Aviation Startup Completes First Commercial Flight',
  'Biodegradable Plastics Breakthrough Could End Ocean Pollution',
  'Cybersecurity Firm Uncovers Massive Data Breach',
  'Gene Therapy Approved for Rare Genetic Disorder',
];

const SOURCES = ['TechCrunch', 'Reuters', 'Bloomberg', 'The Verge', 'Wired', 'BBC', 'CNN', 'ArsTechnica'];
const SENTIMENTS = ['positive', 'negative', 'neutral'];
const CATEGORIES_MAP: Record<string, string[]> = {
  technology: ['AI', 'Cloud', 'Robotics', 'Cybersecurity', 'IoT'],
  business: ['Finance', 'Startups', 'Markets', 'M&A', 'IPO'],
  science: ['Physics', 'Biology', 'Chemistry', 'Space', 'Environment'],
  health: ['Medicine', 'Nutrition', 'Mental Health', 'Fitness', 'Research'],
  sports: ['Football', 'Basketball', 'Tennis', 'Olympics', 'eSports'],
  entertainment: ['Movies', 'Music', 'Gaming', 'Streaming', 'Celebrity'],
};

function generateMockArticle(index: number, category: string): RawRecord {
  const headline = MOCK_HEADLINES[index % MOCK_HEADLINES.length];
  const source = SOURCES[index % SOURCES.length];
  const sentiment = SENTIMENTS[index % 3];
  const tags = CATEGORIES_MAP[category] || CATEGORIES_MAP.technology;
  const date = new Date(Date.now() - Math.random() * 30 * 86400000);

  return {
    title: headline,
    description: `${headline}. This is a detailed description of the article covering the latest developments in ${category}. Experts weigh in on the implications and potential outcomes.`,
    content: `${headline}\n\nIn a groundbreaking development, ${source} reports that significant progress has been made in the ${category} sector. Industry experts have noted that this represents a pivotal moment for the field.\n\n"This is truly remarkable," said Dr. Jane Smith, a leading researcher. "We haven't seen anything like this in decades."\n\nThe implications of this development are far-reaching, affecting both consumers and businesses alike. Market analysts predict substantial growth in related industries over the coming years.\n\nAdditional reporting suggests that several major companies are already positioning themselves to capitalize on these changes, with investment flowing at unprecedented levels.`,
    source,
    publishedAt: date.toISOString(),
    url: `https://${source.toLowerCase().replace(/\s/g, '')}.com/article/${index}`,
    sentiment,
    category,
    tags: [tags[index % tags.length], tags[(index + 1) % tags.length]],
    wordCount: 150 + Math.floor(Math.random() * 500),
    readTime: Math.ceil((150 + Math.floor(Math.random() * 500)) / 200),
  };
}

export const newsSource: DataSource = {
  config,
  async fetch(params) {
    const limit = params.limit || 50;
    const category = params.category || 'technology';
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    const records: RawRecord[] = [];
    for (let i = 0; i < limit; i++) {
      records.push(generateMockArticle(i, category));
    }
    return { records, total: limit, source: 'newsapi' };
  },
  transform(raw) {
    return raw.map((r, i) => ({
      id: `news-${i}-${Date.now()}`,
      text: `${r.title}\n\n${r.content}`,
      metadata: {
        headline: r.title,
        description: r.description,
        source: r.source,
        sentiment: r.sentiment,
        category: r.category,
        tags: r.tags,
        wordCount: r.wordCount,
        readTime: r.readTime,
        url: r.url,
      },
      source: 'NewsAPI',
      timestamp: r.publishedAt,
    }));
  },
};
