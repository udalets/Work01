// Universal website analyzer service
// Fetches HTML via CORS proxy and analyzes it

export interface FoundIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'content' | 'ux' | 'seo' | 'technical';
  recommendation: string;
  impact: string;
}

export interface AnalysisResult {
  url: string;
  title: string;
  description: string;
  fetchedAt: string;
  htmlSize: number;
  hasSSL: boolean;
  // SEO metrics
  hasTitle: boolean;
  titleLength: number;
  hasMetaDescription: boolean;
  metaDescriptionLength: number;
  hasMetaKeywords: boolean;
  hasCanonical: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasRobots: boolean;
  hasViewport: boolean;
  hasCharset: boolean;
  hasLang: boolean;
  // Content metrics
  h1Count: number;
  h2Count: number;
  h3Count: number;
  totalHeadings: number;
  totalParagraphs: number;
  totalImages: number;
  imagesWithoutAlt: number;
  totalLinks: number;
  externalLinks: number;
  internalLinks: number;
  hasFavicon: boolean;
  wordCount: number;
  // Technical
  hasHttps: boolean;
  usesWww: boolean;
  hasForms: boolean;
  hasVideo: boolean;
  hasIframe: boolean;
  hasInlineStyles: number;
  hasScripts: number;
  hasCssLinks: number;
  hasJsonLd: boolean;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  // Scores
  contentScore: number;
  uxScore: number;
  seoScore: number;
  technicalScore: number;
  overallScore: number;
  // Issues
  issues: FoundIssue[];
  // Raw data for display
  foundMetaTags: { name: string; content: string }[];
  foundHeadings: { level: number; text: string }[];
}

interface ParsedData {
  title: string;
  description: string;
  htmlSize: number;
  hasSSL: boolean;
  hasTitle: boolean;
  titleLength: number;
  hasMetaDescription: boolean;
  metaDescriptionLength: number;
  hasMetaKeywords: boolean;
  hasCanonical: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasRobots: boolean;
  hasViewport: boolean;
  hasCharset: boolean;
  hasLang: boolean;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  totalHeadings: number;
  totalParagraphs: number;
  totalImages: number;
  imagesWithoutAlt: number;
  totalLinks: number;
  externalLinks: number;
  internalLinks: number;
  hasFavicon: boolean;
  wordCount: number;
  hasHttps: boolean;
  usesWww: boolean;
  hasForms: boolean;
  hasVideo: boolean;
  hasIframe: boolean;
  hasInlineStyles: number;
  hasScripts: number;
  hasCssLinks: number;
  hasJsonLd: boolean;
  foundMetaTags: { name: string; content: string }[];
  foundHeadings: { level: number; text: string }[];
}

// Multiple CORS proxies for fallback - using most reliable ones
const CORS_PROXIES = [
  {
    name: 'AllOrigins',
    fn: (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    isJson: true,
  },
  {
    name: 'CorsProxy.io',
    fn: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    isJson: false,
  },
  {
    name: 'CodeTabs',
    fn: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    isJson: false,
  },
  {
    name: 'ThingProxy',
    fn: (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
    isJson: false,
  },
  {
    name: 'Bridged',
    fn: (url: string) => `https://cors.bridged.cc/${url}`,
    isJson: false,
  },
  {
    name: 'YaCDN',
    fn: (url: string) => `https://yacdn.org/proxy/${url}`,
    isJson: false,
  },
  {
    name: 'ProxyCORS',
    fn: (url: string) => `https://api.proxy-cors.com/get?url=${encodeURIComponent(url)}`,
    isJson: false,
  },
  {
    name: 'CrossOrigin',
    fn: (url: string) => `https://crossorigin.me/${url}`,
    isJson: false,
  },
];

// Safe timeout that works in all browsers
function createTimeout(ms: number): AbortSignal | undefined {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms);
    }
    // Fallback for older browsers
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  } catch {
    return undefined;
  }
}

