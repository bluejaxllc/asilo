const fs = require('fs');
const path = require('path');

const COLORS = ['blue', 'emerald', 'yellow', 'amber', 'red', 'rose', 'pink', 'purple', 'teal', 'cyan', 'orange', 'green'];
const SHADES = ['200', '300', '400', '500'];

// We want to replace text-{color}-{shade} with text-{color}-600 dark:text-{color}-{shade}
// ONLY if it is NOT preceded by dark:

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const color of COLORS) {
        for (const shade of SHADES) {
            const regex = new RegExp(`(?<!dark:)text-${color}-${shade}\\b`, 'g');
            content = content.replace(regex, `text-${color}-600 dark:text-${color}-${shade}`);
        }
    }

    // Now, some places might already have "text-[color]-600 dark:text-[color]-600 dark:text-[color]-400", let's fix double darks just in case
    for (const color of COLORS) {
        const doubleDarkRegex = new RegExp(`dark:text-${color}-600 dark:text-${color}-\\d{3}`, 'g');
        content = content.replace(doubleDarkRegex, `dark:text-${color}-400`);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

processDirectory('./src');
console.log('Contrast check completed.');
