export interface NewsItem {
  haberKodu: string;
  ustKategori: string;
  kategori: string;
  sehir: string;
  sonDakika: boolean;
  title: string;
  description: string;
  pubDate: string;
}

export interface CategoryRule {
  ustKategori: string;
  kategori: string;
}

export interface Config {
  rssUrl: string;
  checkIntervalMs: number;
  filters: {
    cities: string[];
    categoryRules: CategoryRule[];
  };
}
