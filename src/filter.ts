import { NewsItem, Config } from './types';

export function filterNews(news: NewsItem[], config: Config): NewsItem[] {
  const { cities, categoryRules } = config.filters;

  return news.filter((item) => {
    // Şehir eşleşmesi (case-insensitive)
    const cityMatch = cities.some(
      (city) => item.sehir.toUpperCase() === city.toUpperCase()
    );

    // Kategori kuralı eşleşmesi (üst kategori + kategori birlikte)
    const categoryMatch = categoryRules.some(
      (rule) =>
        item.ustKategori.toUpperCase() === rule.ustKategori.toUpperCase() &&
        item.kategori.toUpperCase() === rule.kategori.toUpperCase()
    );

    // VEYA mantığı: şehir VEYA (üstKategori+kategori) eşleşirse al
    return cityMatch || categoryMatch;
  });
}
