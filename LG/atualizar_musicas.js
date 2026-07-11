const fs = require('fs');
const path = require('path');

const musicFolder = path.join(__dirname, 'Músicas');
const htmlFile = path.join(__dirname, 'luis-gabriella (1).html');

if (!fs.existsSync(musicFolder)) {
  console.error('Pasta "Músicas" não encontrada!');
  process.exit(1);
}

if (!fs.existsSync(htmlFile)) {
  console.error('Arquivo HTML "luis-gabriella (1).html" não encontrado!');
  process.exit(1);
}

console.log('Lendo arquivos da pasta Músicas...');
const files = fs.readdirSync(musicFolder);

const playlist = [];

files.forEach(file => {
  // Ignorar arquivos ocultos ou de sistema
  if (file.startsWith('.')) return;
  
  // Limpar a extensão e sufixos comuns do nome
  let cleanName = file;
  
  // Remove extensões comuns e marcas de atalho/download
  cleanName = cleanName.replace(/\.lnk$/i, '');
  cleanName = cleanName.replace(/\.mp3$/i, '');
  cleanName = cleanName.replace(/\.crdownload$/i, '');
  cleanName = cleanName.replace(/\.wav$/i, '');
  cleanName = cleanName.replace(/\.m4a$/i, '');
  cleanName = cleanName.replace(/ - Atalho$/i, '');
  cleanName = cleanName.replace(/Atalho$/i, '');
  cleanName = cleanName.replace(/\(Official Video\)/gi, '');
  cleanName = cleanName.replace(/\(Official Audio\)/gi, '');
  cleanName = cleanName.replace(/\(Official Archive Video\)/gi, '');
  cleanName = cleanName.replace(/\(youtube\)/gi, '');
  cleanName = cleanName.trim();

  let artist = 'Luis & Gabriella';
  let title = cleanName;

  // Tenta quebrar por hifen para achar "Artista - Música" ou "Música - Artista"
  if (cleanName.includes(' - ')) {
    const parts = cleanName.split(' - ');
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts[1].trim();
      
      // Sanitização básica se o segundo elemento contiver coisas do youtube
      title = title.replace(/VEVO$/i, '').trim();
    }
  }

  // Define o caminho do arquivo para tocar (se for atalho .lnk, aponta para ele ou converte para a pasta original)
  const relativeSrc = 'Músicas/' + encodeURIComponent(file);

  playlist.push({
    title: title,
    artist: artist,
    src: relativeSrc
  });
});

if (playlist.length === 0) {
  // Se estiver vazia, deixa pelo menos Lisboa
  playlist.push({ title: 'Lisboa', artist: 'Lenine', src: 'lisboa.mp3' });
}

console.log('Músicas encontradas:', playlist);

// Ler o HTML e atualizar o array 'playlist'
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

// Regex para capturar e substituir a declaração da playlist
const startMark = '// ══ MUSIC PLAYLIST ══';
const endMark = 'let currentTrack = 0;';

const startIndex = htmlContent.indexOf(startMark);
const endIndex = htmlContent.indexOf(endMark);

if (startIndex === -1 || endIndex === -1) {
  console.error('Não foi possível localizar os marcadores da playlist no HTML!');
  process.exit(1);
}

const playlistString = `const playlist = ${JSON.stringify(playlist, null, 2)};\n\n`;
const before = htmlContent.substring(0, startIndex + startMark.length + 1);
const after = htmlContent.substring(endIndex);

const updatedHtml = before + playlistString + after;

fs.writeFileSync(htmlFile, updatedHtml, 'utf8');
console.log('Playlist atualizada com sucesso no arquivo HTML!');
