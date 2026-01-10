/**
 * JobScraper (RSS-based)
 *
 * Uses Indeed RSS feeds for "webmethods" jobs (more reliable than scraping HTML).
 */

const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

const JOB_RSS = [
  { name: 'Indeed US (webmethods)', url: 'https://www.indeed.com/rss?q=webmethods' },
  { name: 'Indeed UK (webmethods)', url: 'https://uk.indeed.com/rss?q=webmethods' }
];

function parseJobTitle(title) {
  // Indeed titles are often like: "webMethods Developer - Company - Location"
  const parts = title.split(' - ').map(s => s.trim()).filter(Boolean);
  return {
    role: parts[0] || title,
    company: parts[1] || null,
    location: parts[2] || null
  };
}

class JobScraper extends BaseScraper {
  constructor() {
    super('JobScraper', 'job', 'Jobs (RSS)', JOB_RSS.map(s => s.url));
  }

  async scrapeSource() {
    for (const src of JOB_RSS) {
      const xml = await this.request(src.url, {
        headers: { Accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8' }
      });

      const $ = cheerio.load(xml, { xmlMode: true });
      $('item').each((_, el) => {
        const title = $(el).find('title').text().trim();
        const link = $(el).find('link').text().trim();
        const pubDate = $(el).find('pubDate').text().trim();
        const rawDesc = $(el).find('description').text().trim();
        const descText = cheerio.load(rawDesc).text().trim();

        if (!title || !link) return;

        let hostname = 'unknown';
        try { hostname = new URL(link).hostname.replace(/^www\./, ''); } catch {}

        const parsed = parseJobTitle(title);

        this.addItem({
          type: 'job',
          title: parsed.role,
          url: link,
          description: descText || null,
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
          source: hostname,
          sourceName: src.name,
          tags: ['job', 'webmethods', 'rss'],
          keywords: this.config.keywords,
          relevanceScore: 60,
          jobDetails: {
            company: parsed.company,
            location: parsed.location,
            applyUrl: link,
            remote: /remote/i.test(descText)
          }
        });
      });
    }
  }

  parsePage() {
    return [];
  }
}

module.exports = JobScraper;