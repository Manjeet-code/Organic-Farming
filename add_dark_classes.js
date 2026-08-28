const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'client', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const replacements = [
  { search: /bg-white/g, replace: 'bg-white dark:bg-slate-900' },
  { search: /text-gray-600/g, replace: 'text-gray-600 dark:text-gray-300' },
  { search: /text-gray-700/g, replace: 'text-gray-700 dark:text-gray-200' },
  { search: /border-gray-200/g, replace: 'border-gray-200 dark:border-slate-700' },
  { search: /bg-green-50/g, replace: 'bg-green-50 dark:bg-slate-800/50' },
  { search: /bg-gray-100/g, replace: 'bg-gray-100 dark:bg-slate-800' },
  { search: /bg-gray-50/g, replace: 'bg-gray-50 dark:bg-slate-800' },
  { search: /bg-green-100/g, replace: 'bg-green-100 dark:bg-green-900/40' },
  { search: /from-green-50 via-white to-green-100/g, replace: 'from-green-50 via-white to-green-100 dark:from-slate-900 dark:via-slate-900 dark:to-green-950/30' },
];

replacements.forEach(({ search, replace }) => {
  // Only replace if it doesn't already have dark: right after it
  // This is a naive replacement but works for this quick pass
  content = content.replace(search, (match) => replace);
});

// Fix potential duplicate dark: additions
content = content.replace(/bg-white dark:bg-slate-900 dark:bg-slate-900/g, 'bg-white dark:bg-slate-900');
content = content.replace(/text-gray-600 dark:text-gray-300 dark:text-gray-300/g, 'text-gray-600 dark:text-gray-300');

fs.writeFileSync(pagePath, content, 'utf8');
console.log('page.tsx updated with dark mode classes');