async function fetchWithProxy(url: string): Promise<string> {
  let lastError: Error | null = null;
  const failedProxies: string[] = [];
  
  // Try all proxies in parallel and return first successful result
  const promises = CORS_PROXIES.map(async (proxy) => {
    try {
      const proxyUrl = proxy.fn(url);
      // Increased timeout to 45 seconds for better reliability
      const signal = createTimeout(45000);
      
      const response = await fetch(proxyUrl, {
        signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      if (response.ok) {
        let text = await response.text();
        
        // Handle JSON response from allorigins.win
        if (proxy.isJson && text.trim().startsWith('{')) {
          try {
            const json = JSON.parse(text);
            if (json.contents) {
              text = json.contents;
            }
          } catch {
            // Not JSON, continue with raw text
          }
        }
        
        // Verify we got actual HTML content
        if (text && text.length > 200) {
          return { success: true, text, proxyName: proxy.name };
        }
      }
      return { success: false, text: '', proxyName: proxy.name };
    } catch (e) {
      failedProxies.push(proxy.name);
      return { success: false, text: '', proxyName: proxy.name };
    }
  });
  
  // Wait for all results
  try {
    const results = await Promise.all(promises);
    for (const result of results) {
      if (result.success && result.text) {
        return result.text;
      }
    }
  } catch (e) {
    lastError = e instanceof Error ? e : new Error(String(e));
  }
  
  // Try direct request as last resort (may fail due to CORS)
  try {
    const signal = createTimeout(30000);
    const directResponse = await fetch(url, {
      signal,
      mode: 'cors',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    
    if (directResponse.ok) {
      const text = await directResponse.text();
      if (text && text.length > 200) {
        return text;
      }
    }
  } catch (e) {
    // Direct request failed, continue with error from proxies
  }
  
  const proxyList = failedProxies.length > 0 ? failedProxies.join(', ') : 'все доступные';
  throw lastError || new Error(`Не удалось получить доступ к сайту через CORS прокси (${proxyList}). Возможные причины:
• Сайт недоступен или требует авторизации
• Сайт блокирует запросы из браузера
• Все CORS прокси временно недоступны
• Неверный URL

Попробуйте:
1. Проверить правильность URL
2. Убедиться, что сайт открывается в браузере
3. Попробовать позже (прокси могут быть перегружены)`);
}

function safeParseHTML(html: string, url: string): ParsedData {
  // Default values in case parsing fails
  const defaults: ParsedData = {
    title: '',
    description: '',
    htmlSize: html.length,
    hasSSL: url.startsWith('https'),
    hasTitle: false,
    titleLength: 0,
    hasMetaDescription: false,
    metaDescriptionLength: 0,
    hasMetaKeywords: false,
    hasCanonical: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasRobots: false,
    hasViewport: false,
    hasCharset: false,
    hasLang: false,
    h1Count: 0,
    h2Count: 0,
    h3Count: 0,
    totalHeadings: 0,
    totalParagraphs: 0,
    totalImages: 0,
    imagesWithoutAlt: 0,
    totalLinks: 0,
    externalLinks: 0,
    internalLinks: 0,
    hasFavicon: false,
    wordCount: 0,
    hasHttps: url.startsWith('https'),
    usesWww: false,
    hasForms: false,
    hasVideo: false,
    hasIframe: false,
    hasInlineStyles: 0,
    hasScripts: 0,
    hasCssLinks: 0,
    hasJsonLd: false,
    foundMetaTags: [],
    foundHeadings: [],
  };

  try {
    let domain = '';
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname;
      defaults.usesWww = domain.startsWith('www.');
    } catch {
      // Invalid URL, use defaults
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Check for parser errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('HTML parser error detected, proceeding with partial parse');
    }

    // Title
    const titleEl = doc.querySelector('title');
    const title = titleEl?.textContent?.trim() || '';

    // Meta description - try multiple selectors
    const metaDesc = doc.querySelector('meta[name="description"]') 
      || doc.querySelector('meta[property="og:description"]')
      || doc.querySelector('meta[name="Description"]');
    const description = metaDesc?.getAttribute('content') || '';

    // Meta tags collection
    const foundMetaTags: { name: string; content: string }[] = [];
    try {
      doc.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('http-equiv') || '';
        const content = meta.getAttribute('content') || '';
        if (name && content) {
          foundMetaTags.push({ name, content });
        }
      });
    } catch (e) {
      console.warn('Error parsing meta tags:', e);
    }

    // Headings
    const foundHeadings: { level: number; text: string }[] = [];
    try {
      for (let i = 1; i <= 6; i++) {
        doc.querySelectorAll(`h${i}`).forEach(h => {
          const text = (h.textContent || '').trim();
          if (text) foundHeadings.push({ level: i, text: text.substring(0, 150) });
        });
      }
    } catch (e) {
      console.warn('Error parsing headings:', e);
    }

    // H counts
    const h1Count = doc.querySelectorAll('h1').length;
    const h2Count = doc.querySelectorAll('h2').length;
    const h3Count = doc.querySelectorAll('h3').length;

    // Images
    let imagesWithoutAlt = 0;
    try {
      const images = doc.querySelectorAll('img');
      imagesWithoutAlt = Array.from(images).filter(img => {
        const alt = img.getAttribute('alt');
        return !alt || alt.trim() === '';
      }).length;
    } catch (e) {
      console.warn('Error parsing images:', e);
    }

    // Links
    let externalLinks = 0;
    let internalLinks = 0;
    let totalLinks = 0;
    try {
      const allLinks = doc.querySelectorAll('a[href]');
      totalLinks = allLinks.length;
      allLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        try {
          if (href && (href.startsWith('http') || href.startsWith('/'))) {
            const linkUrl = new URL(href, url);
            if (linkUrl.hostname === domain || linkUrl.hostname === `www.${domain}` || `www.${linkUrl.hostname}` === domain) {
              internalLinks++;
            } else if (href.startsWith('http')) {
              externalLinks++;
            }
          }
        } catch {
          // Relative or invalid link
          if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('#')) {
            internalLinks++;
          }
        }
      });
    } catch (e) {
      console.warn('Error parsing links:', e);
    }

    // Word count
    let wordCount = 0;
    try {
      const bodyText = doc.body?.textContent || '';
      wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
    } catch (e) {
      console.warn('Error counting words:', e);
    }

    // Various checks with error handling
    let hasOpenGraph = false;
    let hasTwitterCard = false;
    let hasCanonical = false;
    let hasViewport = false;
    let hasCharset = false;
    let hasLang = false;
    let hasRobots = false;
    let hasFavicon = false;
    let hasJsonLd = false;
    let hasForms = false;
    let hasVideo = false;
    let hasIframe = false;
    let inlineStyles = 0;
    let scripts = 0;
    let cssLinks = 0;
    let totalImages = 0;
    let totalParagraphs = 0;

    try {
      hasOpenGraph = !!doc.querySelector('meta[property="og:title"]') || !!doc.querySelector('meta[property="og:image"]');
      hasTwitterCard = !!doc.querySelector('meta[name="twitter:card"]') || !!doc.querySelector('meta[property="twitter:card"]');
      hasCanonical = !!doc.querySelector('link[rel="canonical"]');
      hasViewport = !!doc.querySelector('meta[name="viewport"]');
      hasCharset = !!doc.querySelector('meta[charset]') || !!doc.querySelector('meta[http-equiv="Content-Type"]');
      hasLang = !!(doc.documentElement.getAttribute('lang'));
      hasRobots = !!doc.querySelector('meta[name="robots"]');
      hasFavicon = !!doc.querySelector('link[rel="icon"]') 
        || !!doc.querySelector('link[rel="shortcut icon"]')
        || !!doc.querySelector('link[rel="apple-touch-icon"]');
      hasJsonLd = !!doc.querySelector('script[type="application/ld+json"]');
      hasForms = doc.querySelectorAll('form').length > 0;
      hasVideo = doc.querySelectorAll('video').length > 0 
        || doc.querySelectorAll('iframe[src*="youtube"]').length > 0
        || doc.querySelectorAll('iframe[src*="vimeo"]').length > 0
        || doc.querySelectorAll('iframe[src*="rutube"]').length > 0;
      hasIframe = doc.querySelectorAll('iframe').length > 0;
      inlineStyles = doc.querySelectorAll('[style]').length;
      scripts = doc.querySelectorAll('script').length;
      cssLinks = doc.querySelectorAll('link[rel="stylesheet"]').length;
      totalImages = doc.querySelectorAll('img').length;
      totalParagraphs = doc.querySelectorAll('p').length;
    } catch (e) {
      console.warn('Error in element checks:', e);
    }

    return {
      title,
      description,
      htmlSize: html.length,
      hasSSL: url.startsWith('https'),
      hasTitle: !!title,
      titleLength: title.length,
      hasMetaDescription: !!description,
      metaDescriptionLength: description.length,
      hasMetaKeywords: !!doc.querySelector('meta[name="keywords"]'),
      hasCanonical,
      hasOpenGraph,
      hasTwitterCard,
      hasRobots,
      hasViewport,
      hasCharset,
      hasLang,
      h1Count,
      h2Count,
      h3Count,
      totalHeadings: foundHeadings.length,
      totalParagraphs,
      totalImages,
      imagesWithoutAlt,
      totalLinks,
      externalLinks,
      internalLinks,
      hasFavicon,
      wordCount,
      hasHttps: url.startsWith('https'),
      usesWww: domain.startsWith('www.'),
      hasForms,
      hasVideo,
      hasIframe,
      hasInlineStyles: inlineStyles,
      hasScripts: scripts,
      hasCssLinks: cssLinks,
      hasJsonLd,
      foundMetaTags,
      foundHeadings,
    };
  } catch (e) {
    console.error('Fatal error in parseHTML:', e);
    return defaults;
  }
}

