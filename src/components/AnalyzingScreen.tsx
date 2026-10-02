import { useState, useEffect } from 'react';

interface Props {
  url: string;
  onFinish: () => void;
}

interface AnalysisStep {
  label: string;
  icon: string;
  duration: number;
}

const analysisSteps: AnalysisStep[] = [
  { label: 'Подключение к серверу...', icon: '🌐', duration: 800 },
  { label: 'Загрузка HTML-структуры...', icon: '📄', duration: 1000 },
  { label: 'Анализ мета-тегов и заголовков...', icon: '🏷️', duration: 1200 },
  { label: 'Проверка SEO-оптимизации...', icon: '🔍', duration: 1500 },
  { label: 'Анализ UX/UI элементов...', icon: '🎨', duration: 1300 },
  { label: 'Проверка контента и структуры...', icon: '📝', duration: 1400 },
  { label: 'Технический аудит...', icon: '⚙️', duration: 1100 },
  { label: 'Анализ производительности...', icon: '⚡', duration: 900 },
  { label: 'Проверка мобильной адаптации...', icon: '📱', duration: 1000 },
  { label: 'Формирование рекомендаций...', icon: '💡', duration: 1200 },
  { label: 'Генерация отчёта...', icon: '📊', duration: 800 },
];

export default function AnalyzingScreen({ url, onFinish }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const totalDuration = analysisSteps.reduce((acc, step) => acc + step.duration, 0);
    let elapsed = 0;

    const stepTimers: ReturnType<typeof setTimeout>[] = [];

    analysisSteps.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCurrentStep(index);
        setCompletedSteps(prev => [...prev, index]);
      }, elapsed);
      stepTimers.push(timer);
      elapsed += step.duration;
    });

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (totalDuration / 50));
      });
    }, 50);

    // Finish
    const finishTimer = setTimeout(() => {
      onFinish();
    }, totalDuration + 500);

    return () => {
      stepTimers.forEach(timer => clearTimeout(timer));
      clearInterval(progressInterval);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

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

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Прогресс анализа</span>
            <span className="text-blue-400 font-medium">{Math.min(Math.round(progress), 100)}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
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
            ⏱️ Примерное время анализа: ~15 секунд • Анализируется {analysisSteps.length} параметров
          </p>
        </div>
      </div>
    </div>
  );
}
