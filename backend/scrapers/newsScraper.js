/**
 * NewsScraper (RSS-based)
 *
 * Uses Google News RSS search to reliably fetch webMethods-related news.
 */

const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

const RSS_SOURCES = [
  {
    name: 'Google News (webMethods)',
    url: 'https://news.google.com/rss/search?q=webmethods&hl=en-US&gl=US&ceid=US:en'
  },
  {
    name: 'Google News (Software AG webMethods)',
    url: 'https://news.google.com/rss/search?q=%22Software%20AG%22%20webmethods&hl=en-US&gl=US&ceid=US:en'
  }
];

class NewsScraper extends BaseScraper {
  constructor() {
    super('NewsScraper', 'news', 'News (RSS)', RSS_SOURCES.map(s => s.url));
  }

  async scrapeSource() {
    for (const src of RSS_SOURCES) {
      const xml = await this.request(src.url, {
        headers: { Accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8' }
      });

      const $ = cheerio.load(xml, { xmlMode: true });
      $('item').each((_, el) => {
        const title = $(el).find('title').text().trim();
        const link = $(el).find('link').text().trim();
        const pubDate = $(el).find('pubDate').text().trim();
        const source = $(el).find('source').text().trim() || src.name;

        // Description often contains HTML
        const rawDesc = $(el).find('description').text().trim();
        const descText = cheerio.load(rawDesc).text().trim();

        if (!title || !link) return;

        let hostname = 'unknown';
        try { hostname = new URL(link).hostname.replace(/^www\./, ''); } catch {}

        this.addItem({
          type: 'news',
          title,
          url: link,
          description: descText || null,
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
          source: hostname,
          sourceName: source,
          tags: ['news', 'webmethods', 'rss'],
          keywords: this.config.keywords,
          relevanceScore: 50
        });
      });
    }
  }

  parsePage() {
    return [];
  }
}

module.exports = NewsScraper;