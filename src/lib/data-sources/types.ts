export interface DataSourceConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  freeTierLimit: string;
  fields: ConfigField[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'number' | 'text' | 'daterange';
  options?: { label: string; value: string }[];
  default?: any;
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface RawRecord {
  [key: string]: any;
}

export interface CleanRecord {
  id: string;
  text: string;
  metadata: Record<string, any>;
  source: string;
  timestamp: string;
}

export interface FetchResult {
  records: RawRecord[];
  total: number;
  source: string;
}

export interface DataSource {
  config: DataSourceConfig;
  fetch(params: Record<string, any>): Promise<FetchResult>;
  transform(raw: RawRecord[]): CleanRecord[];
}
