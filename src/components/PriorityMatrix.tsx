import { AnalysisData } from '../data/analysisData';

interface Props {
  data: AnalysisData;
}

export default function PriorityMatrix({ data }: Props) {
  const allIssues = [
    ...data.content.issues.map(i => ({ ...i, section: 'Контент', sectionColor: 'text-blue-400' })),
    ...data.ux.issues.map(i => ({ ...i, section: 'UX/UI', sectionColor: 'text-purple-400' })),
    ...data.seo.issues.map(i => ({ ...i, section: 'SEO', sectionColor: 'text-orange-400' })),
    ...data.technical.issues.map(i => ({ ...i, section: 'Технические', sectionColor: 'text-green-400' })),
  ];

  const getImpactScore = (severity: string) => {
    switch(severity) {
      case 'critical': return 95;
      case 'high': return 75;
      case 'medium': return 50;
      case 'low': return 25;
      default: return 0;
    }
  };

  const getEffortScore = (severity: string) => {
    switch(severity) {
      case 'critical': return 70;
      case 'high': return 60;
      case 'medium': return 40;
      case 'low': return 20;
      default: return 0;
    }
  };

  // Quadrants
  const quickWins = allIssues.filter(i => getImpactScore(i.severity) >= 70 && getEffortScore(i.severity) <= 60);
  const bigProjects = allIssues.filter(i => getImpactScore(i.severity) >= 70 && getEffortScore(i.severity) > 60);
  const fillIns = allIssues.filter(i => getImpactScore(i.severity) < 70 && getEffortScore(i.severity) <= 40);
  const thankless = allIssues.filter(i => getImpactScore(i.severity) < 70 && getEffortScore(i.severity) > 40);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📊</span>
          Матрица приоритетов
        </h2>
        <p className="text-slate-400 mt-2">
          Визуализация задач по осям «Влияние» и «Сложность реализации». Начните с «Быстрых побед».
        </p>
      </div>

      {/* Matrix Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Quick Wins - High Impact, Low Effort */}
        <div className="bg-green-500/5 rounded-xl p-5 border border-green-500/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🚀</span>
            <div>
              <h3 className="font-bold text-green-400">Быстрые победы</h3>
              <p className="text-xs text-slate-400">Высокое влияние, низкая сложность</p>
            </div>
          </div>
          <div className="space-y-2">
            {quickWins.map(issue => (
              <div key={issue.id} className="flex items-center gap-2 text-sm">
                <span className={`text-xs ${issue.sectionColor}`}>[{issue.section}]</span>
                <span className="text-slate-300">{issue.title}</span>
              </div>
            ))}
            {quickWins.length === 0 && <p className="text-slate-500 text-sm italic">Нет задач в этой категории</p>}
          </div>
        </div>

        {/* Big Projects - High Impact, High Effort */}
        <div className="bg-blue-500/5 rounded-xl p-5 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏗️</span>
            <div>
              <h3 className="font-bold text-blue-400">Большие проекты</h3>
              <p className="text-xs text-slate-400">Высокое влияние, высокая сложность</p>
            </div>
          </div>
          <div className="space-y-2">
            {bigProjects.map(issue => (
              <div key={issue.id} className="flex items-center gap-2 text-sm">
                <span className={`text-xs ${issue.sectionColor}`}>[{issue.section}]</span>
                <span className="text-slate-300">{issue.title}</span>
              </div>
            ))}
            {bigProjects.length === 0 && <p className="text-slate-500 text-sm italic">Нет задач в этой категории</p>}
          </div>
        </div>

        {/* Fill-ins - Low Impact, Low Effort */}
        <div className="bg-yellow-500/5 rounded-xl p-5 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📝</span>
            <div>
              <h3 className="font-bold text-yellow-400">Заполнители</h3>
              <p className="text-xs text-slate-400">Низкое влияние, низкая сложность</p>
            </div>
          </div>
          <div className="space-y-2">
            {fillIns.map(issue => (
              <div key={issue.id} className="flex items-center gap-2 text-sm">
                <span className={`text-xs ${issue.sectionColor}`}>[{issue.section}]</span>
                <span className="text-slate-300">{issue.title}</span>
              </div>
            ))}
            {fillIns.length === 0 && <p className="text-slate-500 text-sm italic">Нет задач в этой категории</p>}
          </div>
        </div>

        {/* Thankless - Low Impact, High Effort */}
        <div className="bg-slate-500/5 rounded-xl p-5 border border-slate-500/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⏸️</span>
            <div>
              <h3 className="font-bold text-slate-400">Отложить</h3>
              <p className="text-xs text-slate-400">Низкое влияние, высокая сложность</p>
            </div>
          </div>
          <div className="space-y-2">
            {thankless.map(issue => (
              <div key={issue.id} className="flex items-center gap-2 text-sm">
                <span className={`text-xs ${issue.sectionColor}`}>[{issue.section}]</span>
                <span className="text-slate-300">{issue.title}</span>
              </div>
            ))}
            {thankless.length === 0 && <p className="text-slate-500 text-sm italic">Нет задач в этой категории</p>}
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Распределение по категориям</h3>
        <div className="space-y-4">
          {[
            { label: 'Контент', count: data.content.issues.length, color: 'bg-blue-500', score: data.content.score },
            { label: 'UX/UI', count: data.ux.issues.length, color: 'bg-purple-500', score: data.ux.score },
            { label: 'SEO', count: data.seo.issues.length, color: 'bg-orange-500', score: data.seo.score },
            { label: 'Технические', count: data.technical.issues.length, color: 'bg-green-500', score: data.technical.score },
          ].map(cat => (
            <div key={cat.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">{cat.label}</span>
                <span className="text-slate-400">{cat.count} проблем • {cat.score}/100</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${cat.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