async function checkExternalResource(url: string, path: string): Promise<boolean> {
  try {
    const urlObj = new URL(url);
    const checkUrl = `${urlObj.origin}${path}`;
    
    // Try all proxies in parallel
    const promises = CORS_PROXIES.map(async (proxy) => {
      try {
        const signal = createTimeout(15000);
        const response = await fetch(proxy.fn(checkUrl), { signal });
        if (response.ok) {
          let text = await response.text();
          
          // Handle JSON response
          if (proxy.isJson && text.trim().startsWith('{')) {
            try {
              const json = JSON.parse(text);
              if (json.contents) {
                text = json.contents;
              }
            } catch {
              // Not JSON
            }
          }
          
          // Verify it's not an error page
          if (text && text.length > 10 && !text.includes('404 Not Found')) {
            return true;
          }
        }
        return false;
      } catch {
        return false;
      }
    });
    
    const results = await Promise.all(promises);
    return results.some(r => r === true);
  } catch {
    return false;
  }
}

function calculateScores(data: ParsedData & { hasRobotsTxt: boolean; hasSitemap: boolean }) {
  // SEO Score (0-100)
  let seoScore = 0;
  if (data.hasTitle) seoScore += 15;
  if (data.titleLength > 10 && data.titleLength < 70) seoScore += 5;
  if (data.hasMetaDescription) seoScore += 15;
  if (data.metaDescriptionLength > 50 && data.metaDescriptionLength < 160) seoScore += 5;
  if (data.hasCanonical) seoScore += 10;
  if (data.hasOpenGraph) seoScore += 10;
  if (data.hasTwitterCard) seoScore += 5;
  if (data.hasRobots) seoScore += 5;
  if (data.hasViewport) seoScore += 10;
  if (data.hasCharset) seoScore += 5;
  if (data.hasLang) seoScore += 5;
  if (data.h1Count === 1) seoScore += 5;
  if (data.hasJsonLd) seoScore += 5;
  if (data.hasRobotsTxt) seoScore += 3;

  // Content Score (0-100)
  let contentScore = 0;
  if (data.h1Count >= 1) contentScore += 15;
  if (data.h2Count >= 2) contentScore += 10;
  if (data.wordCount > 300) contentScore += 15;
  if (data.wordCount > 1000) contentScore += 10;
  if (data.totalImages > 0) contentScore += 10;
  if (data.imagesWithoutAlt === 0 && data.totalImages > 0) contentScore += 10;
  if (data.totalParagraphs > 5) contentScore += 10;
  if (data.hasVideo) contentScore += 10;
  if (data.totalHeadings > 5) contentScore += 10;
  if (data.totalLinks > 10) contentScore += 10;

  // UX Score (0-100)
  let uxScore = 0;
  if (data.hasViewport) uxScore += 25;
  if (data.hasCharset) uxScore += 10;
  if (data.hasFavicon) uxScore += 10;
  if (data.hasForms) uxScore += 15;
  if (data.hasVideo) uxScore += 10;
  if (data.totalLinks > 5) uxScore += 10;
  if (data.totalImages > 0) uxScore += 10;
  if (data.hasLang) uxScore += 10;

  // Technical Score (0-100)
  let technicalScore = 0;
  if (data.hasHttps) technicalScore += 25;
  if (data.hasCharset) technicalScore += 10;
  if (data.hasViewport) technicalScore += 15;
  if (data.hasLang) technicalScore += 10;
  if (data.hasCanonical) technicalScore += 10;
  if (data.hasJsonLd) technicalScore += 10;
  if (data.htmlSize < 500000) technicalScore += 10;
  if (data.hasInlineStyles < 20) technicalScore += 10;
  if (data.hasSitemap) technicalScore += 5;

  return {
    contentScore: Math.min(contentScore, 100),
    uxScore: Math.min(uxScore, 100),
    seoScore: Math.min(seoScore, 100),
    technicalScore: Math.min(technicalScore, 100),
  };
}

