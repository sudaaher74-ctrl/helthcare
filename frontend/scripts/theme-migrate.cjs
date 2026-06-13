const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, '../src/pages'),
  path.join(__dirname, '../src/pages/auth'),
  path.join(__dirname, '../src/components')
];

const REPLACEMENTS = {
  'text-white': 'text-[var(--color-text-base)]',
  'bg-white/5': 'bg-[var(--color-surface)]',
  'bg-white/10': 'bg-[var(--color-surface-hover)]',
  'border-white/5': 'border-[var(--color-border-subtle)]',
  'border-white/10': 'border-[var(--color-border-subtle)]',
  'border-white/20': 'border-[var(--color-border-subtle)]',
  'text-slate-400': 'text-[var(--color-text-muted)]',
  'text-slate-500': 'text-[var(--color-text-muted)]',
  'bg-black': 'bg-[var(--color-bg-primary)]',
};

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const [search, replace] of Object.entries(REPLACEMENTS)) {
        // Use regex with word boundaries to ensure we match whole tailwind classes
        const regex = new RegExp(`\\b${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

DIRECTORIES.forEach(processDirectory);
console.log('Migration complete!');
