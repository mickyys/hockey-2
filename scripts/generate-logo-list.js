const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '../public/logos');
const outputFile = path.join(__dirname, '../src/logoList.js');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatLogoName(filename) {
  // Remover extensión
  const nameWithoutExt = path.parse(filename).name;
  
  // Reemplazar guiones y underscores con espacios
  let formattedName = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .toLowerCase();
  
  // Capitalizar cada palabra
  formattedName = formattedName
    .split(' ')
    .map(word => capitalizeFirstLetter(word))
    .join(' ');
  
  return formattedName;
}

try {
  if (!fs.existsSync(logosDir)) {
    console.log('Logos directory not found, creating empty logo list...');
    const emptyContent = `export const logoList = [];\n`;
    fs.writeFileSync(outputFile, emptyContent);
    return;
  }

  const logoFiles = fs.readdirSync(logosDir)
    .filter(file => /\.(png|jpg|jpeg|svg)$/i.test(file))
    .map(file => ({
      filename: file,
      name: formatLogoName(file),
      path: `/logos/${file}`
    }));

  const logoListContent = `export const logoList = ${JSON.stringify(logoFiles, null, 2)};
`;

  fs.writeFileSync(outputFile, logoListContent);
  console.log(`Generated logo list with ${logoFiles.length} logos`);
  logoFiles.forEach(logo => console.log(`  - ${logo.name} (${logo.filename})`));

} catch (error) {
  console.error('Error generating logo list:', error);
  process.exit(1);
}
