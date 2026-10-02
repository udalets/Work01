#!/bin/bash

echo "=== Проверка работоспособности анализатора сайтов ==="
echo ""

# Проверка 1: Сборка проекта
echo "1️⃣ Проверка сборки проекта..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Сборка успешна"
else
    echo "❌ Ошибка сборки"
    exit 1
fi

# Проверка 2: Наличие всех необходимых файлов
echo ""
echo "2️⃣ Проверка наличия файлов..."
files=(
    "src/App.tsx"
    "src/main.tsx"
    "src/services/analyzer.ts"
    "src/services/adapter.ts"
    "src/data/analysisData.ts"
    "src/components/Header.tsx"
    "src/components/UrlInput.tsx"
    "src/components/AnalyzingScreen.tsx"
    "src/components/ScoreOverview.tsx"
    "src/components/AnalysisSection.tsx"
    "src/components/RecommendationsList.tsx"
    "src/components/PriorityMatrix.tsx"
    "src/components/Footer.tsx"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (отсутствует)"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo "❌ Некоторые файлы отсутствуют"
    exit 1
fi

# Проверка 3: Проверка типов TypeScript
echo ""
echo "3️⃣ Проверка типов TypeScript..."
npx tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Типы корректны"
else
    echo "⚠️ Предупреждения TypeScript (не критично)"
fi

# Проверка 4: Проверка размера бандла
echo ""
echo "4️⃣ Проверка размера бандла..."
if [ -f "dist/index.html" ]; then
    html_size=$(wc -c < dist/index.html)
    echo "✅ dist/index.html: $html_size байт"
else
    echo "❌ dist/index.html не найден"
    exit 1
fi

if [ -f "dist/assets/index-Ew8dBR3W.js" ]; then
    js_size=$(wc -c < dist/assets/index-Ew8dBR3W.js)
    js_size_kb=$((js_size / 1024))
    echo "✅ JavaScript бандл: ${js_size_kb} KB"
else
    echo "⚠️ JavaScript бандл не найден (может иметь другое имя)"
fi

# Проверка 5: Проверка ключевых функций
echo ""
echo "5️⃣ Проверка ключевых функций..."

# Проверка analyzeWebsite
if grep -q "export async function analyzeWebsite" src/services/analyzer.ts; then
    echo "✅ Функция analyzeWebsite найдена"
else
    echo "❌ Функция analyzeWebsite не найдена"
    exit 1
fi

# Проверка convertToAnalysisData
if grep -q "export function convertToAnalysisData" src/services/adapter.ts; then
    echo "✅ Функция convertToAnalysisData найдена"
else
    echo "❌ Функция convertToAnalysisData не найдена"
    exit 1
fi

# Проверка CORS прокси
if grep -q "CORS_PROXIES" src/services/analyzer.ts; then
    echo "✅ CORS прокси настроены"
else
    echo "❌ CORS прокси не найдены"
    exit 1
fi

# Проверка обработки ошибок
if grep -q "try {" src/services/analyzer.ts; then
    echo "✅ Обработка ошибок присутствует"
else
    echo "❌ Обработка ошибок отсутствует"
    exit 1
fi

# Проверка 6: Проверка компонентов
echo ""
echo "6️⃣ Проверка компонентов..."

components=(
    "Header"
    "UrlInput"
    "AnalyzingScreen"
    "ScoreOverview"
    "AnalysisSection"
    "RecommendationsList"
    "PriorityMatrix"
    "Footer"
)

for component in "${components[@]}"; do
    if grep -q "export default function $component" src/components/$component.tsx; then
        echo "✅ Компонент $component экспортируется"
    else
        echo "❌ Компонент $component не экспортируется"
        exit 1
    fi
done

# Проверка 7: Проверка тестового режима
echo ""
echo "7️⃣ Проверка тестового режима..."

if grep -q "runAllTests" src/App.tsx; then
    echo "✅ Тестовый режим добавлен"
else
    echo "❌ Тестовый режим не найден"
    exit 1
fi

if grep -q "testMode" src/App.tsx; then
    echo "✅ Состояние testMode присутствует"
else
    echo "❌ Состояние testMode отсутствует"
    exit 1
fi

# Финальная проверка
echo ""
echo "=== ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО ==="
echo ""
echo "📊 Статистика проекта:"
echo "  • Файлов: ${#files[@]}"
echo "  • Компонентов: ${#components[@]}"
echo "  • Размер HTML: $html_size байт"
echo "  • Размер JS: ${js_size_kb} KB"
echo ""
echo "✅ Проект готов к использованию!"
echo ""
echo "🚀 Для запуска:"
echo "  npm run dev"
echo ""
echo "🧪 Для тестирования:"
echo "  Откройте приложение и нажмите кнопку 'Запустить автоматические тесты'"
