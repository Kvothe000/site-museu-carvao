import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dirsToConvert = [
  'img',
  'public/img/historia'
];

async function convertDir(dir) {
  const absoluteDir = path.resolve(dir);
  if (!fs.existsSync(absoluteDir)) {
    console.log(`Diretório não existe: ${absoluteDir}`);
    return;
  }

  const files = fs.readdirSync(absoluteDir);
  console.log(`Escaneando diretório: ${dir} (${files.length} arquivos encontrados)...`);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const inputPath = path.join(absoluteDir, file);
      const outputName = path.basename(file, ext) + '.webp';
      const outputPath = path.join(absoluteDir, outputName);

      try {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
        console.log(`✓ Convertido: ${file} -> ${outputName}`);
      } catch (err) {
        console.error(`... Falha ao converter ${file}:`, err.message);
      }
    }
  }
}

async function run() {
  for (const dir of dirsToConvert) {
    await convertDir(dir);
  }
  console.log('Conversão WebP concluída!');
}

run();
