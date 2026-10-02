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

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

async function fetchWithProxy(url: string): Promise<string> {
  let lastError: Error | null = null;
  
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(`${proxy}${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) {
        return await response.text();
      }
    } catch (e) {
      lastError = e as Error;
    }
  }
  
  throw lastError || new Error('Не удалось получить доступ к сайту');
}

function parseHTML(html: string, url: string): ParsedData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const urlObj = new URL(url);
  const domain = urlObj.hostname;

  // Title
  const titleEl = doc.querySelector('title');
  const title = titleEl?.textContent?.trim() || '';

  // Meta description
  const metaDesc = doc.querySelector('meta[name="description"]') || doc.querySelector('meta[property="og:description"]');
  const description = metaDesc?.getAttribute('content') || '';

  // Meta tags collection
  const foundMetaTags: { name: string; content: string }[] = [];
  doc.querySelectorAll('meta').forEach(meta => {
    const name = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('http-equiv') || '';
    const content = meta.getAttribute('content') || '';
    if (name && content) {
      foundMetaTags.push({ name, content });
    }
  });

  // Headings
  const foundHeadings: { level: number; text: string }[] = [];
  for (let i = 1; i <= 6; i++) {
    doc.querySelectorAll(`h${i}`).forEach(h => {
      const text = h.textContent?.trim() || '';
      if (text) foundHeadings.push({ level: i, text: text.substring(0, 100) });
    });
  }

  // H counts
  const h1Count = doc.querySelectorAll('h1').length;
  const h2Count = doc.querySelectorAll('h2').length;
  const h3Count = doc.querySelectorAll('h3').length;

  // Images
  const images = doc.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt') || img.getAttribute('alt')?.trim() === '').length;

  // Links
  const allLinks = doc.querySelectorAll('a[href]');
  let externalLinks = 0;
  let internalLinks = 0;
  allLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === domain) {
        internalLinks++;
      } else if (href.startsWith('http')) {
        externalLinks++;
      }
    } catch {
      internalLinks++;
    }
  });

  // Word count
  const bodyText = doc.body?.textContent || '';
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;

  // Various checks
  const hasOpenGraph = !!doc.querySelector('meta[property="og:title"]');
  const hasTwitterCard = !!doc.querySelector('meta[name="twitter:card"]') || !!doc.querySelector('meta[property="twitter:card"]');
  const hasCanonical = !!doc.querySelector('link[rel="canonical"]');
  const hasViewport = !!doc.querySelector('meta[name="viewport"]');
  const hasCharset = !!doc.querySelector('meta[charset]') || !!doc.querySelector('meta[http-equiv="Content-Type"]');
  const hasLang = !!doc.documentElement.getAttribute('lang');
  const hasRobots = !!doc.querySelector('meta[name="robots"]');
  const hasFavicon = !!doc.querySelector('link[rel="icon"]') || !!doc.querySelector('link[rel="shortcut icon"]');
  const hasJsonLd = !!doc.querySelector('script[type="application/ld+json"]');
  const hasForms = doc.querySelectorAll('form').length > 0;
  const hasVideo = doc.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0;
  const hasIframe = doc.querySelectorAll('iframe').length > 0;
  const inlineStyles = doc.querySelectorAll('[style]').length;
  const scripts = doc.querySelectorAll('script').length;
  const cssLinks = doc.querySelectorAll('link[rel="stylesheet"]').length;

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
    totalParagraphs: doc.querySelectorAll('p').length,
    totalImages: images.length,
    imagesWithoutAlt,
    totalLinks: allLinks.length,
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
}

async function checkExternalResource(url: string, path: string): Promise<boolean> {
  try {
    const urlObj = new URL(url);
    const checkUrl = `${urlObj.origin}${path}`;
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(checkUrl)}`, {
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
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
  }

  if (!data.hasOpenGraph) {
    issues.push({
      id: nextId('seo'),
      title: 'Отсутствуют Open Graph теги',
      description: 'Не найдены теги og:title, og:description. При шаринге в соцсетях не будет красивого превью.',
      severity: 'medium',
      category: 'seo',
      recommendation: 'Добавьте теги og:title, og:description, og:image, og:url для корректного отображения в соцсетях.',
      impact: 'Улучшение превью при partage в социальных сетях',
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
      impact: 'Красивые карточки при partage в Twitter/X',
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

  if (data.hasScripts > 20) {
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
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  // Fetch HTML
  const html = await fetchWithProxy(normalizedUrl);
  
  if (!html || html.length < 100) {
    throw new Error('Не удалось получить содержимое сайта. Возможно, сайт недоступен или блокирует запросы.');
  }

  // Parse HTML
  const parsed = parseHTML(html, normalizedUrl);

  // Check external resources
  const [hasRobotsTxt, hasSitemap] = await Promise.all([
    checkExternalResource(normalizedUrl, '/robots.txt'),
    checkExternalResource(normalizedUrl, '/sitemap.xml'),
  ]);

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
