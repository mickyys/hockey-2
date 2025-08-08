const fs = require('fs');
const path = require('path');

const source = path.resolve(__dirname, '../public/electron.js');
const destination = path.resolve(__dirname, '../build/electron.js');

const buildDir = path.dirname(destination);
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

try {
    fs.copyFileSync(source, destination);
    console.log('Successfully copied electron.js to build directory.');
} catch (error) {
    console.error('Error copying electron.js:', error);
    process.exit(1);
}
