import { useState, useEffect } from 'react';
import Header from './components/Header';
import ScoreOverview from './components/ScoreOverview';
import AnalysisSection from './components/AnalysisSection';
import RecommendationsList from './components/RecommendationsList';
import PriorityMatrix from './components/PriorityMatrix';
import Footer from './components/Footer';
import UrlInput from './components/UrlInput';
import AnalyzingScreen from './components/AnalyzingScreen';
import { analyzeWebsite, AnalysisResult } from './services/analyzer';
import { convertToAnalysisData } from './services/adapter';
import { AnalysisData } from './data/analysisData';
import { getDemoData } from './services/demoData';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [currentData, setCurrentData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const runTest = async (url: string, testName: string) => {
    const results: string[] = [];
    results.push(`\n🧪 Тест: ${testName}`);
    results.push(`🔍 URL: ${url}`);
    results.push('─'.repeat(50));
    
    try {
      results.push('⏳ Начало анализа...');
      let result: AnalysisResult;
      
      try {
        // Пытаемся реальный анализ
        result = await analyzeWebsite(url);
        results.push('✅ Реальный анализ завершён успешно!');
      } catch (realError) {
        // Если не получилось, используем демо-данные
        results.push('⚠️ Реальный анализ недоступен, используем демо-данные...');
        result = getDemoData(url);
        results.push('✅ Демо-анализ завершён успешно!');
      }
      
      results.push(`\n📊 Результаты:`);
      results.push(`  • Общая оценка: ${result.overallScore}/100`);
      results.push(`  • Контент: ${result.contentScore}/100`);
      results.push(`  • UX: ${result.uxScore}/100`);
      results.push(`  • SEO: ${result.seoScore}/100`);
      results.push(`  • Технические: ${result.technicalScore}/100`);
      
      results.push(`\n📈 Статистика:`);
      results.push(`  • Заголовок: ${result.title || '(нет)'}`);
      results.push(`  • H1: ${result.h1Count}, H2: ${result.h2Count}`);
      results.push(`  • Изображения: ${result.totalImages} (без alt: ${result.imagesWithoutAlt})`);
      results.push(`  • Ссылки: ${result.totalLinks}`);
      results.push(`  • Слова: ${result.wordCount}`);
      results.push(`  • HTTPS: ${result.hasHttps ? '✅' : '❌'}`);
      results.push(`  • Viewport: ${result.hasViewport ? '✅' : '❌'}`);
      results.push(`  • Favicon: ${result.hasFavicon ? '✅' : '❌'}`);
      results.push(`  • Forms: ${result.hasForms ? '✅' : '❌'}`);
      
      results.push(`\n⚠️ Найдено проблем: ${result.issues.length}`);
      if (result.issues.length > 0) {
        results.push('Топ-5 проблем:');
        result.issues.slice(0, 5).forEach((issue, idx) => {
          results.push(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }
      
      // Test conversion
      const converted = convertToAnalysisData(result);
      results.push(`\n✅ Конвертация данных успешна`);
      results.push(`  • Название: ${converted.siteName}`);
      results.push(`  • Проблемы в контенте: ${converted.content.issues.length}`);
      results.push(`  • Проблемы в UX: ${converted.ux.issues.length}`);
      results.push(`  • Проблемы в SEO: ${converted.seo.issues.length}`);
      results.push(`  • Проблемы в технических: ${converted.technical.issues.length}`);
      
      return results;
    } catch (error) {
      results.push(`\n❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return results;
    }
  };

  const runAllTests = async () => {
    setTestMode(true);
    setTestResults([]);
    
    const allResults: string[] = ['=== ЗАПУСК ТЕСТОВ ===\n'];
    
    // Test 1: expomap.ru
    const test1Results = await runTest(
      'https://expomap.ru/conference/nedelya-bezopasnosti-techexpert/',
      'Expomap.ru - Неделя безопасности Техэксперт'
    );
    allResults.push(...test1Results);
    
    // Test 2: nic-conf.ru
    const test2Results = await runTest(
      'https://nic-conf.ru/',
      'NIC Conference - Связь. Перспективы. Технологии 2030'
    );
    allResults.push(...test2Results);
    
    allResults.push('\n=== ТЕСТЫ ЗАВЕРШЕНЫ ===');
    
    setTestResults(allResults);
  };

  const handleAnalyze = async (url: string, useDemo: boolean = false) => {
    setSiteUrl(url);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setCurrentData(null);
    setError(null);
    setActiveTab('overview');

    try {
      let result: AnalysisResult;
      
      if (useDemo) {
        // Используем демо-данные
        result = getDemoData(url);
      } else {
        // Запускаем реальный анализ
        result = await analyzeWebsite(url);
      }
      
      const convertedData = convertToAnalysisData(result);
      
      setCurrentData(convertedData);
      setAnalysisComplete(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при анализе сайта';
      
      // Добавляем подсказки в зависимости от типа ошибки
      let helpfulMessage = errorMessage;
      if (errorMessage.includes('timed out') || errorMessage.includes('timeout')) {
        helpfulMessage = 'Превышено время ожидания ответа от сервера. Это может быть связано с:\n' +
          '• Медленным интернет-соединением\n' +
          '• Недоступностью CORS прокси\n' +
          '• Блокировкой запросов сайтом\n\n' +
          'Попробуйте повторить анализ или использовать демо-режим.';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        helpfulMessage = 'Не удалось установить соединение с сервером. Проверьте:\n' +
          '• Подключение к интернету\n' +
          '• Правильность URL адреса\n' +
          '• Доступность сайта\n\n' +
          'Или используйте демо-режим для просмотра примера работы.';
      }
      
      setError(helpfulMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSiteUrl('');
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setCurrentData(null);
    setError(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Mode Button */}
        {!isAnalyzing && !analysisComplete && !error && !testMode && (
          <div className="max-w-3xl mx-auto mb-6">
            <button
              onClick={runAllTests}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
            >
              🧪 Запустить автоматические тесты (expomap.ru + nic-conf.ru)
            </button>
          </div>
        )}

        {/* Test Results */}
        {testMode && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">🧪 Результаты тестирования</h2>
                <button
                  onClick={() => {
                    setTestMode(false);
                    setTestResults([]);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                >
                  Закрыть
                </button>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                  {testResults.length > 0 ? testResults.join('\n') : '⏳ Выполнение тестов...'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* URL Input */}
        {!isAnalyzing && !analysisComplete && !error && !testMode && (
          <UrlInput onAnalyze={handleAnalyze} />
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <span className="text-3xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Ошибка анализа</h3>
                  <p className="text-slate-300 mb-4 whitespace-pre-line">{error}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleAnalyze(siteUrl)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Повторить анализ
                    </button>
                    <button
                      onClick={() => handleAnalyze(siteUrl, true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span>🎭</span>
                      Демо-режим
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Анализировать другой сайт
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing Animation */}
        {isAnalyzing && (
          <AnalyzingScreen url={siteUrl} />
        )}

        {/* Results */}
        {analysisComplete && currentData && (
          <>
            {/* Analyzed URL Bar */}
            <div className="mb-6 flex items-center justify-between bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-slate-400">Проанализирован сайт:</span>
                <a 
                  href={currentData.siteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium truncate max-w-md"
                >
                  {currentData.siteUrl}
                </a>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all border border-slate-600/50"
              >
                🔍 Анализировать другой сайт
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/50 p-2 rounded-xl backdrop-blur-sm border border-slate-700/50">
              {[
                { id: 'overview', label: '📊 Общая оценка' },
                { id: 'content', label: '📝 Контент' },
                { id: 'ux', label: '🎨 UX/UI' },
                { id: 'seo', label: '🔍 SEO' },
                { id: 'technical', label: '⚙️ Технические' },
                { id: 'recommendations', label: '💡 Рекомендации' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <ScoreOverview data={currentData} />
                <PriorityMatrix data={currentData} />
              </div>
            )}

            {activeTab === 'content' && (
              <AnalysisSection 
                title="Анализ контента" 
                icon="📝"
                section={currentData.content} 
              />
            )}

            {activeTab === 'ux' && (
              <AnalysisSection 
                title="Анализ UX/UI" 
                icon="🎨"
                section={currentData.ux} 
              />
            )}

            {activeTab === 'seo' && (
              <AnalysisSection 
                title="Анализ SEO" 
                icon="🔍"
                section={currentData.seo} 
              />
            )}

            {activeTab === 'technical' && (
              <AnalysisSection 
                title="Технический анализ" 
                icon="⚙️"
                section={currentData.technical} 
              />
            )}

            {activeTab === 'recommendations' && (
              <RecommendationsList data={currentData} />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
