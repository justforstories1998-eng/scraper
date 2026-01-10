/**
 * User Agent Utility
 * 
 * Provides a collection of real browser user agents for web scraping.
 * Rotating user agents helps avoid detection and blocking by target websites.
 */

// ===========================================
// User Agent Collections
// ===========================================

/**
 * Desktop Browser User Agents
 * Collection of modern desktop browser user agents
 */
const desktopUserAgents = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  
  // Chrome on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  
  // Chrome on Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
  
  // Firefox on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:121.0) Gecko/20100101 Firefox/121.0',
  
  // Firefox on Linux
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  
  // Safari on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  
  // Edge on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  
  // Edge on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  
  // Opera on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
  
  // Brave on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/120'
];

/**
 * Mobile Browser User Agents
 * Collection of modern mobile browser user agents
 */
const mobileUserAgents = [
  // Chrome on Android
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
  
  // Safari on iOS
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  
  // Firefox on Android
  'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
  'Mozilla/5.0 (Android 13; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
  
  // Samsung Internet
  'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
  
  // Edge on Android
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36 EdgA/120.0.2210.89'
];

/**
 * Bot/Crawler User Agents (for testing or special cases)
 * These are generally NOT recommended for scraping
 */
const botUserAgents = [
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)'
];

/**
 * All user agents combined (desktop priority)
 */
const allUserAgents = [...desktopUserAgents, ...mobileUserAgents];

// ===========================================
// User Agent Rotation State
// ===========================================

let currentIndex = 0;
let lastUsedAgent = null;
let usageStats = new Map();

// ===========================================
// User Agent Functions
// ===========================================

/**
 * Get a random user agent from the specified collection
 * @param {string} type - Type of user agent: 'desktop', 'mobile', 'all', 'bot'
 * @returns {string} Random user agent string
 */
const getRandomUserAgent = (type = 'all') => {
  let agents;
  
  switch (type.toLowerCase()) {
    case 'desktop':
      agents = desktopUserAgents;
      break;
    case 'mobile':
      agents = mobileUserAgents;
      break;
    case 'bot':
      agents = botUserAgents;
      break;
    case 'all':
    default:
      agents = allUserAgents;
  }
  
  const randomIndex = Math.floor(Math.random() * agents.length);
  const agent = agents[randomIndex];
  
  // Track usage
  trackUsage(agent);
  lastUsedAgent = agent;
  
  return agent;
};

/**
 * Get the next user agent in rotation (round-robin)
 * @param {string} type - Type of user agent
 * @returns {string} Next user agent string
 */
const getNextUserAgent = (type = 'all') => {
  let agents;
  
  switch (type.toLowerCase()) {
    case 'desktop':
      agents = desktopUserAgents;
      break;
    case 'mobile':
      agents = mobileUserAgents;
      break;
    case 'all':
    default:
      agents = allUserAgents;
  }
  
  const agent = agents[currentIndex % agents.length];
  currentIndex++;
  
  // Track usage
  trackUsage(agent);
  lastUsedAgent = agent;
  
  return agent;
};

/**
 * Get a different user agent than the last one used
 * Useful for avoiding patterns
 * @param {string} type - Type of user agent
 * @returns {string} Different user agent string
 */
const getDifferentUserAgent = (type = 'all') => {
  let agent = getRandomUserAgent(type);
  let attempts = 0;
  const maxAttempts = 10;
  
  while (agent === lastUsedAgent && attempts < maxAttempts) {
    agent = getRandomUserAgent(type);
    attempts++;
  }
  
  return agent;
};

/**
 * Get user agent based on target domain
 * Some sites work better with specific browsers
 * @param {string} domain - Target domain
 * @returns {string} Appropriate user agent
 */
const getUserAgentForDomain = (domain) => {
  const domainLower = domain.toLowerCase();
  
  // Google properties work well with Chrome
  if (domainLower.includes('google') || domainLower.includes('youtube')) {
    return getRandomUserAgent('desktop');
  }
  
  // LinkedIn prefers modern browsers
  if (domainLower.includes('linkedin')) {
    return desktopUserAgents[0]; // Latest Chrome
  }
  
  // Twitter/X works with most browsers
  if (domainLower.includes('twitter') || domainLower.includes('x.com')) {
    return getRandomUserAgent('desktop');
  }
  
  // Indeed job site
  if (domainLower.includes('indeed')) {
    return getRandomUserAgent('desktop');
  }
  
  // Default: random desktop agent
  return getRandomUserAgent('desktop');
};

