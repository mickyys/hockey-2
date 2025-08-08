const fs = require('fs');
const path = require('path');

const logoDir = path.resolve(__dirname, '../public/logo');
const outputFile = path.resolve(__dirname, '../src/logo-list.json');

try {
    const files = fs.readdirSync(logoDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    const logoList = pngFiles.map(file => ({
        name: path.basename(file, '.png'),
        path: `logo/${file}`
    }));

    fs.writeFileSync(outputFile, JSON.stringify(logoList, null, 2));
    console.log('Successfully generated logo list at src/logo-list.json');
} catch (error) {
    console.error('Error generating logo list:', error);
    // Create an empty list if the directory doesn't exist or another error occurs
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
}
