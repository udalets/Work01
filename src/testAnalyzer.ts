// Test script to verify analyzer works correctly
import { analyzeWebsite } from './services/analyzer';
import { convertToAnalysisData } from './services/adapter';

async function testAnalyzer() {
  const testUrls = [
    'https://expomap.ru/conference/nedelya-bezopasnosti-techexpert/',
    'https://nic-conf.ru/',
  ];

  console.log('=== Testing Website Analyzer ===\n');

  for (const url of testUrls) {
    console.log(`\n🔍 Testing: ${url}`);
    console.log('─'.repeat(60));

    try {
      // Analyze website
      const result = await analyzeWebsite(url);
      
      console.log(`✅ Analysis successful!`);
      console.log(`📊 Overall Score: ${result.overallScore}/100`);
      console.log(`📝 Content Score: ${result.contentScore}/100`);
      console.log(`🎨 UX Score: ${result.uxScore}/100`);
      console.log(`🔍 SEO Score: ${result.seoScore}/100`);
      console.log(`⚙️ Technical Score: ${result.technicalScore}/100`);
      console.log(`\n📈 Statistics:`);
      console.log(`  • Title: ${result.title || '(none)'}`);
      console.log(`  • Description: ${result.description ? `${result.description.substring(0, 80)}...` : '(none)'}`);
      console.log(`  • H1 tags: ${result.h1Count}`);
      console.log(`  • H2 tags: ${result.h2Count}`);
      console.log(`  • Images: ${result.totalImages} (${result.imagesWithoutAlt} without alt)`);
      console.log(`  • Links: ${result.totalLinks} (${result.internalLinks} internal, ${result.externalLinks} external)`);
      console.log(`  • Word count: ${result.wordCount}`);
      console.log(`  • HTML size: ${(result.htmlSize / 1024).toFixed(1)} KB`);
      console.log(`  • Has HTTPS: ${result.hasHttps}`);
      console.log(`  • Has viewport: ${result.hasViewport}`);
      console.log(`  • Has favicon: ${result.hasFavicon}`);
      console.log(`  • Has forms: ${result.hasForms}`);
      console.log(`  • Has video: ${result.hasVideo}`);
      console.log(`  • Has robots.txt: ${result.hasRobotsTxt}`);
      console.log(`  • Has sitemap.xml: ${result.hasSitemap}`);
      
      console.log(`\n⚠️ Issues found: ${result.issues.length}`);
      
      const criticalIssues = result.issues.filter(i => i.severity === 'critical');
      const highIssues = result.issues.filter(i => i.severity === 'high');
      const mediumIssues = result.issues.filter(i => i.severity === 'medium');
      const lowIssues = result.issues.filter(i => i.severity === 'low');
      
      console.log(`  • Critical: ${criticalIssues.length}`);
      console.log(`  • High: ${highIssues.length}`);
      console.log(`  • Medium: ${mediumIssues.length}`);
      console.log(`  • Low: ${lowIssues.length}`);
      
      if (result.issues.length > 0) {
        console.log(`\n📋 Top issues:`);
        result.issues.slice(0, 5).forEach((issue, idx) => {
          console.log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }
      
      // Test conversion to AnalysisData
      const convertedData = convertToAnalysisData(result);
      console.log(`\n✅ Data conversion successful!`);
      console.log(`  • Site name: ${convertedData.siteName}`);
      console.log(`  • Content issues: ${convertedData.content.issues.length}`);
      console.log(`  • UX issues: ${convertedData.ux.issues.length}`);
      console.log(`  • SEO issues: ${convertedData.seo.issues.length}`);
      console.log(`  • Technical issues: ${convertedData.technical.issues.length}`);
      
    } catch (error) {
      console.error(`❌ Error analyzing ${url}:`, error instanceof Error ? error.message : error);
    }
    
    console.log('\n');
  }
  
  console.log('=== Test Complete ===');
}

// Run test
testAnalyzer().catch(console.error);
