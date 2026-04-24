const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { from: /bg-slate-950/g, to: 'bg-slate-50' },
  { from: /bg-slate-900/g, to: 'bg-white' },
  { from: /bg-slate-800/g, to: 'bg-slate-100' },
  { from: /bg-slate-700/g, to: 'bg-slate-200' },
  { from: /border-slate-800/g, to: 'border-slate-200' },
  { from: /border-slate-700/g, to: 'border-slate-300' },
  
  { from: /text-white/g, to: '__TMP_TEXT_SLATE_900__' },
  { from: /text-slate-400/g, to: '__TMP_TEXT_SLATE_500__' },
  { from: /text-slate-300/g, to: '__TMP_TEXT_SLATE_600__' },
  { from: /text-slate-500/g, to: '__TMP_TEXT_SLATE_400__' }, // Sometimes used for muting text
  
  { from: /__TMP_TEXT_SLATE_900__/g, to: 'text-slate-900' },
  { from: /__TMP_TEXT_SLATE_500__/g, to: 'text-slate-500' },
  { from: /__TMP_TEXT_SLATE_600__/g, to: 'text-slate-600' },
  { from: /__TMP_TEXT_SLATE_400__/g, to: 'text-slate-400' }
];

function processDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      replacements.forEach(({from, to}) => {
        content = content.replace(from, to);
      });
      if (originalContent !== content) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log("Refactoring complete.");
