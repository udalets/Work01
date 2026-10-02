import { useState, useEffect } from 'react';
import Header from './components/Header';
import ScoreOverview from './components/ScoreOverview';
import AnalysisSection from './components/AnalysisSection';
import RecommendationsList from './components/RecommendationsList';
import PriorityMatrix from './components/PriorityMatrix';
import Footer from './components/Footer';
import { analysisData } from './data/analysisData';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <ScoreOverview data={analysisData} />
            <PriorityMatrix data={analysisData} />
          </div>
        )}

        {activeTab === 'content' && (
          <AnalysisSection 
            title="Анализ контента" 
            icon="📝"
            section={analysisData.content} 
          />
        )}

        {activeTab === 'ux' && (
          <AnalysisSection 
            title="Анализ UX/UI" 
            icon="🎨"
            section={analysisData.ux} 
          />
        )}

        {activeTab === 'seo' && (
          <AnalysisSection 
            title="Анализ SEO" 
            icon="🔍"
            section={analysisData.seo} 
          />
        )}

        {activeTab === 'technical' && (
          <AnalysisSection 
            title="Технический анализ" 
            icon="⚙️"
            section={analysisData.technical} 
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsList data={analysisData} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
