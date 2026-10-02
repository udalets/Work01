import { AnalysisData } from '../data/analysisData';
import { useState } from 'react';

interface Props {
  data: AnalysisData;
}

type FilterType = 'all' | 'critical' | 'high' | 'medium' | 'low';

export default function RecommendationsList({ data }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const allIssues = [
    ...data.content.issues.map(i => ({ ...i, section: 'Контент' })),
    ...data.ux.issues.map(i => ({ ...i, section: 'UX/UI' })),
    ...data.seo.issues.map(i => ({ ...i, section: 'SEO' })),
    ...data.technical.issues.map(i => ({ ...i, section: 'Технические' })),
  ];

  const filteredIssues = filter === 'all' 
    ? allIssues 
    : allIssues.filter(i => i.severity === filter);

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  filteredIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'border-l-red-500 bg-red-500/5';
      case 'high': return 'border-l-orange-500 bg-orange-500/5';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'low': return 'border-l-green-500 bg-green-500/5';
      default: return 'border-l-slate-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '💡';
      case 'low': return '✅';
      default: return '📌';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">💡</span>
          Все рекомендации по приоритету
        </h2>
        <p className="text-slate-400 mt-2">
          Полный список рекомендаций, отсортированных по приоритету. Начните с критических и высоких приоритетов для максимального эффекта.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all' as FilterType, label: 'Все', count: allIssues.length },
          { id: 'critical' as FilterType, label: '🚨 Критические', count: allIssues.filter(i => i.severity === 'critical').length },
          { id: 'high' as FilterType, label: '⚠️ Высокие', count: allIssues.filter(i => i.severity === 'high').length },
          { id: 'medium' as FilterType, label: '💡 Средние', count: allIssues.filter(i => i.severity === 'medium').length },
          { id: 'low' as FilterType, label: '✅ Низкие', count: allIssues.filter(i => i.severity === 'low').length },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700/50'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {filteredIssues.map((issue, index) => (
          <div 
            key={issue.id}
            className={`rounded-xl border-l-4 p-5 bg-slate-800/40 border border-slate-700/30 ${getSeverityColor(issue.severity)}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-sm font-bold text-slate-300">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                  <h3 className="font-semibold text-white text-lg">{issue.title}</h3>
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-700/50 text-slate-300">{issue.section}</span>
                </div>
                
                <p className="text-slate-400 text-sm mb-4">{issue.description}</p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Что сделать</h4>
                    <p className="text-slate-300 text-sm">{issue.recommendation}</p>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                    <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1">Эффект</h4>
                    <p className="text-slate-300 text-sm">{issue.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-700/30">
        <h3 className="text-lg font-semibold text-white mb-3">📋 План внедрения</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-red-400 mb-2">Неделя 1-2</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Упростить форму регистрации</li>
              <li>• Добавить раздел FAQ</li>
              <li>• Настроить аналитику</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-orange-400 mb-2">Неделя 3-4</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Добавить раздел «Спикеры»</li>
              <li>• Создать страницу «Архив»</li>
              <li>• Оптимизировать SEO</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">Неделя 5-8</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Внедрить чат-бот</li>
              <li>• Добавить блог/новости</li>
              <li>• Создать отдельные страницы</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
