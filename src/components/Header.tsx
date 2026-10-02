import { useState, useEffect } from 'react';

export default function Header() {
  const [typedText, setTypedText] = useState('');
  const fullText = 'AI-агент анализа сайта конференций';
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-cyan-900/30" />
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">AI Website Analyzer v2.0</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
          {typedText}
          <span className="animate-pulse text-blue-400">|</span>
        </h1>
        
        <p className="text-lg text-slate-300 max-w-3xl mb-6">
          Комплексный анализ сайта <a href="https://nic-conf.ru/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">nic-conf.ru</a> — 
          XXI Всероссийской научно-практической конференции «Связь. Перспективы. Технологии 2030»
        </p>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-300">Анализ завершён</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
            <span className="text-slate-400">📅</span>
            <span className="text-slate-300">Дата анализа: 15 января 2026</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
            <span className="text-slate-400">🔍</span>
            <span className="text-slate-300">Проверено: 24 параметра</span>
          </div>
        </div>
      </div>
    </header>
  );
}