/**
 * Track usage statistics for a user agent
 * @param {string} agent - User agent string
 */
const trackUsage = (agent) => {
  const count = usageStats.get(agent) || 0;
  usageStats.set(agent, count + 1);
};

/**
 * Get usage statistics
 * @returns {Object} Usage statistics
 */
const getUsageStats = () => {
  const stats = {
    totalRequests: 0,
    uniqueAgents: usageStats.size,
    distribution: []
  };
  
  usageStats.forEach((count, agent) => {
    stats.totalRequests += count;
    stats.distribution.push({
      agent: agent.substring(0, 50) + '...',
      count
    });
  });
  
  // Sort by count descending
  stats.distribution.sort((a, b) => b.count - a.count);
  
  return stats;
};

/**
 * Reset usage statistics
 */
const resetUsageStats = () => {
  usageStats.clear();
  currentIndex = 0;
  lastUsedAgent = null;
};

/**
 * Parse user agent string to extract browser info
 * @param {string} userAgent - User agent string
 * @returns {Object} Parsed browser information
 */
const parseUserAgent = (userAgent) => {
  const info = {
    browser: 'Unknown',
    version: 'Unknown',
    os: 'Unknown',
    mobile: false
  };
  
  // Detect browser
  if (userAgent.includes('Firefox/')) {
    info.browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.?\d*)/);
    if (match) info.version = match[1];
  } else if (userAgent.includes('Edg/') || userAgent.includes('EdgA/')) {
    info.browser = 'Edge';
    const match = userAgent.match(/Edg[A]?\/(\d+\.?\d*)/);
    if (match) info.version = match[1];
  } else if (userAgent.includes('OPR/')) {
    info.browser = 'Opera';
    const match = userAgent.match(/OPR\/(\d+\.?\d*)/);
    if (match) info.version = match[1];
  } else if (userAgent.includes('Chrome/')) {
    info.browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.?\d*)/);
    if (match) info.version = match[1];
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    info.browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.?\d*)/);
    if (match) info.version = match[1];
  }
  
  // Detect OS
  if (userAgent.includes('Windows NT 10')) info.os = 'Windows 10';
  else if (userAgent.includes('Windows NT 11')) info.os = 'Windows 11';
  else if (userAgent.includes('Mac OS X')) info.os = 'macOS';
  else if (userAgent.includes('Linux')) info.os = 'Linux';
  else if (userAgent.includes('Android')) info.os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) info.os = 'iOS';
  
  // Detect mobile
  info.mobile = userAgent.includes('Mobile') || 
                userAgent.includes('Android') || 
                userAgent.includes('iPhone');
  
  return info;
};

/**
 * Get common HTTP headers to accompany user agent
 * @param {string} userAgent - User agent string
 * @returns {Object} HTTP headers object
 */
const getHeadersForUserAgent = (userAgent) => {
  const parsed = parseUserAgent(userAgent);
  
  const headers = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
  };
  
  // Add browser-specific headers
  if (parsed.browser === 'Chrome' || parsed.browser === 'Edge') {
    headers['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120"';
    headers['Sec-Ch-Ua-Mobile'] = parsed.mobile ? '?1' : '?0';
    headers['Sec-Ch-Ua-Platform'] = `"${parsed.os}"`;
    headers['Sec-Fetch-Dest'] = 'document';
    headers['Sec-Fetch-Mode'] = 'navigate';
    headers['Sec-Fetch-Site'] = 'none';
    headers['Sec-Fetch-User'] = '?1';
  }
  
  return headers;
};

// ===========================================
// Exports
// ===========================================

module.exports = {
  // User agent collections
  desktopUserAgents,
  mobileUserAgents,
  botUserAgents,
  allUserAgents,
  
  // Main functions
  getRandomUserAgent,
  getNextUserAgent,
  getDifferentUserAgent,
  getUserAgentForDomain,
  
  // Utility functions
  parseUserAgent,
  getHeadersForUserAgent,
  
  // Statistics
  getUsageStats,
  resetUsageStats
};