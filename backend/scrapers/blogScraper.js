/**
 * BlogScraper (RSS-based)
 *
 * Uses Medium RSS feeds (tag feeds) to reliably fetch blog posts.
 */

const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

const BLOG_RSS = [
  { name: 'Medium tag: webmethods', url: 'https://medium.com/feed/tag/webmethods' },
  { name: 'Medium tag: integration', url: 'https://medium.com/feed/tag/integration' }
];

class BlogScraper extends BaseScraper {
  constructor() {
    super('BlogScraper', 'blog', 'Blogs (RSS)', BLOG_RSS.map(s => s.url));
  }

  async scrapeSource() {
    for (const src of BLOG_RSS) {
      const xml = await this.request(src.url, {
        headers: { Accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8' }
      });

      const $ = cheerio.load(xml, { xmlMode: true });
      $('item').each((_, el) => {
        const title = $(el).find('title').text().trim();
        const link = $(el).find('link').text().trim();
        const pubDate = $(el).find('pubDate').text().trim();

        // Medium puts HTML into content:encoded sometimes
        const rawContent = $(el).find('content\\:encoded').text().trim() || $(el).find('description').text().trim();
        const descText = cheerio.load(rawContent).text().trim().slice(0, 400);

        if (!title || !link) return;

        let hostname = 'unknown';
        try { hostname = new URL(link).hostname.replace(/^www\./, ''); } catch {}

        const author = $(el).find('dc\\:creator').text().trim();

        this.addItem({
          type: 'blog',
          title,
          url: link,
          description: descText || null,
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
          source: hostname,
          sourceName: src.name,
          author: author ? { name: author } : undefined,
          tags: ['blog', 'rss', 'medium'],
          keywords: this.config.keywords,
          relevanceScore: 55
        });
      });
    }
  }

  parsePage() {
    return [];
  }
}

module.exports = BlogScraper;