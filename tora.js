/* Torá Online — Congregação Yisraelita Beit Netzarim
   Fontes:
   - Texto hebraico: Sefaria.org (Miqra according to the Masorah, CC BY-SA)
   - Tradução em português: João Ferreira de Almeida, edição de domínio
     público, servida por bible-api.com
   - Parashá da semana e divisão em aliyot: Hebcal.com (Leyning API) */
(function () {
  'use strict';

  var LIVROS = [
    { en: 'Genesis',     pt: 'Gênesis',       slug: 'genesis',     he: 'בְּרֵאשִׁית', capitulos: 50 },
    { en: 'Exodus',      pt: 'Êxodo',         slug: 'exodus',      he: 'שְׁמוֹת',      capitulos: 40 },
    { en: 'Leviticus',   pt: 'Levítico',      slug: 'leviticus',   he: 'וַיִּקְרָא',    capitulos: 27 },
    { en: 'Numbers',     pt: 'Números',       slug: 'numbers',     he: 'בְּמִדְבַּר',   capitulos: 36 },
    { en: 'Deuteronomy', pt: 'Deuteronômio',  slug: 'deuteronomy', he: 'דְּבָרִים',     capitulos: 34 }
  ];

  function livroPorNomeEn(nomeEn) {
    for (var i = 0; i < LIVROS.length; i++) {
      if (LIVROS[i].en === nomeEn) return LIVROS[i];
    }
    return null;
  }

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

  // bible-api.com é um serviço público gratuito com limite de requisições:
  // pedidos em rajada (como ler um livro inteiro, capítulo a capítulo) podem
  // ser recusados. Tenta de novo, com uma pequena espera, antes de desistir.
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

  // todas as chamadas à bible-api.com passam por uma única fila, uma de cada
  // vez, com uma pausa entre elas — ao ler um livro inteiro (dezenas de
  // capítulos), isso evita disparar uma rajada de pedidos simultâneos contra
  // essa API pública gratuita, que costuma recusar rajadas.
  var filaBibleApi = Promise.resolve();
  function buscarBibleApiEnfileirado(url) {
    var vez = filaBibleApi.then(function () { return buscarComRetentativa(url, 4, 900); });
    filaBibleApi = vez.then(function () { return aguardar(350); }, function () { return aguardar(350); });
    return vez;
  }

  function buscarCapitulo(livroEn, capitulo) {
    var chave = livroEn + '.' + capitulo;
    if (cache[chave]) return cache[chave];

    var livro = livroPorNomeEn(livroEn);
    var urlHe = 'https://www.sefaria.org/api/texts/' + encodeURIComponent(livroEn) + '.' + capitulo + '?context=0';
    var urlPt = 'https://bible-api.com/' + livro.slug + '+' + capitulo + '?translation=almeida';

    // o hebraico é essencial (é a base de toda a numeração); a falta dele
    // derruba o capítulo. A tradução em português é tratada à parte: se
    // faltar, o capítulo ainda aparece, só que sem o texto em português.
    var pHe = buscarComRetentativa(urlHe, 2, 700).then(function (j) { return (j.he || []).map(removerTags); });
    var pPt = buscarBibleApiEnfileirado(urlPt).then(function (j) {
      return (j.verses || []).map(function (v) { return (v.text || '').trim(); });
    }).catch(function () { return null; }); // null = tradução indisponível agora

    var promessa = Promise.all([pHe, pPt]).then(function (resultados) {
      var he = resultados[0];
      var pt = resultados[1];
      var indisponivel = pt === null;

      // A numeração de versículos da tradição judaica (usada pelo texto hebraico e
      // pelas aliyot) diverge da numeração cristã (usada pela tradução em português)
      // em alguns pontos do Tanach — sobretudo em Deuteronômio, onde um versículo
      // "extra" pode ficar no fim de um capítulo numa tradição e no início do
      // seguinte na outra. Quando a contagem de versículos não bate, é sinal de que
      // esse capítulo tem uma dessas divergências: em vez de arriscar parear o
      // hebraico com a linha errada do português, mostramos só o hebraico e
      // avisamos, em vez de arriscar mostrar as duas traduções desalinhadas.
      var divergente = !indisponivel && he.length !== pt.length;
      var semPt = indisponivel || divergente;

      var versiculos = [];
      for (var n = 0; n < he.length; n++) {
        versiculos.push({ numero: n + 1, he: he[n] || '', pt: semPt ? '' : (pt[n] || '') });
      }
      return { versiculos: versiculos, divergente: divergente, indisponivel: indisponivel };
    }, function () {
      return { erro: true };
    });

    cache[chave] = promessa;
    // uma falha total ou uma tradução indisponível não ficam presas em cache:
    // assim, um clique em "tentar novamente" busca de novo de verdade.
    promessa.then(function (r) { if (r.erro || r.indisponivel) delete cache[chave]; });
    return promessa;
  }

  /* ---------- montagem do leitor na tela ---------- */

  function criarElemento(tag, className, texto) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (texto != null) el.textContent = texto;
    return el;
  }

  function renderizarIntervalo(container, opts) {
    // opts: {livroEn, inicioCap, inicioVer, fimCap, fimVer, marcadores, cabecalho}
    container.innerHTML = '';
    var status = criarElemento('p', 'leitor__status',
      (opts.fimCap - opts.inicioCap > 4)
        ? 'Carregando o texto… um livro inteiro pode levar alguns segundos.'
        : 'Carregando o texto…');
    container.appendChild(status);

    var livro = livroPorNomeEn(opts.livroEn);
    var capitulos = [];
    for (var c = opts.inicioCap; c <= opts.fimCap; c++) capitulos.push(c);

    var tarefas = capitulos.map(function (c) {
      return function () { return buscarCapitulo(opts.livroEn, c); };
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

  // Preenche o wrapper de UM capítulo: texto normal, aviso de numeração
  // divergente, ou aviso de falha com um botão para tentar de novo — usado
  // tanto na primeira renderização quanto ao clicar em "Tentar novamente".
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
        buscarCapitulo(livro.en, cap).then(function (novoResultado) {
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
    if (resultado.divergente) {
      wrapper.appendChild(criarElemento('p', 'leitor__aviso-divergencia',
        'A numeração de versículos deste capítulo diverge entre a tradição hebraica e a tradução em ' +
        'português consultada — por isso, aqui mostramos apenas o texto hebraico.'));
    } else if (resultado.indisponivel) {
      var aviso = criarElemento('p', 'leitor__aviso-divergencia',
        'A tradução em português deste capítulo não pôde ser carregada agora — aqui está o texto hebraico. ');
      var linkRetry = criarElemento('button', 'leitor__link-retry', 'Tentar carregar a tradução');
      linkRetry.type = 'button';
      linkRetry.addEventListener('click', function () {
        buscarCapitulo(livro.en, cap).then(function (novoResultado) {
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
    pills.appendChild(criarElemento('span', 'aliyah-pills__label', 'Ir direto para:'));
    aliyot.forEach(function (a) {
      var pill = criarElemento('button', 'aliyah-pill', a.rotulo + ' ');
      pill.type = 'button';
      pill.appendChild(criarElemento('b', null, a.b.cap + ':' + a.b.ver));
      pill.addEventListener('click', function () { lerParashaEIrPara(item, aliyot, a); });
      pills.appendChild(pill);
    });
    if (item.fullkriyah.M) {
      var mB = analisarRef(item.fullkriyah.M.b);
      var pillM = criarElemento('button', 'aliyah-pill', 'Maftir ');
      pillM.type = 'button';
      pillM.appendChild(criarElemento('b', null, mB.cap + ':' + mB.ver));
      pillM.addEventListener('click', function () { lerParashaEIrPara(item, aliyot, { b: mB }); });
      pills.appendChild(pillM);
    }
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
      livroEn: item.fullkriyah['1'].k,
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
    LIVROS.forEach(function (l) {
      var opt = document.createElement('option');
      opt.value = l.en;
      opt.textContent = l.pt;
      selLivro.appendChild(opt);
    });
    atualizarCapitulos();
    selLivro.addEventListener('change', atualizarCapitulos);
  }

  function atualizarCapitulos() {
    var selLivro = document.getElementById('estudoLivro');
    var selCap = document.getElementById('estudoCapitulo');
    var livro = livroPorNomeEn(selLivro.value) || LIVROS[0];
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
    var livroEn = document.getElementById('estudoLivro').value;
    var capituloStr = document.getElementById('estudoCapitulo').value;
    var livro = livroPorNomeEn(livroEn);

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
    cabecalho.appendChild(criarElemento('p', 'eyebrow', 'Leitura livre'));
    var h2 = criarElemento('h2', null, livro.pt + ' ');
    h2.appendChild(criarElemento('span', 'he', livro.he));
    cabecalho.appendChild(h2);
    cabecalho.appendChild(criarElemento('p', 'muted',
      capituloStr ? 'Capítulo ' + capituloStr : 'Livro todo · ' + livro.capitulos + ' capítulos — a leitura pode levar alguns segundos'));

    var container = document.getElementById('leitor');
    renderizarIntervalo(container, {
      livroEn: livroEn,
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