function generateIssues(data: ParsedData & { hasRobotsTxt: boolean; hasSitemap: boolean }): FoundIssue[] {
  const issues: FoundIssue[] = [];
  let idCounter = 0;
  const nextId = (cat: string) => `${cat}${++idCounter}`;

  // === SEO Issues ===
  if (!data.hasTitle) {
    issues.push({
      id: nextId('seo'),
      title: 'Отсутствует тег <title>',
      description: 'На странице не найден тег title. Это критически важно для SEO и отображения в поисковой выдаче.',
      severity: 'critical',
      category: 'seo',
      recommendation: 'Добавьте уникальный тег <title> длиной 50-60 символов с ключевыми словами.',
      impact: 'Без title сайт плохо индексируется поисковыми системами',
    });
  } else if (data.titleLength > 70) {
    issues.push({
      id: nextId('seo'),
      title: 'Слишком длинный title',
      description: `Длина title: ${data.titleLength} символов. Рекомендуется не более 60-70 символов.`,
      severity: 'medium',
      category: 'seo',
      recommendation: 'Сократите title до 60 символов, чтобы он полностью отображался в поисковой выдаче.',
      impact: 'Улучшение отображения в сниппетах Google/Яндекс',
    });
  } else if (data.titleLength < 10) {
    issues.push({
      id: nextId('seo'),
      title: 'Слишком короткий title',
      description: `Длина title: ${data.titleLength} символов. Рекомендуется 50-60 символов.`,
      severity: 'medium',
      category: 'seo',
      recommendation: 'Расширьте title, добавив ключевые слова и описание страницы.',
      impact: 'Улучшение релевантности в поисковой выдаче',
    });
  }

  if (!data.hasMetaDescription) {
    issues.push({
      id: nextId('seo'),
      title: 'Отсутствует meta description',
      description: 'Не найден мета-тег description. Поисковые системы будут генерировать описание автоматически.',
      severity: 'high',
      category: 'seo',
      recommendation: 'Добавьте <meta name="description" content="..."> с уникальным описанием страницы 120-160 символов.',
      impact: 'Увеличение CTR из поисковой выдачи на 15-30%',
    });
  } else if (data.metaDescriptionLength < 70) {
    issues.push({
      id: nextId('seo'),
      title: 'Слишком короткий meta description',
      description: `Длина description: ${data.metaDescriptionLength} символов. Рекомендуется 120-160 символов.`,
      severity: 'medium',
      category: 'seo',
      recommendation: 'Расширьте описание до 120-160 символов с ключевыми словами и призывом к действию.',
      impact: 'Более информативный сниппет в поисковой выдаче',
    });
  } else if (data.metaDescriptionLength > 160) {
    issues.push({
      id: nextId('seo'),
      title: 'Слишком длинный meta description',
      description: `Длина description: ${data.metaDescriptionLength} символов. Рекомендуется не более 160 символов.`,
      severity: 'low',
      category: 'seo',
      recommendation: 'Сократите description до 160 символов, чтобы он полностью отображался в поисковой выдаче.',
      impact: 'Полное отображение описания в сниппете',
    });
  }

  if (!data.hasOpenGraph) {
    issues.push({
      id: nextId('seo'),
      title: 'Отсутствуют Open Graph теги',
      description: 'Не найдены теги og:title, og:description. При шаринге в соцсетях не будет красивого превью.',
      severity: 'medium',
      category: 'seo',
      recommendation: 'Добавьте теги og:title, og:description, og:image, og:url для корректного отображения в соцсетях.',
      impact: 'Улучшение превью при публикации в социальных сетях',
    });
  }

  if (!data.hasTwitterCard) {
    issues.push({
      id: nextId('seo'),
      title: 'Отсутствуют Twitter Card теги',
      description: 'Не найдены мета-теги для Twitter Card.',
      severity: 'low',
      category: 'seo',
      recommendation: 'Добавьте <meta name="twitter:card" content="summary_large_image"> и связанные теги.',
      impact: 'Красивые карточки при публикации в Twitter/X',
    });
  }

  if (!data.hasCanonical) {
    issues.push({
      id: nextId('seo'),
      title: 'Отсутствует canonical URL',
      description: 'Не найден тег <link rel="canonical">. Может привести к дублированию контента.',
      severity: 'medium',
      category: 'seo',
      recommendation: 'Добавьте <link rel="canonical" href="..."> для указания основного URL страницы.',
      impact: 'Предотвращение проблем с дублями в индексации',
    });
  }

  if (data.h1Count === 0) {
    issues.push({
      id: nextId('seo'),
      title: 'Отсутствует тег H1',
      description: 'На странице не найден ни один заголовок H1. Это основной заголовок для поисковых систем.',
      severity: 'high',
      category: 'seo',
      recommendation: 'Добавьте ровно один тег H1 с основным ключевым словом страницы.',
      impact: 'Улучшение релевантности страницы для поисковых запросов',
    });
  } else if (data.h1Count > 1) {
    issues.push({
      id: nextId('seo'),
      title: `Множество заголовков H1 (${data.h1Count})`,
      description: `На странице ${data.h1Count} заголовков H1. Рекомендуется использовать только один H1.`,
      severity: 'medium',
      category: 'seo',
      recommendation: 'Оставьте один H1 (главный заголовок), остальные преобразуйте в H2 или H3.',
      impact: 'Улучшение семантической структуры для поисковых систем',
    });
  }

  if (!data.hasJsonLd) {
    issues.push({
      id: nextId('seo'),
      title: 'Отсутствует структурированная разметка (JSON-LD)',
      description: 'Не найдена микроразметка Schema.org в формате JSON-LD.',
      severity: 'medium',
      category: 'seo',
      recommendation: 'Добавьте JSON-LD разметку (Organization, WebSite, Event и т.д.) для расширенных сниппетов.',
      impact: 'Появление расширенных сниппетов в поиске (звёзды, FAQ, события)',
    });
  }

  if (!data.hasLang) {
    issues.push({
      id: nextId('seo'),
      title: 'Не указан язык страницы',
      description: 'У тега <html> не указан атрибут lang.',
      severity: 'low',
      category: 'seo',
      recommendation: 'Добавьте lang="ru" (или другой язык) в тег <html>.',
      impact: 'Улучшение доступности и корректной индексации',
    });
  }

  if (!data.hasRobotsTxt) {
    issues.push({
      id: nextId('seo'),
      title: 'Отсутствует файл robots.txt',
      description: 'Не найден файл /robots.txt. Он управляет индексацией сайта поисковыми системами.',
      severity: 'low',
      category: 'seo',
      recommendation: 'Создайте файл robots.txt с директивами для поисковых ботов.',
      impact: 'Контроль над индексацией сайта',
    });
  }

  // === Content Issues ===
  if (data.wordCount < 300) {
    issues.push({
      id: nextId('content'),
      title: 'Мало текстового контента',
      description: `На странице всего ${data.wordCount} слов. Для полноценного SEO рекомендуется минимум 300-500 слов.`,
      severity: 'high',
      category: 'content',
      recommendation: 'Добавьте больше уникального текстового контента: описания, статьи, FAQ, подробную информацию.',
      impact: 'Улучшение позиций в поиске и информативности для пользователей',
    });
  }

  if (data.totalImages > 0 && data.imagesWithoutAlt > 0) {
    const pct = Math.round((data.imagesWithoutAlt / data.totalImages) * 100);
    issues.push({
      id: nextId('content'),
      title: `Изображения без alt-текста (${data.imagesWithoutAlt} из ${data.totalImages})`,
      description: `${pct}% изображений не имеют атрибута alt. Это ухудшает доступность и SEO.`,
      severity: pct > 50 ? 'high' : 'medium',
      category: 'content',
      recommendation: 'Добавьте описательные alt-атрибуты ко всем изображениям с ключевыми словами.',
      impact: 'Улучшение доступности и появление в поиске по картинкам',
    });
  }

  if (data.totalImages === 0) {
    issues.push({
      id: nextId('content'),
      title: 'Отсутствуют изображения',
      description: 'На странице не найдено ни одного изображения. Визуальный контент важен для вовлечения.',
      severity: 'medium',
      category: 'content',
      recommendation: 'Добавьте релевантные изображения, инфографику или иллюстрации.',
      impact: 'Увеличение времени пребывания на странице на 20-40%',
    });
  }

  if (data.h2Count < 2) {
    issues.push({
      id: nextId('content'),
      title: 'Недостаточно подзаголовков H2',
      description: `Найдено только ${data.h2Count} подзаголовков H2. Структурированный контент лучше воспринимается.`,
      severity: 'low',
      category: 'content',
      recommendation: 'Разбейте контент на логические секции с подзаголовками H2 и H3.',
      impact: 'Улучшение читаемости и SEO-структуры страницы',
    });
  }

  if (!data.hasVideo) {
    issues.push({
      id: nextId('content'),
      title: 'Отсутствует видеоконтент',
      description: 'На странице не найдено видео. Видеоконтент значительно увеличивает вовлечённость.',
      severity: 'low',
      category: 'content',
      recommendation: 'Добавьте видео: обзор, инструкцию, отзыв или презентацию.',
      impact: 'Увеличение времени на странице на 50-80%',
    });
  }

  // === UX Issues ===
  if (!data.hasViewport) {
    issues.push({
      id: nextId('ux'),
      title: 'Отсутствует viewport мета-тег',
      description: 'Не найден <meta name="viewport">. Сайт может некорректно отображаться на мобильных устройствах.',
      severity: 'critical',
      category: 'ux',
      recommendation: 'Добавьте <meta name="viewport" content="width=device-width, initial-scale=1.0">.',
      impact: 'Критически важно для мобильного отображения и SEO',
    });
  }

  if (!data.hasFavicon) {
    issues.push({
      id: nextId('ux'),
      title: 'Отсутствует favicon',
      description: 'Не найдена иконка сайта (favicon). Это влияет на узнаваемость бренда.',
      severity: 'low',
      category: 'ux',
      recommendation: 'Добавьте favicon.ico или SVG-иконку через <link rel="icon" href="...">',
      impact: 'Улучшение узнаваемости бренда во вкладках браузера',
    });
  }

  if (!data.hasForms) {
    issues.push({
      id: nextId('ux'),
      title: 'Отсутствуют формы обратной связи',
      description: 'На странице не найдено ни одной формы. Пользователям не с чем взаимодействовать.',
      severity: 'medium',
      category: 'ux',
      recommendation: 'Добавьте форму обратной связи, подписки или регистрации.',
      impact: 'Увеличение конверсии и вовлечённости пользователей',
    });
  }

  if (data.hasInlineStyles > 30) {
    issues.push({
      id: nextId('ux'),
      title: `Много инлайн-стилей (${data.hasInlineStyles} элементов)`,
      description: 'Найдено много элементов с инлайн-стилями. Это затрудняет поддержку и увеличивает размер HTML.',
      severity: 'medium',
      category: 'ux',
      recommendation: 'Вынесите стили в отдельные CSS-файлы для лучшей поддерживаемости.',
      impact: 'Уменьшение размера HTML, упрощение поддержки',
    });
  }

  if (data.totalLinks < 5) {
    issues.push({
      id: nextId('ux'),
      title: 'Мало навигационных ссылок',
      description: `На странице всего ${data.totalLinks} ссылок. Навигация может быть недостаточной.`,
      severity: 'medium',
      category: 'ux',
      recommendation: 'Добавьте навигационное меню, ссылки на разделы и полезные ресурсы.',
      impact: 'Улучшение навигации и удержание пользователей на сайте',
    });
  }

  // === Technical Issues ===
  if (!data.hasHttps) {
    issues.push({
      id: nextId('tech'),
      title: 'Сайт не использует HTTPS',
      description: 'Сайт работает по HTTP без SSL-шифрования. Браузеры помечают такие сайты как "небезопасные".',
      severity: 'critical',
      category: 'technical',
      recommendation: "Установите SSL-сертификат (бесплатный Let's Encrypt) и настройте редирект на HTTPS.",
      impact: 'Критически важно для безопасности и доверия пользователей',
    });
  }

  if (!data.hasCharset) {
    issues.push({
      id: nextId('tech'),
      title: 'Не указана кодировка страницы',
      description: 'Отсутствует мета-тег charset. Может привести к некорректному отображению символов.',
      severity: 'high',
      category: 'technical',
      recommendation: 'Добавьте <meta charset="UTF-8"> в <head> страницы.',
      impact: 'Корректное отображение текста на всех устройствах',
    });
  }

  if (data.htmlSize > 500000) {
    issues.push({
      id: nextId('tech'),
      title: 'Большой размер HTML',
      description: `Размер HTML: ${(data.htmlSize / 1024).toFixed(0)} КБ. Рекомендуется до 500 КБ для быстрой загрузки.`,
      severity: 'medium',
      category: 'technical',
      recommendation: 'Оптимизируйте HTML: удалите дубли, минимизируйте код, используйте lazy loading.',
      impact: 'Ускорение загрузки страницы на 30-50%',
    });
  }

  if (data.hasScripts > 30) {
    issues.push({
      id: nextId('tech'),
      title: `Много JavaScript-скриптов (${data.hasScripts})`,
      description: 'Большое количество скриптов может замедлять загрузку страницы.',
      severity: 'medium',
      category: 'technical',
      recommendation: 'Объедините скрипты, используйте async/defer, удалите неиспользуемые.',
      impact: 'Ускорение загрузки и улучшение Core Web Vitals',
    });
  }

  if (!data.hasSitemap) {
    issues.push({
      id: nextId('tech'),
      title: 'Отсутствует файл sitemap.xml',
      description: 'Не найден файл /sitemap.xml. Он помогает поисковым системам обнаруживать все страницы сайта.',
      severity: 'low',
      category: 'technical',
      recommendation: 'Создайте sitemap.xml со списком всех важных страниц сайта.',
      impact: 'Улучшение индексации всех страниц сайта',
    });
  }

  return issues;
}

