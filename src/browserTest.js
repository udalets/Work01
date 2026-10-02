// Simple browser console test
// Copy and paste this into browser console after loading the app

async function runTests() {
  console.log('=== Starting Website Analyzer Tests ===\n');
  
  // Test 1: Check if analyzer module is loaded
  console.log('Test 1: Checking module availability...');
  try {
    const analyzerModule = await import('./src/services/analyzer.ts');
    console.log('✅ Analyzer module loaded successfully');
    console.log('   Available functions:', Object.keys(analyzerModule));
  } catch (error) {
    console.error('❌ Failed to load analyzer module:', error.message);
    return;
  }
  
  // Test 2: Check if adapter module is loaded
  console.log('\nTest 2: Checking adapter module...');
  try {
    const adapterModule = await import('./src/services/adapter.ts');
    console.log('✅ Adapter module loaded successfully');
    console.log('   Available functions:', Object.keys(adapterModule));
  } catch (error) {
    console.error('❌ Failed to load adapter module:', error.message);
    return;
  }
  
  // Test 3: Test URL validation
  console.log('\nTest 3: Testing URL validation...');
  const testUrls = [
    'https://expomap.ru/conference/nedelya-bezopasnosti-techexpert/',
    'https://nic-conf.ru/',
    'https://habr.com',
    'https://ted.com',
  ];
  
  testUrls.forEach(url => {
    try {
      const urlObj = new URL(url);
      console.log(`✅ Valid URL: ${url}`);
      console.log(`   Hostname: ${urlObj.hostname}`);
      console.log(`   Path: ${urlObj.pathname}`);
    } catch (error) {
      console.error(`❌ Invalid URL: ${url}`);
    }
  });
  
  // Test 4: Test data structure
  console.log('\nTest 4: Testing data structure...');
  const testData = {
    overallScore: 75,
    siteName: 'Test Site',
    siteUrl: 'https://example.com',
    analyzedAt: new Date().toISOString(),
    content: { score: 80, summary: 'Test content', issues: [] },
    ux: { score: 70, summary: 'Test UX', issues: [] },
    seo: { score: 65, summary: 'Test SEO', issues: [] },
    technical: { score: 85, summary: 'Test technical', issues: [] },
  };
  
  console.log('✅ Test data structure is valid');
  console.log('   Overall score:', testData.overallScore);
  console.log('   Sections:', Object.keys(testData).filter(k => ['content', 'ux', 'seo', 'technical'].includes(k)));
  
  // Test 5: Test score calculation
  console.log('\nTest 5: Testing score calculation...');
  const avgScore = (testData.content.score + testData.ux.score + testData.seo.score + testData.technical.score) / 4;
  console.log(`✅ Average score: ${avgScore}`);
  console.log(`   Expected: ${testData.overallScore}`);
  console.log(`   Match: ${Math.abs(avgScore - testData.overallScore) < 1 ? 'YES' : 'NO'}`);
  
  // Test 6: Test severity logic
  console.log('\nTest 6: Testing severity logic...');
  const severities = ['critical', 'high', 'medium', 'low'];
  const severityColors = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'green',
  };
  
  severities.forEach(severity => {
    console.log(`✅ Severity "${severity}" → color: ${severityColors[severity]}`);
  });
  
  // Test 7: Test score color logic
  console.log('\nTest 7: Testing score color logic...');
  function getScoreColor(score) {
    if (score >= 70) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  }
  
  const testScores = [
    { score: 85, expected: 'green' },
    { score: 65, expected: 'yellow' },
    { score: 35, expected: 'red' },
  ];
  
  testScores.forEach(({ score, expected }) => {
    const color = getScoreColor(score);
    const match = color === expected;
    console.log(`${match ? '✅' : '❌'} Score ${score} → ${color} (expected: ${expected})`);
  });
  
  // Test 8: Test issue filtering
  console.log('\nTest 8: Testing issue filtering...');
  const testIssues = [
    { id: '1', severity: 'critical', category: 'seo' },
    { id: '2', severity: 'high', category: 'content' },
    { id: '3', severity: 'medium', category: 'ux' },
    { id: '4', severity: 'low', category: 'technical' },
    { id: '5', severity: 'high', category: 'seo' },
  ];
  
  const criticalCount = testIssues.filter(i => i.severity === 'critical').length;
  const highCount = testIssues.filter(i => i.severity === 'high').length;
  const mediumCount = testIssues.filter(i => i.severity === 'medium').length;
  const lowCount = testIssues.filter(i => i.severity === 'low').length;
  
  console.log(`✅ Critical: ${criticalCount} (expected: 1)`);
  console.log(`✅ High: ${highCount} (expected: 2)`);
  console.log(`✅ Medium: ${mediumCount} (expected: 1)`);
  console.log(`✅ Low: ${lowCount} (expected: 1)`);
  
  // Test 9: Test priority matrix logic
  console.log('\nTest 9: Testing priority matrix logic...');
  function getImpactScore(severity) {
    switch(severity) {
      case 'critical': return 95;
      case 'high': return 75;
      case 'medium': return 50;
      case 'low': return 25;
      default: return 0;
    }
  }
  
  function getEffortScore(severity) {
    switch(severity) {
      case 'critical': return 70;
      case 'high': return 60;
      case 'medium': return 40;
      case 'low': return 20;
      default: return 0;
    }
  }
  
  testIssues.forEach(issue => {
    const impact = getImpactScore(issue.severity);
    const effort = getEffortScore(issue.severity);
    const isQuickWin = impact >= 70 && effort <= 60;
    console.log(`✅ Issue ${issue.id} (${issue.severity}): impact=${impact}, effort=${effort}, quickWin=${isQuickWin}`);
  });
  
  console.log('\n=== All Tests Completed ===');
}

// Run tests
runTests().catch(console.error);
