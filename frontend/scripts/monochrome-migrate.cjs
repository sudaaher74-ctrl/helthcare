const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, '../src/pages'),
  path.join(__dirname, '../src/pages/auth'),
  path.join(__dirname, '../src/components')
];

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
      
      const original = content;

      // Replace text colors
      content = content.replace(/\btext-(violet|emerald|amber|rose|cyan|orange|blue|indigo|fuchsia|pink)-(100|200|300|400|500|600|700|800|900)\b/g, (match, color, weight) => {
        return parseInt(weight) < 500 ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-base)]';
      });

      // Replace backgrounds
      content = content.replace(/\bbg-(violet|emerald|amber|rose|cyan|orange|blue|indigo|fuchsia|pink)-(100|200|300|400|500|600|700|800|900)(\/[0-9]+)?\b/g, (match, color, weight, opacity) => {
        if (!opacity && parseInt(weight) >= 500) {
           return 'bg-[var(--color-text-base)] text-[var(--color-bg-primary)]'; // Solid buttons
        }
        return 'bg-[var(--color-surface)]'; // Transparent badges
      });

      // Replace borders
      content = content.replace(/\bborder-(violet|emerald|amber|rose|cyan|orange|blue|indigo|fuchsia|pink)-(100|200|300|400|500|600|700|800|900)(\/[0-9]+)?\b/g, 'border-[var(--color-border-subtle)]');

      // Replace gradient stops
      content = content.replace(/\bfrom-(violet|emerald|amber|rose|cyan|orange|blue|indigo|fuchsia|pink)-(100|200|300|400|500|600|700|800|900)\b/g, 'from-[var(--color-text-base)]');
      content = content.replace(/\bto-(violet|emerald|amber|rose|cyan|orange|blue|indigo|fuchsia|pink)-(100|200|300|400|500|600|700|800|900)\b/g, 'to-[var(--color-text-muted)]');
      content = content.replace(/\bvia-(violet|emerald|amber|rose|cyan|orange|blue|indigo|fuchsia|pink)-(100|200|300|400|500|600|700|800|900)\b/g, 'via-[var(--color-text-muted)]');

      // Replace shadows
      content = content.replace(/\bshadow-(violet|emerald|amber|rose|cyan|orange|blue|indigo|fuchsia|pink)-(100|200|300|400|500|600|700|800|900)(\/[0-9]+)?\b/g, 'shadow-md');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Made monochrome: ${fullPath}`);
      }
    }
  }
}

DIRECTORIES.forEach(processDirectory);
console.log('Monochrome migration complete!');
