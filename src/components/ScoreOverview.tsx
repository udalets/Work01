import { AnalysisData } from '../data/analysisData';

interface Props {
  data: AnalysisData;
}

function ScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-700" />
          <circle 
            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" 
            className={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
        </div>
      </div>
      <span className="mt-2 text-sm text-slate-400 text-center">{label}</span>
    </div>
  );
}

export default function ScoreOverview({ data }: Props) {
  const overallColor = data.overallScore >= 70 ? 'text-green-400' : data.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400';
  
  const totalIssues = data.content.issues.length + data.ux.issues.length + data.seo.issues.length + data.technical.issues.length;
  const criticalIssues = [data.content, data.ux, data.seo, data.technical]
    .flatMap(s => s.issues)
    .filter(i => i.severity === 'critical').length;
  const highIssues = [data.content, data.ux, data.seo, data.technical]
    .flatMap(s => s.issues)
    .filter(i => i.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Overall Score */}
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-700" />
                <circle 
                  cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" 
                  className={overallColor}
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 - (data.overallScore / 100) * 2 * Math.PI * 42}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 2s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${overallColor}`}>{data.overallScore}</span>
                <span className="text-xs text-slate-400">из 100</span>
              </div>
            </div>
            <span className="mt-3 text-lg font-semibold text-white">Общая оценка</span>
            <span className="text-sm text-slate-400">Требует улучшения</span>
          </div>

          {/* Category Scores */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            <ScoreCircle score={data.content.score} label="Контент" color="text-blue-400" />
            <ScoreCircle score={data.ux.score} label="UX/UI" color="text-purple-400" />
            <ScoreCircle score={data.seo.score} label="SEO" color="text-orange-400" />
            <ScoreCircle score={data.technical.score} label="Технические" color="text-green-400" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
          <div className="text-3xl font-bold text-white">{totalIssues}</div>
          <div className="text-sm text-slate-400 mt-1">Всего проблем</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-5 border border-red-900/30">
          <div className="text-3xl font-bold text-red-400">{criticalIssues}</div>
          <div className="text-sm text-slate-400 mt-1">Критических</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-5 border border-orange-900/30">
          <div className="text-3xl font-bold text-orange-400">{highIssues}</div>
          <div className="text-sm text-slate-400 mt-1">Высокий приоритет</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-5 border border-green-900/30">
          <div className="text-3xl font-bold text-green-400">{totalIssues - criticalIssues - highIssues}</div>
          <div className="text-sm text-slate-400 mt-1">Средний/Низкий</div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span>🤖</span> Резюме AI-анализа
        </h3>
        <p className="text-slate-300 leading-relaxed">
          Сайт конференции «Связь. Перспективы. Технологии 2030» имеет базовую структуру и содержит необходимую информацию, 
          но требует существенных улучшений. <strong className="text-yellow-400">Наиболее критичные проблемы</strong> — 
          сложная форма регистрации, отсутствие информации о спикерах и слабая SEO-оптимизация. 
          <strong className="text-green-400"> Сильные стороны</strong> — чистый дизайн на Tilda, наличие программы и чёткая структура направлений. 
          При внедрении рекомендованных изменений оценка может быть повышена до <strong className="text-blue-400">85+ баллов</strong>.
        </p>
      </div>
    </div>
  );
}
