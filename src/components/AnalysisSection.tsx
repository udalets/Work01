import { useState } from 'react';
import { SectionData } from '../data/analysisData';

interface Props {
  title: string;
  icon: string;
  section: SectionData;
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-300 border-green-500/30',
  };
  const labels = {
    critical: 'Критический',
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[severity as keyof typeof styles]}`}>
      {labels[severity as keyof typeof labels]}
    </span>
  );
}

export default function AnalysisSection({ title, icon, section }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">{icon}</span>
              {title}
            </h2>
            <p className="text-slate-400 mt-2 max-w-2xl">{section.summary}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className={`text-3xl font-bold ${section.score >= 70 ? 'text-green-400' : section.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {section.score}
              </div>
              <div className="text-xs text-slate-400">баллов</div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {section.issues.length === 0 && (
          <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20 text-center">
            <span className="text-3xl mb-2 block">✅</span>
            <p className="text-green-300 font-medium">Проблем в данной категории не обнаружено!</p>
            <p className="text-slate-400 text-sm mt-1">Этот аспект сайта реализован хорошо.</p>
          </div>
        )}
        {section.issues.map((issue) => (
          <div 
            key={issue.id}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden transition-all duration-200 hover:border-slate-600/50"
          >
            <button
              onClick={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
              className="w-full p-5 text-left flex items-start gap-4"
            >
              <div className="flex-shrink-0 mt-0.5">
                {issue.severity === 'critical' && <span className="text-xl">🔴</span>}
                {issue.severity === 'high' && <span className="text-xl">🟠</span>}
                {issue.severity === 'medium' && <span className="text-xl">🟡</span>}
                {issue.severity === 'low' && <span className="text-xl">🟢</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-white">{issue.title}</h3>
                  <SeverityBadge severity={issue.severity} />
                </div>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{issue.description}</p>
              </div>
              <div className="flex-shrink-0">
                <svg 
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${expandedId === issue.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {expandedId === issue.id && (
              <div className="px-5 pb-5 pt-0 border-t border-slate-700/30">
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <span>💡</span> Рекомендация
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{issue.recommendation}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <span>📈</span> Ожидаемый эффект
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{issue.impact}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
