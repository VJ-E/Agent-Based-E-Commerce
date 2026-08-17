const fs = require('fs');
const path = require('path');

function fixEncoding(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixEncoding(fullPath);
    } else if (fullPath.endsWith('.js')) {
      const buffer = fs.readFileSync(fullPath);
      let content;
      // Check for UTF-16 LE BOM
      if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
        content = buffer.toString('utf16le');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed UTF-16 BOM in', fullPath);
      } else if (buffer.includes(0x00)) {
        // Contains null bytes without BOM
        content = buffer.toString('utf16le');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed null bytes in', fullPath);
      } else {
        // Normal
        content = fs.readFileSync(fullPath, 'utf8');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

fixEncoding('./app');
fixEncoding('./components');
console.log('Encoding fix complete.');
