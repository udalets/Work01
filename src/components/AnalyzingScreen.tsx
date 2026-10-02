import { useState, useEffect } from 'react';

interface Props {
  url: string;
}

interface AnalysisStep {
  label: string;
  icon: string;
}

const analysisSteps: AnalysisStep[] = [
  { label: 'Подключение к серверу...', icon: '🌐' },
  { label: 'Загрузка HTML-структуры...', icon: '📄' },
  { label: 'Анализ мета-тегов и заголовков...', icon: '🏷️' },
  { label: 'Проверка SEO-оптимизации...', icon: '🔍' },
  { label: 'Анализ UX/UI элементов...', icon: '🎨' },
  { label: 'Проверка контента и структуры...', icon: '📝' },
  { label: 'Технический аудит...', icon: '⚙️' },
  { label: 'Проверка robots.txt и sitemap.xml...', icon: '📋' },
  { label: 'Анализ производительности...', icon: '⚡' },
  { label: 'Формирование рекомендаций...', icon: '💡' },
  { label: 'Генерация отчёта...', icon: '📊' },
];

export default function AnalyzingScreen({ url }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    // Simulate step progression while real analysis runs
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < analysisSteps.length - 1) {
          setCompletedSteps(s => [...s, prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            AI-агент анализирует сайт
          </h2>
          <p className="text-slate-400 text-sm">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              {url}
            </a>
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {analysisSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-blue-500/10 border border-blue-500/30' 
                    : isCompleted 
                      ? 'bg-green-500/5 border border-green-500/20' 
                      : 'bg-slate-800/30 border border-transparent'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isCompleted 
                    ? 'bg-green-500/20 text-green-400' 
                    : isCurrent 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-slate-700/50 text-slate-500'
                }`}>
                  {isCompleted ? '✓' : step.icon}
                </div>
                <span className={`text-sm ${
                  isCompleted 
                    ? 'text-green-300' 
                    : isCurrent 
                      ? 'text-blue-300 font-medium' 
                      : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
                {isCurrent && (
                  <div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom info */}
        <div className="mt-6 p-4 bg-slate-900/40 rounded-lg border border-slate-700/30">
          <p className="text-xs text-slate-500 text-center">
            ⏱️ Анализ может занять 10-30 секунд в зависимости от размера сайта
          </p>
        </div>
      </div>
    </div>
  );
}
