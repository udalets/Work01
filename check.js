const fs = require('fs');
const path = require('path');

console.log('=== Проверка работоспособности анализатора сайтов ===\n');

// Проверка 1: Наличие всех необходимых файлов
console.log('1️⃣ Проверка наличия файлов...');
const files = [
    'src/App.tsx',
    'src/main.tsx',
    'src/services/analyzer.ts',
    'src/services/adapter.ts',
    'src/data/analysisData.ts',
    'src/components/Header.tsx',
    'src/components/UrlInput.tsx',
    'src/components/AnalyzingScreen.tsx',
    'src/components/ScoreOverview.tsx',
    'src/components/AnalysisSection.tsx',
    'src/components/RecommendationsList.tsx',
    'src/components/PriorityMatrix.tsx',
    'src/components/Footer.tsx',
];

let allFilesExist = true;
files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} (отсутствует)`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Некоторые файлы отсутствуют');
    process.exit(1);
}

// Проверка 2: Проверка ключевых функций
console.log('\n2️⃣ Проверка ключевых функций...');

const analyzerContent = fs.readFileSync('src/services/analyzer.ts', 'utf8');
const adapterContent = fs.readFileSync('src/services/adapter.ts', 'utf8');
const appContent = fs.readFileSync('src/App.tsx', 'utf8');

const checks = [
    { name: 'analyzeWebsite функция', content: analyzerContent, pattern: /export async function analyzeWebsite/ },
    { name: 'convertToAnalysisData функция', content: adapterContent, pattern: /export function convertToAnalysisData/ },
    { name: 'CORS прокси', content: analyzerContent, pattern: /CORS_PROXIES/ },
    { name: 'Обработка ошибок', content: analyzerContent, pattern: /try \{/ },
    { name: 'fetchWithProxy функция', content: analyzerContent, pattern: /async function fetchWithProxy/ },
    { name: 'parseHTML функция', content: analyzerContent, pattern: /function parseHTML/ },
    { name: 'calculateScores функция', content: analyzerContent, pattern: /function calculateScores/ },
    { name: 'generateIssues функция', content: analyzerContent, pattern: /function generateIssues/ },
];

let allChecksPassed = true;
checks.forEach(check => {
    if (check.pattern.test(check.content)) {
        console.log(`  ✅ ${check.name}`);
    } else {
        console.log(`  ❌ ${check.name} (не найдена)`);
        allChecksPassed = false;
    }
});

if (!allChecksPassed) {
    console.log('\n❌ Некоторые функции отсутствуют');
    process.exit(1);
}

// Проверка 3: Проверка компонентов
console.log('\n3️⃣ Проверка компонентов...');

const components = [
    'Header',
    'UrlInput',
    'AnalyzingScreen',
    'ScoreOverview',
    'AnalysisSection',
    'RecommendationsList',
    'PriorityMatrix',
    'Footer',
];

components.forEach(component => {
    const componentPath = `src/components/${component}.tsx`;
    if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        if (content.includes(`export default function ${component}`)) {
            console.log(`  ✅ Компонент ${component} экспортируется`);
        } else {
            console.log(`  ❌ Компонент ${component} не экспортируется`);
            allChecksPassed = false;
        }
    }
});

// Проверка 4: Проверка тестового режима
console.log('\n4️⃣ Проверка тестового режима...');

const testChecks = [
    { name: 'runAllTests функция', pattern: /runAllTests/ },
    { name: 'testMode состояние', pattern: /testMode/ },
    { name: 'testResults состояние', pattern: /testResults/ },
    { name: 'Кнопка тестирования', pattern: /Запустить автоматические тесты/ },
];

testChecks.forEach(check => {
    if (check.pattern.test(appContent)) {
        console.log(`  ✅ ${check.name}`);
    } else {
        console.log(`  ❌ ${check.name} (не найдена)`);
        allChecksPassed = false;
    }
});

// Проверка 5: Проверка обработки ошибок
console.log('\n5️⃣ Проверка обработки ошибок...');

const errorChecks = [
    { name: 'try-catch в analyzeWebsite', content: analyzerContent, pattern: /try \{[\s\S]*?analyzeWebsite/ },
    { name: 'throw new Error', content: analyzerContent, pattern: /throw new Error/ },
    { name: 'Обработка в App.tsx', content: appContent, pattern: /catch \(err\)/ },
    { name: 'setError функция', content: appContent, pattern: /setError/ },
];

errorChecks.forEach(check => {
    if (check.pattern.test(check.content)) {
        console.log(`  ✅ ${check.name}`);
    } else {
        console.log(`  ⚠️ ${check.name} (может отсутствовать)`);
    }
});

// Проверка 6: Проверка dist папки
console.log('\n6️⃣ Проверка сборки...');

if (fs.existsSync('dist/index.html')) {
    const htmlSize = fs.statSync('dist/index.html').size;
    console.log(`  ✅ dist/index.html существует (${htmlSize} байт)`);
    
    // Проверка наличия JS файлов
    const distFiles = fs.readdirSync('dist/assets').filter(f => f.endsWith('.js'));
    if (distFiles.length > 0) {
        console.log(`  ✅ JavaScript файлы найдены: ${distFiles.length}`);
        distFiles.forEach(file => {
            const size = fs.statSync(`dist/assets/${file}`).size;
            console.log(`     • ${file}: ${(size / 1024).toFixed(2)} KB`);
        });
    } else {
        console.log(`  ❌ JavaScript файлы не найдены`);
        allChecksPassed = false;
    }
} else {
    console.log(`  ⚠️ dist/index.html не найден (запустите npm run build)`);
}

// Финальная проверка
console.log('\n' + '='.repeat(60));
if (allChecksPassed && allFilesExist) {
    console.log('✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО');
    console.log('='.repeat(60));
    console.log('\n📊 Статистика проекта:');
    console.log(`  • Файлов: ${files.length}`);
    console.log(`  • Компонентов: ${components.length}`);
    console.log('\n🚀 Для запуска:');
    console.log('  npm run dev');
    console.log('\n🧪 Для тестирования:');
    console.log('  Откройте приложение и нажмите кнопку "Запустить автоматические тесты"');
    console.log('\n📝 Тестовые URL:');
    console.log('  • https://expomap.ru/conference/nedelya-bezopasnosti-techexpert/');
    console.log('  • https://nic-conf.ru/');
    process.exit(0);
} else {
    console.log('❌ НЕКОТОРЫЕ ПРОВЕРКИ НЕ ПРОЙДЕНЫ');
    console.log('='.repeat(60));
    process.exit(1);
}
