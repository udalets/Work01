import { useState, useEffect } from 'react';
import Header from './components/Header';
import ScoreOverview from './components/ScoreOverview';
import AnalysisSection from './components/AnalysisSection';
import RecommendationsList from './components/RecommendationsList';
import PriorityMatrix from './components/PriorityMatrix';
import Footer from './components/Footer';
import UrlInput from './components/UrlInput';
import AnalyzingScreen from './components/AnalyzingScreen';
import { analysisData, AnalysisData } from './data/analysisData';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [currentData, setCurrentData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleAnalyze = (url: string) => {
    setSiteUrl(url);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setCurrentData(null);
    setActiveTab('overview');
  };

  const handleAnalysisFinish = () => {
    setIsAnalyzing(false);
    setAnalysisComplete(true);
    // Обновляем данные с новым URL
    setCurrentData({
      ...analysisData,
      siteUrl: siteUrl,
    });
  };

  const handleReset = () => {
    setSiteUrl('');
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setCurrentData(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* URL Input */}
        {!isAnalyzing && !analysisComplete && (
          <UrlInput onAnalyze={handleAnalyze} />
        )}

        {/* Analyzing Animation */}
        {isAnalyzing && (
          <AnalyzingScreen url={siteUrl} onFinish={handleAnalysisFinish} />
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
