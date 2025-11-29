import { parseStringPromise } from 'xml2js';
import { NewsItem } from './types';

export async function fetchRSS(rssUrl: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(rssUrl);

    if (!response.ok) {
      throw new Error(`HTTP hata: ${response.status}`);
    }

    const xmlText = await response.text();
    const result = await parseStringPromise(xmlText, { explicitArray: false });

    const items = result?.rss?.channel?.item;

    if (!items) {
      console.log('RSS\'de haber bulunamadı.');
      return [];
    }

    // Tek item varsa array'e çevir
    const itemArray = Array.isArray(items) ? items : [items];

    return itemArray.map((item: any) => ({
      haberKodu: item.HaberKodu || '',
      ustKategori: item.UstKategori || '',
      kategori: item.Kategori || '',
      sehir: item.Sehir || '',
      sonDakika: item.SonDakika === 'Evet',
      title: item.title || '',
      description: cleanHtml(item.description || ''),
      pubDate: item.pubDate || '',
    }));
  } catch (error) {
    console.error('RSS çekilemedi:', error);
    return [];
  }
}

function cleanHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
