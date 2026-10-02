export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm text-slate-400">AI Website Analyzer</span>
          </div>
          
          <div className="text-center text-sm text-slate-500">
            Анализ выполнен на основе публично доступной информации сайта
          </div>
          
          <div className="text-sm text-slate-500">
            © 2026 • AI Agent Report
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <p className="text-xs text-slate-500 text-center">
            ⚠️ Данный анализ носит рекомендательный характер и основан на автоматическом анализе публичной части сайта. 
            Для полного аудита рекомендуется также проверить внутреннюю аналитику, скорость загрузки, 
            мобильную адаптацию и провести пользовательское тестирование.
          </p>
        </div>
      </div>
    </footer>
  );
}
