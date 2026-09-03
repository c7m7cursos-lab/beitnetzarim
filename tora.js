/* Bíblia Online — Congregação Yisraelita Beit Netzarim
   Fontes:
   - Texto hebraico do Tanach: Sefaria.org (Miqra according to the Masorah, CC BY-SA)
   - Texto hebraico da Brit Chadashá: Delitzsch's Hebrew New Testament, 1877/1998, via bolls.life
   - Tradução em português (Tanach e Brit Chadashá): Almeida Revista e Corrigida, 2009, via bolls.life
   - Parashá da semana e divisão em aliyot: Hebcal.com (Leyning API)

   Numeração de versículos: a tradição judaica (hebraico) e a tradição cristã (português) divergem em
   alguns pontos do Tanach — um trecho de versículos pode ficar no fim de um capítulo numa tradição e no
   início do seguinte na outra, ou um cabeçalho de Salmo pode ou não contar como versículo 1. Em vez de
   simplesmente esconder a tradução quando as contagens não batem, o leitor tenta encontrar o deslocamento
   de versículo que melhor alinha as duas tradições (ver `melhorDeslocamento`) e só recorre a mostrar
   apenas o hebraico quando não encontra um alinhamento confiável. */
(function () {
  'use strict';

  var LIVROS = [
    { testamento: 'tanach', divisao: 'tora', en: 'Genesis', pt: 'Gênesis', he: 'בְּרֵאשִׁית', capitulos: 50, bollsId: 1 },
    { testamento: 'tanach', divisao: 'tora', en: 'Exodus', pt: 'Êxodo', he: 'שְׁמוֹת', capitulos: 40, bollsId: 2 },
    { testamento: 'tanach', divisao: 'tora', en: 'Leviticus', pt: 'Levítico', he: 'וַיִּקְרָא', capitulos: 27, bollsId: 3 },
    { testamento: 'tanach', divisao: 'tora', en: 'Numbers', pt: 'Números', he: 'בְּמִדְבַּר', capitulos: 36, bollsId: 4 },
    { testamento: 'tanach', divisao: 'tora', en: 'Deuteronomy', pt: 'Deuteronômio', he: 'דְּבָרִים', capitulos: 34, bollsId: 5 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Joshua', pt: 'Josué', he: 'יהושע', capitulos: 24, bollsId: 6 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Judges', pt: 'Juízes', he: 'שופטים', capitulos: 21, bollsId: 7 },
    { testamento: 'tanach', divisao: 'neviim', en: 'I Samuel', pt: '1 Samuel', he: 'שמואל א', capitulos: 31, bollsId: 9 },
    { testamento: 'tanach', divisao: 'neviim', en: 'II Samuel', pt: '2 Samuel', he: 'שמואל ב', capitulos: 24, bollsId: 10 },
    { testamento: 'tanach', divisao: 'neviim', en: 'I Kings', pt: '1 Reis', he: 'מלכים א', capitulos: 22, bollsId: 11 },
    { testamento: 'tanach', divisao: 'neviim', en: 'II Kings', pt: '2 Reis', he: 'מלכים ב', capitulos: 25, bollsId: 12 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Isaiah', pt: 'Isaías', he: 'ישעיהו', capitulos: 66, bollsId: 23 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Jeremiah', pt: 'Jeremias', he: 'ירמיהו', capitulos: 52, bollsId: 24 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Ezekiel', pt: 'Ezequiel', he: 'יחזקאל', capitulos: 48, bollsId: 26 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Hosea', pt: 'Oséias', he: 'הושע', capitulos: 14, bollsId: 28 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Joel', pt: 'Joel', he: 'יואל', capitulos: 4, bollsId: 29 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Amos', pt: 'Amós', he: 'עמוס', capitulos: 9, bollsId: 30 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Obadiah', pt: 'Obadias', he: 'עובדיה', capitulos: 1, bollsId: 31 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Jonah', pt: 'Jonas', he: 'יונה', capitulos: 4, bollsId: 32 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Micah', pt: 'Miquéias', he: 'מיכה', capitulos: 7, bollsId: 33 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Nahum', pt: 'Naum', he: 'נחום', capitulos: 3, bollsId: 34 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Habakkuk', pt: 'Habacuque', he: 'חבקוק', capitulos: 3, bollsId: 35 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Zephaniah', pt: 'Sofonias', he: 'צפניה', capitulos: 3, bollsId: 36 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Haggai', pt: 'Ageu', he: 'חגי', capitulos: 2, bollsId: 37 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Zechariah', pt: 'Zacarias', he: 'זכריה', capitulos: 14, bollsId: 38 },
    { testamento: 'tanach', divisao: 'neviim', en: 'Malachi', pt: 'Malaquias', he: 'מלאכי', capitulos: 3, bollsId: 39 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Psalms', pt: 'Salmos', he: 'תהילים', capitulos: 150, bollsId: 19 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Proverbs', pt: 'Provérbios', he: 'משלי', capitulos: 31, bollsId: 20 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Job', pt: 'Jó', he: 'איוב', capitulos: 42, bollsId: 18 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Song of Songs', pt: 'Cânticos', he: 'שיר השירים', capitulos: 8, bollsId: 22 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Ruth', pt: 'Rute', he: 'רות', capitulos: 4, bollsId: 8 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Lamentations', pt: 'Lamentações', he: 'איכה', capitulos: 5, bollsId: 25 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Ecclesiastes', pt: 'Eclesiastes', he: 'קהלת', capitulos: 12, bollsId: 21 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Esther', pt: 'Ester', he: 'אסתר', capitulos: 10, bollsId: 17 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Daniel', pt: 'Daniel', he: 'דניאל', capitulos: 12, bollsId: 27 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Ezra', pt: 'Esdras', he: 'עזרא', capitulos: 10, bollsId: 15 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'Nehemiah', pt: 'Neemias', he: 'נחמיה', capitulos: 13, bollsId: 16 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'I Chronicles', pt: '1 Crônicas', he: 'דברי הימים א', capitulos: 29, bollsId: 13 },
    { testamento: 'tanach', divisao: 'ketuvim', en: 'II Chronicles', pt: '2 Crônicas', he: 'דברי הימים ב', capitulos: 36, bollsId: 14 }
  ];

  var LIVROS_NT = [
    { testamento: 'nt', divisao: 'brit', en: 'nt40', pt: 'Mateus', he: 'הבשורה על-פי מתי', capitulos: 28, bollsId: 40 },
    { testamento: 'nt', divisao: 'brit', en: 'nt41', pt: 'Marcos', he: 'הבשורה על-פי מרקוס', capitulos: 16, bollsId: 41 },
    { testamento: 'nt', divisao: 'brit', en: 'nt42', pt: 'Lucas', he: 'הבשורה על-פי לוקס', capitulos: 24, bollsId: 42 },
    { testamento: 'nt', divisao: 'brit', en: 'nt43', pt: 'João', he: 'הבשורה על-פי יוחנן', capitulos: 21, bollsId: 43 },
    { testamento: 'nt', divisao: 'brit', en: 'nt44', pt: 'Atos', he: 'מעשי השליחים', capitulos: 28, bollsId: 44 },
    { testamento: 'nt', divisao: 'brit', en: 'nt45', pt: 'Romanos', he: 'אל-הרומיים', capitulos: 16, bollsId: 45 },
    { testamento: 'nt', divisao: 'brit', en: 'nt46', pt: '1 Coríntios', he: 'הראשונה אל-הקורנתיים', capitulos: 16, bollsId: 46 },
    { testamento: 'nt', divisao: 'brit', en: 'nt47', pt: '2 Coríntios', he: 'השנית אל-הקורנתיים', capitulos: 13, bollsId: 47 },
    { testamento: 'nt', divisao: 'brit', en: 'nt48', pt: 'Gálatas', he: 'אל-הגלטיים', capitulos: 6, bollsId: 48 },
    { testamento: 'nt', divisao: 'brit', en: 'nt49', pt: 'Efésios', he: 'אל-האפסיים', capitulos: 6, bollsId: 49 },
    { testamento: 'nt', divisao: 'brit', en: 'nt50', pt: 'Filipenses', he: 'אל-הפילפיים', capitulos: 4, bollsId: 50 },
    { testamento: 'nt', divisao: 'brit', en: 'nt51', pt: 'Colossenses', he: 'אל-הקולסים', capitulos: 4, bollsId: 51 },
    { testamento: 'nt', divisao: 'brit', en: 'nt52', pt: '1 Tessalonicenses', he: 'הראשונה אל-התסלוניקים', capitulos: 5, bollsId: 52 },
    { testamento: 'nt', divisao: 'brit', en: 'nt53', pt: '2 Tessalonicenses', he: 'השנית אל-התסלוניקים', capitulos: 3, bollsId: 53 },
    { testamento: 'nt', divisao: 'brit', en: 'nt54', pt: '1 Timóteo', he: 'הראשונה אל-טימותיוס', capitulos: 6, bollsId: 54 },
    { testamento: 'nt', divisao: 'brit', en: 'nt55', pt: '2 Timóteo', he: 'השנית אל-טימותיוס', capitulos: 4, bollsId: 55 },
    { testamento: 'nt', divisao: 'brit', en: 'nt56', pt: 'Tito', he: 'אל-טיטוס', capitulos: 3, bollsId: 56 },
    { testamento: 'nt', divisao: 'brit', en: 'nt57', pt: 'Filemom', he: 'אל-פילימון', capitulos: 1, bollsId: 57 },
    { testamento: 'nt', divisao: 'brit', en: 'nt58', pt: 'Hebreus', he: 'אגרת אל-העברים', capitulos: 13, bollsId: 58 },
    { testamento: 'nt', divisao: 'brit', en: 'nt59', pt: 'Tiago', he: 'אגרת יעקוב', capitulos: 5, bollsId: 59 },
    { testamento: 'nt', divisao: 'brit', en: 'nt60', pt: '1 Pedro', he: 'האגרת הראשונה לפטרוס השליח', capitulos: 5, bollsId: 60 },
    { testamento: 'nt', divisao: 'brit', en: 'nt61', pt: '2 Pedro', he: 'האגרת השנית לפטרוס השליח', capitulos: 3, bollsId: 61 },
    { testamento: 'nt', divisao: 'brit', en: 'nt62', pt: '1 João', he: 'האגרת הראשונה ליוחנן השליח', capitulos: 5, bollsId: 62 },
    { testamento: 'nt', divisao: 'brit', en: 'nt63', pt: '2 João', he: 'האגרת השנית ליוחנן השליח', capitulos: 1, bollsId: 63 },
    { testamento: 'nt', divisao: 'brit', en: 'nt64', pt: '3 João', he: 'האגרת השלישית ליוחנן השליח', capitulos: 1, bollsId: 64 },
    { testamento: 'nt', divisao: 'brit', en: 'nt65', pt: 'Judas', he: 'אגרת יהודה', capitulos: 1, bollsId: 65 },
    { testamento: 'nt', divisao: 'brit', en: 'nt66', pt: 'Apocalipse', he: 'חזון יוחנן', capitulos: 22, bollsId: 66 }
  ];

  var TODOS_LIVROS = LIVROS.concat(LIVROS_NT);

  var NOMES_DIVISAO = { tora: 'Torá', neviim: 'Neviim · Profetas', ketuvim: 'Ketuvim · Escritos', brit: 'Brit Chadashá · Novo Testamento' };

  function livroPorChave(chave) {
    for (var i = 0; i < TODOS_LIVROS.length; i++) {
      if (TODOS_LIVROS[i].en === chave) return TODOS_LIVROS[i];
    }
    return null;
  }

  /* mantido para a leitura da parashá da semana (Hebcal só devolve livros da Torá) */
  function livroPorNomeEn(nomeEn) { return livroPorChave(nomeEn); }

  /* ---------- utilidades ---------- */

  function removerTags(html) {
    var div = document.createElement('div');
    div.innerHTML = String(html || '');
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function analisarRef(ref) {
    // "29:9" -> {cap:29, ver:9}
    var partes = String(ref).split(':');
    return { cap: parseInt(partes[0], 10), ver: parseInt(partes[1], 10) };
  }

  // dispara no máximo `concorrencia` tarefas por vez — importante para não
  // sobrecarregar as APIs públicas gratuitas com uma rajada de pedidos ao
  // ler um livro inteiro, capítulo a capítulo. Uma tarefa que falha não
  // derruba as demais: seu resultado vira {erro:true}.
  function limitar(tarefas, concorrencia) {
    var i = 0;
    var resultados = new Array(tarefas.length);
    var ativos = 0;
    return new Promise(function (resolve) {
      function proxima() {
        if (i >= tarefas.length && ativos === 0) { resolve(resultados); return; }
        while (ativos < concorrencia && i < tarefas.length) {
          (function (idx) {
            ativos++;
            tarefas[idx]().then(function (r) {
              resultados[idx] = r; ativos--; proxima();
            }, function () {
              resultados[idx] = { erro: true }; ativos--; proxima();
            });
          })(i);
          i++;
        }
      }
      proxima();
    });
  }

  /* ---------- busca de texto (com cache em memória) ---------- */

  var cache = Object.create(null);

  function aguardar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // as APIs públicas usadas aqui (Sefaria e bolls.life) têm limite de requisições:
  // pedidos em rajada (como ler um livro inteiro, capítulo a capítulo) podem ser
  // recusados. Tenta de novo, com uma pequena espera, antes de desistir.
  function buscarComRetentativa(url, tentativas, esperaMs) {
    return fetch(url).then(function (r) {
      if (r.ok) return r.json();
      return Promise.reject(new Error('http ' + r.status));
    }).catch(function (erro) {
      if (tentativas <= 1) return Promise.reject(erro);
      return aguardar(esperaMs || 700).then(function () {
        return buscarComRetentativa(url, tentativas - 1, esperaMs);
      });
    });
  }

  // todas as chamadas à bolls.life (tradução em português e hebraico da Brit
  // Chadashá) passam por uma única fila, uma de cada vez, com uma pausa entre
  // elas — ao ler um livro inteiro, isso evita disparar uma rajada de pedidos
  // simultâneos contra essa API pública gratuita.
  var filaBolls = Promise.resolve();
  function buscarBollsEnfileirado(url) {
    var vez = filaBolls.then(function () { return buscarComRetentativa(url, 4, 900); });
    filaBolls = vez.then(function () { return aguardar(280); }, function () { return aguardar(280); });
    return vez;
  }

  function limparHtmlBolls(texto) {
    // <sup>...</sup> no texto da bolls.life são números de nota de rodapé/referência
    // cruzada, não parte do versículo — removidos por inteiro (tag e conteúdo).
    return String(texto || '')
      .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function urlSefaria(livroEn, capitulo) {
    return 'https://www.sefaria.org/api/texts/' + encodeURIComponent(livroEn) + '.' + capitulo + '?context=0';
  }
  function urlBolls(traducao, bollsId, capitulo) {
    return 'https://bolls.life/get-text/' + traducao + '/' + bollsId + '/' + capitulo + '/';
  }

  /* ---------- alinhamento entre hebraico e português ----------
     A numeração de versículos da tradição judaica (hebraico) diverge da
     numeração cristã (português) em alguns pontos do Tanach: um trecho de
     versículos pode ficar no fim de um capítulo numa tradição e no início do
     seguinte na outra, ou um cabeçalho de Salmo pode ou não ser contado como
     versículo. Em vez de exigir que as contagens batam exatamente, procura o
     deslocamento (positivo ou negativo) que melhor alinha as dias listas,
     comparando o tamanho de cada par de versículos — versículos que
     realmente correspondem tendem a ter tamanhos proporcionais entre si. */

  function pontuarDeslocamento(he, pt, deslocamento) {
    var pares = 0, soma = 0;
    for (var i = 0; i < he.length; i++) {
      var j = i + deslocamento;
      if (j < 0 || j >= pt.length) continue;
      var lh = he[i].length, lp = pt[j].length;
      if (lh < 2 || lp < 2) continue;
      var razao = lh > lp ? lh / lp : lp / lh;
      pares++;
      soma += Math.max(0, 1 - Math.min(razao - 1, 3) / 3);
    }
    return { pares: pares, pontuacao: pares > 0 ? soma / pares : 0 };
  }

  // devolve o deslocamento a aplicar (0 = sem deslocamento), ou null se não
  // encontrar um alinhamento confiável (nesse caso, mostra-se só o hebraico).
  function melhorDeslocamento(he, pt) {
    if (!pt || !pt.length || !he.length) return null;
    if (he.length === pt.length) return 0;

    var limite = Math.min(20, Math.max(he.length, pt.length));
    var minimoPares = he.length < 3 ? 1 : 3;
    var melhorD = null, melhorPontuacao = -1, melhorPares = 0;

    for (var d = -limite; d <= limite; d++) {
      var r = pontuarDeslocamento(he, pt, d);
      if (r.pares < minimoPares) continue;
      // pequena preferência por deslocamentos menores (mais prováveis) em caso de empate
      var pontuacaoAjustada = r.pontuacao - Math.abs(d) * 0.001;
      if (pontuacaoAjustada > melhorPontuacao) {
        melhorPontuacao = pontuacaoAjustada;
        melhorD = d;
        melhorPares = r.pares;
      }
    }

    if (melhorD === null) return null;
    if (melhorPontuacao < 0.6) return null;
    if (melhorD !== 0 && melhorPares < Math.min(3, he.length)) return null;
    return melhorD;
  }

  function montarResultado(he, pt) {
    if (pt === null) {
      var semTraducao = he.map(function (h, i) { return { numero: i + 1, he: h, pt: '' }; });
      return { versiculos: semTraducao, indisponivel: true, semAlinhamento: false };
    }

    var deslocamento = melhorDeslocamento(he, pt);
    var semAlinhamento = deslocamento === null;

    var versiculos = [];
    for (var i = 0; i < he.length; i++) {
      var j = semAlinhamento ? -1 : i + deslocamento;
      var textoPt = (!semAlinhamento && j >= 0 && j < pt.length) ? pt[j] : '';
      versiculos.push({ numero: i + 1, he: he[i], pt: textoPt });
    }
    return { versiculos: versiculos, indisponivel: false, semAlinhamento: semAlinhamento };
  }

  function buscarCapituloTanach(livro, capitulo) {
    var chave = 'tn:' + livro.en + '.' + capitulo;
    if (cache[chave]) return cache[chave];

    var pHe = buscarComRetentativa(urlSefaria(livro.en, capitulo), 2, 700)
      .then(function (j) { return (j.he || []).map(removerTags); });
    var pPt = buscarBollsEnfileirado(urlBolls('ARC09', livro.bollsId, capitulo))
      .then(function (j) { return (j || []).map(function (v) { return limparHtmlBolls(v.text); }); })
      .catch(function () { return null; });

    var promessa = Promise.all([pHe, pPt]).then(function (r) {
      return montarResultado(r[0], r[1]);
    }, function () {
      return { erro: true };
    });

    cache[chave] = promessa;
    promessa.then(function (r) { if (r.erro || r.indisponivel) delete cache[chave]; });
    return promessa;
  }

  function buscarCapituloNT(livro, capitulo) {
    var chave = 'nt:' + livro.bollsId + '.' + capitulo;
    if (cache[chave]) return cache[chave];

    var pHe = buscarBollsEnfileirado(urlBolls('DHNT', livro.bollsId, capitulo))
      .then(function (j) { return (j || []).map(function (v) { return limparHtmlBolls(v.text); }); });
    var pPt = buscarBollsEnfileirado(urlBolls('ARC09', livro.bollsId, capitulo))
      .then(function (j) { return (j || []).map(function (v) { return limparHtmlBolls(v.text); }); })
      .catch(function () { return null; });

    var promessa = Promise.all([pHe, pPt]).then(function (r) {
      return montarResultado(r[0], r[1]);
    }, function () {
      return { erro: true };
    });

    cache[chave] = promessa;
    promessa.then(function (r) { if (r.erro || r.indisponivel) delete cache[chave]; });
    return promessa;
  }

  function buscarCapitulo(livro, capitulo) {
    return livro.testamento === 'nt' ? buscarCapituloNT(livro, capitulo) : buscarCapituloTanach(livro, capitulo);
  }

  /* ---------- montagem do leitor na tela ---------- */

  function criarElemento(tag, className, texto) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (texto != null) el.textContent = texto;
    return el;
  }

  function renderizarIntervalo(container, opts) {
    // opts: {livroChave, inicioCap, inicioVer, fimCap, fimVer, marcadores, cabecalho}
    container.innerHTML = '';
    var status = criarElemento('p', 'leitor__status',
      (opts.fimCap - opts.inicioCap > 4)
        ? 'Carregando o texto… um livro inteiro pode levar alguns segundos.'
        : 'Carregando o texto…');
    container.appendChild(status);

    var livro = livroPorChave(opts.livroChave);
    var capitulos = [];
    for (var c = opts.inicioCap; c <= opts.fimCap; c++) capitulos.push(c);

    var tarefas = capitulos.map(function (c) {
      return function () { return buscarCapitulo(livro, c); };
    });

    limitar(tarefas, 3).then(function (resultadosPorCapitulo) {
      container.innerHTML = '';

      if (opts.cabecalho) container.appendChild(opts.cabecalho);

      var marcadoresPorPosicao = {}; // "cap:ver" -> rotulo
      (opts.marcadores || []).forEach(function (m) {
        marcadoresPorPosicao[m.cap + ':' + m.ver] = m.rotulo;
      });

      capitulos.forEach(function (cap, i) {
        var vIniFixo = (cap === opts.inicioCap) ? opts.inicioVer : 1;
        var vFimFixo = (cap === opts.fimCap) ? opts.fimVer : null;
        var wrapper = criarElemento('div', 'leitor__capitulo-wrap');
        wrapper.setAttribute('data-cap', cap);
        container.appendChild(wrapper);
        preencherBlocoCapitulo(wrapper, livro, cap, resultadosPorCapitulo[i], vIniFixo, vFimFixo, marcadoresPorPosicao);
      });
    }).catch(function (erro) {
      container.innerHTML = '';
      container.appendChild(criarElemento('p', 'leitor__erro',
        'Não foi possível carregar o texto agora. Verifique sua conexão e tente novamente em instantes.'));
      if (window.console) console.error(erro);
    });
  }

  // Preenche o wrapper de UM capítulo: texto normal, aviso de numeração sem
  // alinhamento confiável, ou aviso de falha com um botão para tentar de novo
  // — usado tanto na primeira renderização quanto ao clicar em "Tentar novamente".
  function preencherBlocoCapitulo(wrapper, livro, cap, resultado, vIniFixo, vFimFixo, marcadoresPorPosicao) {
    wrapper.innerHTML = '';

    if (!resultado || resultado.erro) {
      wrapper.appendChild(criarElemento('h3', 'leitor__cap-titulo', 'Capítulo ' + cap + ' · ' + livro.pt));
      wrapper.appendChild(criarElemento('p', 'leitor__aviso-divergencia',
        'Não foi possível carregar este capítulo agora.'));
      var btnRetry = criarElemento('button', 'btn', 'Tentar novamente');
      btnRetry.type = 'button';
      btnRetry.addEventListener('click', function () {
        wrapper.innerHTML = '<p class="leitor__status">Tentando de novo…</p>';
        buscarCapitulo(livro, cap).then(function (novoResultado) {
          preencherBlocoCapitulo(wrapper, livro, cap, novoResultado, vIniFixo, vFimFixo, marcadoresPorPosicao);
        });
      });
      wrapper.appendChild(btnRetry);
      return;
    }

    if (!resultado.versiculos || !resultado.versiculos.length) return;
    var versiculos = resultado.versiculos;
    var vIni = vIniFixo || 1;
    var vFim = vFimFixo || versiculos.length;

    wrapper.appendChild(criarElemento('h3', 'leitor__cap-titulo', 'Capítulo ' + cap + ' · ' + livro.pt));
    if (resultado.semAlinhamento) {
      wrapper.appendChild(criarElemento('p', 'leitor__aviso-divergencia',
        'A numeração de versículos deste capítulo diverge entre a tradição hebraica e a tradução em ' +
        'português consultada, e não foi possível alinhar as duas com segurança — por isso, aqui mostramos ' +
        'apenas o texto hebraico.'));
    } else if (resultado.indisponivel) {
      var aviso = criarElemento('p', 'leitor__aviso-divergencia',
        'A tradução em português deste capítulo não pôde ser carregada agora — aqui está o texto hebraico. ');
      var linkRetry = criarElemento('button', 'leitor__link-retry', 'Tentar carregar a tradução');
      linkRetry.type = 'button';
      linkRetry.addEventListener('click', function () {
        buscarCapitulo(livro, cap).then(function (novoResultado) {
          preencherBlocoCapitulo(wrapper, livro, cap, novoResultado, vIniFixo, vFimFixo, marcadoresPorPosicao);
        });
      });
      aviso.appendChild(linkRetry);
      wrapper.appendChild(aviso);
    }

    for (var v = vIni; v <= vFim; v++) {
      var versiculo = versiculos[v - 1];
      if (!versiculo) continue;

      var rotulo = marcadoresPorPosicao[cap + ':' + v];
      if (rotulo) wrapper.appendChild(criarElemento('p', 'leitor__aliyah-tag', rotulo));

      var linha = criarElemento('div', 'versiculo');
      linha.id = 'v-' + cap + '-' + v;
      var num = criarElemento('span', 'versiculo__num', String(v));
      var textos = criarElemento('div', 'versiculo__textos');
      var he = criarElemento('p', 'versiculo__he', versiculo.he);
      he.lang = 'he'; he.dir = 'rtl';
      textos.appendChild(he);
      if (versiculo.pt) textos.appendChild(criarElemento('p', 'versiculo__pt', versiculo.pt));
      linha.appendChild(num);
      linha.appendChild(textos);
      wrapper.appendChild(linha);
    }
  }

  /* ---------- parashá da semana ---------- */

  var parashaAtual = null; // guarda os dados da leyning já buscados

  function formatarDataCurta(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  }

  function buscarParashaDaSemana() {
    var hoje = new Date();
    var inicio = hoje.toISOString().slice(0, 10);
    var fimData = new Date(hoje.getTime() + 9 * 86400000);
    var fim = fimData.toISOString().slice(0, 10);
    var url = 'https://www.hebcal.com/leyning?cfg=json&start=' + inicio + '&end=' + fim;

    return fetch(url).then(function (r) { return r.json(); }).then(function (dados) {
      var itens = dados.items || [];
      for (var i = 0; i < itens.length; i++) {
        if (itens[i].type === 'shabbat' && itens[i].fullkriyah) return itens[i];
      }
      return null;
    });
  }

  function montarAliyotDaParasha(item) {
    var chaves = ['1', '2', '3', '4', '5', '6', '7'];
    var rotulos = ['1ª Aliyah', '2ª Aliyah', '3ª Aliyah', '4ª Aliyah', '5ª Aliyah', '6ª Aliyah', '7ª Aliyah'];
    var aliyot = [];
    chaves.forEach(function (k, i) {
      var a = item.fullkriyah[k];
      if (!a) return;
      aliyot.push({ rotulo: rotulos[i], b: analisarRef(a.b), e: analisarRef(a.e) });
    });
    return aliyot;
  }

  function renderizarCardParasha(item) {
    var card = document.getElementById('parashaCard');
    card.innerHTML = '';

    if (!item) {
      card.appendChild(criarElemento('p', 'parasha-card__status',
        'Não encontramos uma parashá de Shabat nos próximos dias. Tente novamente mais tarde.'));
      return;
    }

    var aliyot = montarAliyotDaParasha(item);

    var topo = criarElemento('div', 'parasha-card__topo');
    var titulos = criarElemento('div');
    titulos.appendChild(criarElemento('span', 'parasha-card__rotulo', 'Parashá da semana · ' + formatarDataCurta(item.date)));
    var nome = criarElemento('h3', 'parasha-card__nome', item.name.en);
    var he = criarElemento('span', 'parasha-card__he', item.name.he);
    nome.appendChild(he);
    titulos.appendChild(nome);
    titulos.appendChild(criarElemento('p', 'parasha-card__ref', item.summary));
    topo.appendChild(titulos);

    var btnLer = criarElemento('button', 'btn btn--solid', 'Ler Parashá');
    btnLer.type = 'button';
    topo.appendChild(btnLer);
    card.appendChild(topo);

    if (item.haftara) {
      card.appendChild(criarElemento('p', 'parasha-card__haftara', 'Haftará: ' + item.haftara));
    }

    var pills = criarElemento('div', 'aliyah-pills');
    pills.appendChild(criarElemento('span', 'aliyah-pills__label', 'Ir direto para'));
    var grade = criarElemento('div', 'aliyah-pills__grid');
    aliyot.forEach(function (a) {
      var pill = criarElemento('button', 'aliyah-pill');
      pill.type = 'button';
      pill.appendChild(criarElemento('span', 'aliyah-pill__nome', a.rotulo));
      pill.appendChild(criarElemento('span', 'aliyah-pill__ref', a.b.cap + ':' + a.b.ver));
      pill.addEventListener('click', function () { lerParashaEIrPara(item, aliyot, a); });
      grade.appendChild(pill);
    });
    if (item.fullkriyah.M) {
      var mB = analisarRef(item.fullkriyah.M.b);
      var pillM = criarElemento('button', 'aliyah-pill');
      pillM.type = 'button';
      pillM.appendChild(criarElemento('span', 'aliyah-pill__nome', 'Maftir'));
      pillM.appendChild(criarElemento('span', 'aliyah-pill__ref', mB.cap + ':' + mB.ver));
      pillM.addEventListener('click', function () { lerParashaEIrPara(item, aliyot, { b: mB }); });
      grade.appendChild(pillM);
    }
    pills.appendChild(grade);
    card.appendChild(pills);

    btnLer.addEventListener('click', function () { lerParashaEIrPara(item, aliyot, null); });
  }

  function lerParashaEIrPara(item, aliyot, alvo) {
    var marcadores = aliyot.map(function (a) { return { cap: a.b.cap, ver: a.b.ver, rotulo: a.rotulo }; });
    var primeiraAliyah = aliyot[0];
    var ultimaAliyah = aliyot[aliyot.length - 1];

    var cabecalho = criarElemento('div', 'leitor__titulo-bloco');
    cabecalho.appendChild(criarElemento('p', 'eyebrow', 'Parashá da semana'));
    var h2 = criarElemento('h2', null, item.name.en + ' ');
    h2.appendChild(criarElemento('span', 'he', item.name.he));
    cabecalho.appendChild(h2);
    cabecalho.appendChild(criarElemento('p', 'muted', item.summary + (item.haftara ? ' · Haftará: ' + item.haftara : '')));
    if (item.fullkriyah.M) {
      var mB2 = analisarRef(item.fullkriyah.M.b), mE2 = analisarRef(item.fullkriyah.M.e);
      cabecalho.appendChild(criarElemento('p', 'leitor__nota-maftir',
        'O Maftir repete ' + livroPorNomeEn(item.fullkriyah.M.k).pt + ' ' + mB2.cap + ':' + mB2.ver + '–' + mE2.ver + ', o final da 7ª aliyah.'));
    }

    var container = document.getElementById('leitor');
    renderizarIntervalo(container, {
      livroChave: item.fullkriyah['1'].k,
      inicioCap: primeiraAliyah.b.cap,
      inicioVer: primeiraAliyah.b.ver,
      fimCap: ultimaAliyah.e.cap,
      fimVer: ultimaAliyah.e.ver,
      marcadores: marcadores,
      cabecalho: cabecalho
    });

    document.getElementById('leitor-secao').scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (alvo) {
      var idAlvo = 'v-' + alvo.b.cap + '-' + alvo.b.ver;
      setTimeout(function () {
        var el = document.getElementById(idAlvo);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }

  /* ---------- formulário de leitura livre ---------- */

  function popularSelects() {
    var selLivro = document.getElementById('estudoLivro');
    var grupos = {};
    ['tora', 'neviim', 'ketuvim', 'brit'].forEach(function (div) {
      var optgroup = document.createElement('optgroup');
      optgroup.label = NOMES_DIVISAO[div];
      grupos[div] = optgroup;
      selLivro.appendChild(optgroup);
    });
    TODOS_LIVROS.forEach(function (l) {
      var opt = document.createElement('option');
      opt.value = l.en;
      opt.textContent = l.pt;
      grupos[l.divisao].appendChild(opt);
    });
    atualizarCapitulos();
    selLivro.addEventListener('change', atualizarCapitulos);
  }

  function atualizarCapitulos() {
    var selLivro = document.getElementById('estudoLivro');
    var selCap = document.getElementById('estudoCapitulo');
    var livro = livroPorChave(selLivro.value) || TODOS_LIVROS[0];
    selCap.innerHTML = '<option value="">Livro todo</option>';
    for (var c = 1; c <= livro.capitulos; c++) {
      var opt = document.createElement('option');
      opt.value = String(c);
      opt.textContent = 'Capítulo ' + c;
      selCap.appendChild(opt);
    }
  }

  function lerLeituraLivre(e) {
    e.preventDefault();
    var livroChave = document.getElementById('estudoLivro').value;
    var capituloStr = document.getElementById('estudoCapitulo').value;
    var livro = livroPorChave(livroChave);

    var inicioCap, fimCap, fimVer;
    if (capituloStr) {
      inicioCap = fimCap = parseInt(capituloStr, 10);
      fimVer = null;
    } else {
      inicioCap = 1;
      fimCap = livro.capitulos;
      fimVer = null;
    }

    var cabecalho = criarElemento('div', 'leitor__titulo-bloco');
    cabecalho.appendChild(criarElemento('p', 'eyebrow', livro.testamento === 'nt' ? 'Brit Chadashá · Leitura livre' : 'Leitura livre'));
    var h2 = criarElemento('h2', null, livro.pt + ' ');
    h2.appendChild(criarElemento('span', 'he', livro.he));
    cabecalho.appendChild(h2);
    cabecalho.appendChild(criarElemento('p', 'muted',
      capituloStr ? 'Capítulo ' + capituloStr : 'Livro todo · ' + livro.capitulos + ' capítulos — a leitura pode levar alguns segundos'));

    var container = document.getElementById('leitor');
    renderizarIntervalo(container, {
      livroChave: livroChave,
      inicioCap: inicioCap,
      inicioVer: 1,
      fimCap: fimCap,
      fimVer: fimVer,
      marcadores: [],
      cabecalho: cabecalho
    });

    document.getElementById('leitor-secao').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- inicialização ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    popularSelects();
    document.getElementById('estudoForm').addEventListener('submit', lerLeituraLivre);

    buscarParashaDaSemana().then(function (item) {
      parashaAtual = item;
      renderizarCardParasha(item);
    }).catch(function (erro) {
      renderizarCardParasha(null);
      if (window.console) console.error(erro);
    });
  });
})();
