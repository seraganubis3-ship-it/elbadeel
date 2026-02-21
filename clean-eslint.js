const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const patternsToRemove = [
  /\/\/ eslint-disable-next-line no-console\r?\n?/g,
  /\/\* eslint-disable no-console \*\/\r?\n?/g,
  /\/\* eslint-disable @next\/next\/no-img-element \*\/\r?\n?/g
];

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    patternsToRemove.forEach(pattern => {
      newContent = newContent.replace(pattern, '');
    });
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Cleaned ${filePath}`);
    }
  }
});