export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  // Normalize URL
  let normalizedUrl = url.trim();
  if (!normalizedUrl) {
    throw new Error('URL не может быть пустым');
  }
  
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  // Validate URL
  try {
    new URL(normalizedUrl);
  } catch {
    throw new Error('Некорректный URL. Проверьте правильность адреса сайта.');
  }

  // Fetch HTML with retry logic
  let html: string;
  let lastError: Error | null = null;
  
  // Try up to 2 times
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      html = await fetchWithProxy(normalizedUrl);
      break; // Success, exit retry loop
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < 2) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  if (!html!) {
    const errorMsg = lastError instanceof Error ? lastError.message : 'Неизвестная ошибка';
    throw new Error(`Не удалось загрузить сайт после 2 попыток: ${errorMsg}\n\nВозможные причины:\n• CORS прокси временно недоступны\n• Сайт блокирует запросы\n• Проблемы с интернет-соединением\n\nПопробуйте повторить анализ через несколько секунд.`);
  }
  
  if (!html || html.length < 100) {
    throw new Error('Сайт вернул пустой ответ или слишком малый объём данных. Возможно, сайт блокирует запросы.');
  }

  // Check if it's actually HTML
  const trimmedHtml = html.trim().toLowerCase();
  if (!trimmedHtml.includes('<html') && !trimmedHtml.includes('<!doctype') && !trimmedHtml.includes('<head') && !trimmedHtml.includes('<body')) {
    throw new Error('Сайт вернул не HTML-контент. Возможно, это API или файл другого типа.');
  }

  // Parse HTML
  const parsed = safeParseHTML(html, normalizedUrl);

  // Check external resources (non-blocking, with timeout)
  let hasRobotsTxt = false;
  let hasSitemap = false;
  
  try {
    const [robots, sitemap] = await Promise.allSettled([
      checkExternalResource(normalizedUrl, '/robots.txt'),
      checkExternalResource(normalizedUrl, '/sitemap.xml'),
    ]);
    
    hasRobotsTxt = robots.status === 'fulfilled' ? robots.value : false;
    hasSitemap = sitemap.status === 'fulfilled' ? sitemap.value : false;
  } catch {
    // Ignore errors for external resources
  }

  // Combine data
  const fullData = { ...parsed, hasRobotsTxt, hasSitemap };

  // Calculate scores
  const scores = calculateScores(fullData);
  const overallScore = Math.round(
    (scores.contentScore + scores.uxScore + scores.seoScore + scores.technicalScore) / 4
  );

  // Generate issues
  const issues = generateIssues(fullData);

  return {
    url: normalizedUrl,
    title: parsed.title,
    description: parsed.description,
    fetchedAt: new Date().toISOString(),
    htmlSize: parsed.htmlSize,
    hasSSL: parsed.hasSSL,
    hasTitle: parsed.hasTitle,
    titleLength: parsed.titleLength,
    hasMetaDescription: parsed.hasMetaDescription,
    metaDescriptionLength: parsed.metaDescriptionLength,
    hasMetaKeywords: parsed.hasMetaKeywords,
    hasCanonical: parsed.hasCanonical,
    hasOpenGraph: parsed.hasOpenGraph,
    hasTwitterCard: parsed.hasTwitterCard,
    hasRobots: parsed.hasRobots,
    hasViewport: parsed.hasViewport,
    hasCharset: parsed.hasCharset,
    hasLang: parsed.hasLang,
    h1Count: parsed.h1Count,
    h2Count: parsed.h2Count,
    h3Count: parsed.h3Count,
    totalHeadings: parsed.totalHeadings,
    totalParagraphs: parsed.totalParagraphs,
    totalImages: parsed.totalImages,
    imagesWithoutAlt: parsed.imagesWithoutAlt,
    totalLinks: parsed.totalLinks,
    externalLinks: parsed.externalLinks,
    internalLinks: parsed.internalLinks,
    hasFavicon: parsed.hasFavicon,
    wordCount: parsed.wordCount,
    hasHttps: parsed.hasHttps,
    usesWww: parsed.usesWww,
    hasForms: parsed.hasForms,
    hasVideo: parsed.hasVideo,
    hasIframe: parsed.hasIframe,
    hasInlineStyles: parsed.hasInlineStyles,
    hasScripts: parsed.hasScripts,
    hasCssLinks: parsed.hasCssLinks,
    hasJsonLd: parsed.hasJsonLd,
    hasSitemap,
    hasRobotsTxt,
    contentScore: scores.contentScore,
    uxScore: scores.uxScore,
    seoScore: scores.seoScore,
    technicalScore: scores.technicalScore,
    overallScore,
    issues,
    foundMetaTags: parsed.foundMetaTags,
    foundHeadings: parsed.foundHeadings,
  };
}
