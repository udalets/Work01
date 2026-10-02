import { useState } from 'react';

interface Props {
  onAnalyze: (url: string) => void;
}

export default function UrlInput({ onAnalyze }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (input: string): boolean => {
    try {
      const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
      return urlObj.hostname.includes('.');
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Пожалуйста, введите URL сайта');
      return;
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    if (!validateUrl(normalizedUrl)) {
      setError('Пожалуйста, введите корректный URL (например, example.com)');
      return;
    }

    onAnalyze(normalizedUrl);
  };

  const quickExamples = [
    'nic-conf.ru',
    'ted.com',
    'python.ru',
    'habr.com',
  ];

  return (
    <div className="max-w-3xl mx-auto mb-12">
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            🔍 Введите URL сайта для анализа
          </h2>
          <p className="text-slate-400">
            AI-агент проведёт комплексный анализ и предоставит рекомендации по улучшению
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="example.com или https://example.com"
              className="w-full pl-12 pr-4 py-4 bg-slate-900/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-lg transition-all"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Начать анализ
            </span>
          </button>
        </form>

        {/* Quick examples */}
        <div className="mt-6">
          <p className="text-xs text-slate-500 mb-2 text-center">Быстрый доступ:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickExamples.map((example) => (
              <button
                key={example}
                onClick={() => {
                  setUrl(example);
                  setError('');
                }}
                className="px-3 py-1.5 bg-slate-700/40 hover:bg-slate-600/50 border border-slate-600/30 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '📝', label: 'Контент' },
            { icon: '🎨', label: 'UX/UI' },
            { icon: '🔍', label: 'SEO' },
            { icon: '⚙️', label: 'Технический' },
          ].map((feature) => (
            <div key={feature.label} className="flex items-center gap-2 bg-slate-800/40 rounded-lg p-2.5 border border-slate-700/30">
              <span className="text-lg">{feature.icon}</span>
              <span className="text-xs text-slate-400">Анализ: {feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
