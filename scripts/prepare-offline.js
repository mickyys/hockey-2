const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    console.log('🔧 Preparing offline build...');

    // Verificar que los archivos necesarios existan
    const buildDir = context.appDir;
    const indexPath = path.join(buildDir, 'index.html');
    const electronPath = path.join(buildDir, 'electron.js');

    console.log('📁 Build directory:', buildDir);
    console.log('📄 Index.html exists:', fs.existsSync(indexPath));
    console.log('⚡ Electron.js exists:', fs.existsSync(electronPath));

    // Listar contenido del directorio build
    if (fs.existsSync(buildDir)) {
        console.log('📋 Build directory contents:');
        const files = fs.readdirSync(buildDir);
        files.forEach(file => {
            console.log('  -', file);
        });
    } else {
        console.log('❌ Build directory does not exist!');
    }

    // Verificar el contenido de package.json en build si existe
    const packageJsonPath = path.join(buildDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        console.log('📦 package.json found in build directory');
    } else {
        console.log('⚠️  No package.json in build directory');
    }

    console.log('✅ Offline build preparation complete');
    return true;
};