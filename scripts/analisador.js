const fs = require('fs');
const path = require('path');

const caminhoTemporada = path.join(__dirname, '../data/vikings-first-season');
const caminhoResultados = path.join(__dirname, '../data/resultados');

const criaDiretorio = (caminho) => {
  try {
    if (!fs.existsSync(caminho)) {
      fs.mkdirSync(caminho);
    }
  } catch (err) {
    console.error(`Erro ao criar diretório: ${err.message}`);
  }
};

/*const verificaPalavra = (palavra) => {
  return /^[a-zA-Z']+$/i.test(palavra);
};*/

const limpaLinha = (linha) => {
  return linha
  .replace(/<.*?>/g, '')
  .replace(/[^a-zA-Z'\s]/g, '')
  .replace(/\s+/g, ' ')
  .trim();
}

const processaEpisodio = (caminho) => {
  try {
    const conteudo = fs.readFileSync(caminho, 'utf8');
    const linhas = conteudo.split('\n');

    return linhas.reduce((palavrasEpisodio, linha) => {
      const linhaLimpa = limpaLinha(linha);
      const palavras = linhaLimpa.split(/\s+/);

      palavras.forEach((palavra) => {
        const lowercaseWord = palavra.toLowerCase();

      //  if (verificaPalavra(lowercaseWord)) {
          palavrasEpisodio[lowercaseWord] = (palavrasEpisodio[lowercaseWord] || 0) + 1;
      //  }
      });

      return palavrasEpisodio;
    }, {});
  } catch (err) {
    console.error(`Erro ao processar arquivo ${filePath}: ${err.message}`);
    return {};
  }
};

const salvarResultados = (data, filePath) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Erro ao salvar resultados em ${filePath}: ${err.message}`);
  }
};

const main = () => {
  const episodios = fs.readdirSync(caminhoTemporada).filter((file) => file.endsWith('.srt'));
  const quantPalavrasTemp = {};

criaDiretorio(caminhoResultados);

episodios.forEach((episodio) => {
  const caminhoEpisodio = path.join(caminhoTemporada, episodio);
  const palavrasEpisodio = processaEpisodio(caminhoEpisodio);

  const palavras = Object.entries(palavrasEpisodio)
    .map(([palavra, frequencia]) => ({ palavra: palavra, frequencia }))
    .sort((a, b) => b.frequencia - a.frequencia);

  const nomeEpisodio = episodio.replace('.srt', '.json');
  const resultadosEpisodio = path.join(caminhoResultados, nomeEpisodio);
  salvarResultados(palavras, resultadosEpisodio);

  Object.entries(palavrasEpisodio).forEach(([palavra, frequencia]) => {
    quantPalavrasTemp[palavra] = (quantPalavrasTemp[palavra] || 0) + frequencia;
  });
});

const palavrasTemp = Object.entries(quantPalavrasTemp)
  .map(([palavra, frequencia]) => ({ palavra: palavra, frequencia }))
  .sort((a, b) => b.frequencia - a.frequencia);

const nomeTemporada = path.basename(caminhoTemporada);
const resultadoTemporada = path.join(caminhoResultados, `${nomeTemporada}.json`);
salvarResultados(palavrasTemp, resultadoTemporada);
console.log("Contagem realizada com sucesso, você pode conferir o resultado em: "+ caminhoResultados)
}

main ();