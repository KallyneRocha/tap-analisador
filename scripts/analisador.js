const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../data/vikings-first-season');
const resultsPath = path.join(__dirname, '../data/resultados');

const ensureDirectoryExists = (directoryPath) => {
  try {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }
  } catch (err) {
    console.error(`Erro ao criar diretório: ${err.message}`);
  }
};

const isWord = (word) => {
  return /^[a-zA-Z']+$/i.test(word);
};

const processFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const linhas = content.split('\n');

    return linhas.reduce((episodeWordCount, linha) => {
      const linhaLimpa = linha
        .replace(/<.*?>/g, '')
        .replace(/<\s*\/?\s*i\s*>/g, '')
        .replace(/[^a-zA-Z'\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const palavras = linhaLimpa.split(/\s+/);

      palavras.forEach((word) => {
        const lowercaseWord = word.toLowerCase();

        if (isWord(lowercaseWord)) {
          episodeWordCount[lowercaseWord] = (episodeWordCount[lowercaseWord] || 0) + 1;
        }
      });

      return episodeWordCount;
    }, {});
  } catch (err) {
    console.error(`Erro ao processar arquivo ${filePath}: ${err.message}`);
    return {};
  }
};

const saveResults = (data, filePath) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Erro ao salvar resultados em ${filePath}: ${err.message}`);
  }
};

const episodes = fs.readdirSync(directoryPath).filter((file) => file.endsWith('.srt'));
const seasonWordCount = {};

ensureDirectoryExists(resultsPath);

episodes.forEach((episode) => {
  const episodePath = path.join(directoryPath, episode);
  const episodeWordCount = processFile(episodePath);

  const sortedWords = Object.entries(episodeWordCount)
    .map(([word, frequencia]) => ({ palavra: word, frequencia }))
    .sort((a, b) => b.frequencia - a.frequencia);

  const episodeName = episode.replace('.srt', '');
  const episodeResultPath = path.join(resultsPath, `episodio-${episodeName}.json`);
  saveResults(sortedWords, episodeResultPath);

  Object.entries(episodeWordCount).forEach(([word, frequencia]) => {
    seasonWordCount[word] = (seasonWordCount[word] || 0) + frequencia;
  });
});

const sortedSeasonWords = Object.entries(seasonWordCount)
  .map(([word, frequencia]) => ({ palavra: word, frequencia }))
  .sort((a, b) => b.frequencia - a.frequencia);

const seasonName = path.basename(directoryPath);
const seasonResultPath = path.join(resultsPath, `temporada-${seasonName}.json`);
saveResults(sortedSeasonWords, seasonResultPath);
console.log("Contagem realizada com sucesso, você pode conferir o resultado em: "+ resultsPath)