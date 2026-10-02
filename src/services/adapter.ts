import { AnalysisResult } from '../services/analyzer';
import { AnalysisData, SectionData } from '../data/analysisData';

export function convertToAnalysisData(result: AnalysisResult): AnalysisData {
  const contentSection: SectionData = {
    score: result.contentScore,
    summary: generateContentSummary(result),
    issues: result.issues.filter(i => i.category === 'content'),
  };

  const uxSection: SectionData = {
    score: result.uxScore,
    summary: generateUXSummary(result),
    issues: result.issues.filter(i => i.category === 'ux'),
  };

  const seoSection: SectionData = {
    score: result.seoScore,
    summary: generateSEOSummary(result),
    issues: result.issues.filter(i => i.category === 'seo'),
  };

  const technicalSection: SectionData = {
    score: result.technicalScore,
    summary: generateTechnicalSummary(result),
    issues: result.issues.filter(i => i.category === 'technical'),
  };

  let hostname = '';
  try {
    hostname = new URL(result.url).hostname;
  } catch {
    hostname = result.url;
  }

  return {
    overallScore: result.overallScore,
    siteName: result.title || hostname,
    siteUrl: result.url,
    analyzedAt: result.fetchedAt,
    content: contentSection,
    ux: uxSection,
    seo: seoSection,
    technical: technicalSection,
  };
}

function generateContentSummary(result: AnalysisResult): string {
  const parts: string[] = [];
  
  if (result.wordCount < 300) {
    parts.push(`Мало контента (${result.wordCount} слов)`);
  } else if (result.wordCount > 1000) {
    parts.push(`Хороший объём контента (${result.wordCount} слов)`);
  } else {
    parts.push(`Средний объём контента (${result.wordCount} слов)`);
  }

  if (result.totalImages === 0) {
    parts.push('нет изображений');
  } else if (result.imagesWithoutAlt > 0) {
    parts.push(`${result.imagesWithoutAlt} изображений без alt-текста`);
  }

  if (result.h1Count === 0) {
    parts.push('отсутствует H1');
  } else if (result.h1Count > 1) {
    parts.push(`${result.h1Count} заголовков H1`);
  }

  if (!result.hasVideo) {
    parts.push('нет видеоконтента');
  }

  return `Анализ контента: ${parts.join(', ')}.`;
}

function generateUXSummary(result: AnalysisResult): string {
  const parts: string[] = [];

  if (!result.hasViewport) {
    parts.push('отсутствует viewport (проблема с мобильной версией)');
  } else {
    parts.push('адаптивная верстка настроена');
  }

  if (!result.hasFavicon) {
    parts.push('нет favicon');
  }

  if (!result.hasForms) {
    parts.push('нет форм взаимодействия');
  }

  if (result.totalLinks < 5) {
    parts.push(`мало ссылок (${result.totalLinks})`);
  }

  return `Анализ UX: ${parts.join(', ')}.`;
}

function generateSEOSummary(result: AnalysisResult): string {
  const parts: string[] = [];

  if (!result.hasTitle) {
    parts.push('нет title');
  } else {
    parts.push(`title: ${result.titleLength} символов`);
  }

  if (!result.hasMetaDescription) {
    parts.push('нет meta description');
  } else {
    parts.push(`description: ${result.metaDescriptionLength} символов`);
  }

  if (!result.hasOpenGraph) {
    parts.push('нет Open Graph');
  }

  if (!result.hasCanonical) {
    parts.push('нет canonical');
  }

  if (!result.hasJsonLd) {
    parts.push('нет структурированных данных');
  }

  return `SEO-анализ: ${parts.join(', ')}.`;
}

function generateTechnicalSummary(result: AnalysisResult): string {
  const parts: string[] = [];

  if (!result.hasHttps) {
    parts.push('нет HTTPS');
  } else {
    parts.push('HTTPS настроен');
  }

  if (!result.hasCharset) {
    parts.push('не указана кодировка');
  }

  if (result.htmlSize > 500000) {
    parts.push(`большой HTML (${(result.htmlSize / 1024).toFixed(0)} КБ)`);
  }

  if (!result.hasRobotsTxt) {
    parts.push('нет robots.txt');
  }

  if (!result.hasSitemap) {
    parts.push('нет sitemap.xml');
  }

  return `Технический анализ: ${parts.join(', ')}.`;
}
