/* Calendário Judaico — Congregação Yisraelita Beit Netzarim
   Fonte de todos os dados: Hebcal.com (Shabbat Times REST API e
   Jewish Calendar REST API). */
(function () {
  'use strict';

  // Lista curada de cidades brasileiras (capitais + algumas cidades grandes),
  // com o geonameid já resolvido. O endpoint de busca de cidades do Hebcal
  // não libera CORS para chamadas do navegador, então a lista fica pronta
  // aqui — sem precisar de rede para preencher o seletor.
  var CIDADES = [
    { id: 3471872, nome: 'Aracaju', uf: 'SE' },
    { id: 3471039, nome: 'Balneário Camboriú', uf: 'SC' },
    { id: 3405870, nome: 'Belém', uf: 'PA' },
    { id: 3470127, nome: 'Belo Horizonte', uf: 'MG' },
    { id: 3664980, nome: 'Boa Vista', uf: 'RR' },
    { id: 3469058, nome: 'Brasília', uf: 'DF' },
    { id: 3467865, nome: 'Campinas', uf: 'SP' },
    { id: 3467747, nome: 'Campo Grande', uf: 'MS' },
    { id: 3465038, nome: 'Cuiabá', uf: 'MT' },
    { id: 3464975, nome: 'Curitiba', uf: 'PR' },
    { id: 3463237, nome: 'Florianópolis', uf: 'SC' },
    { id: 3399415, nome: 'Fortaleza', uf: 'CE' },
    { id: 3462377, nome: 'Goiânia', uf: 'GO' },
    { id: 3461786, nome: 'Guarulhos', uf: 'SP' },
    { id: 3397277, nome: 'João Pessoa', uf: 'PB' },
    { id: 3459712, nome: 'Joinville', uf: 'SC' },
    { id: 3458449, nome: 'Londrina', uf: 'PR' },
    { id: 3396016, nome: 'Macapá', uf: 'AP' },
    { id: 3395981, nome: 'Maceió', uf: 'AL' },
    { id: 3663517, nome: 'Manaus', uf: 'AM' },
    { id: 3394023, nome: 'Natal', uf: 'RN' },
    { id: 3456283, nome: 'Niterói', uf: 'RJ' },
    { id: 3474574, nome: 'Palmas', uf: 'TO' },
    { id: 3452925, nome: 'Porto Alegre', uf: 'RS' },
    { id: 3662762, nome: 'Porto Velho', uf: 'RO' },
    { id: 3390760, nome: 'Recife', uf: 'PE' },
    { id: 3451328, nome: 'Ribeirão Preto', uf: 'SP' },
    { id: 3662574, nome: 'Rio Branco', uf: 'AC' },
    { id: 3451190, nome: 'Rio de Janeiro', uf: 'RJ' },
    { id: 3450554, nome: 'Salvador', uf: 'BA' },
    { id: 3449433, nome: 'Santos', uf: 'SP' },
    { id: 3388368, nome: 'São Luís', uf: 'MA' },
    { id: 3448439, nome: 'São Paulo', uf: 'SP' },
    { id: 3447399, nome: 'Sorocaba', uf: 'SP' },
    { id: 3386496, nome: 'Teresina', uf: 'PI' },
    { id: 3445831, nome: 'Uberlândia', uf: 'MG' },
    { id: 3444924, nome: 'Vitória', uf: 'ES' }
  ];
  var CIDADE_PADRAO = 3448439; // São Paulo

  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
    'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  var mesAtual = new Date().getMonth();
  var anoAtual = new Date().getFullYear();

  function criarElemento(tag, className, texto) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (texto != null) el.textContent = texto;
    return el;
  }

  function geonameidSelecionado() {
    var v = parseInt(document.getElementById('localCidade').value, 10);
    return v || CIDADE_PADRAO;
  }

  function ultimoDiaDoMes(ano, mesIndice0) {
    return new Date(ano, mesIndice0 + 1, 0).getDate();
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function formatarHorario(dataIso) {
    var d = new Date(dataIso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatarDiaSemanaEData(dataStr) {
    var d = new Date(dataStr + 'T00:00:00');
    var diaSemana = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    return { diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1), dia: d.getDate() };
  }

  /* ---------- seletor de cidade ---------- */

  function popularCidades() {
    var sel = document.getElementById('localCidade');
    CIDADES.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = String(c.id);
      opt.textContent = c.nome + ', ' + c.uf;
      if (c.id === CIDADE_PADRAO) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function () {
      carregarProximoShabat();
      carregarMes();
    });
  }

  /* ---------- próximo Shabat ---------- */

  function carregarProximoShabat() {
    var card = document.getElementById('shabatCard');
    card.innerHTML = '';
    card.appendChild(criarElemento('p', 'shabat-card__status', 'Buscando horários…'));

    var url = 'https://www.hebcal.com/shabbat?cfg=json&geonameid=' + geonameidSelecionado() + '&M=on';
    fetch(url).then(function (r) { return r.json(); }).then(function (dados) {
      renderizarShabatCard(dados);
    }).catch(function (erro) {
      card.innerHTML = '';
      card.appendChild(criarElemento('p', 'shabat-card__status',
        'Não foi possível buscar os horários agora. Tente novamente em instantes.'));
      if (window.console) console.error(erro);
    });
  }

  function renderizarShabatCard(dados) {
    var card = document.getElementById('shabatCard');
    card.innerHTML = '';

    var itens = dados.items || [];
    var velas = itens.filter(function (i) { return i.category === 'candles'; })[0];
    var parashat = itens.filter(function (i) { return i.category === 'parashat'; })[0];
    var havdalah = itens.filter(function (i) { return i.category === 'havdalah'; })[0];
    var feriados = itens.filter(function (i) { return i.category === 'holiday'; });

    card.appendChild(criarElemento('p', 'shabat-card__local',
      (dados.location && dados.location.title) || ''));

    if (parashat) {
      var nome = criarElemento('h3', 'shabat-card__parasha', parashat.title.replace('Parashat ', ''));
      nome.appendChild(criarElemento('span', 'he', parashat.hebrew));
      card.appendChild(nome);
    }

    var horarios = criarElemento('div', 'shabat-card__horarios');
    if (velas) {
      var b1 = criarElemento('div', 'shabat-card__horario');
      b1.appendChild(criarElemento('span', 'shabat-card__horario-label', 'Acendimento das velas (sexta)'));
      b1.appendChild(criarElemento('strong', null, formatarHorario(velas.date)));
      horarios.appendChild(b1);
    }
    if (havdalah) {
      var b2 = criarElemento('div', 'shabat-card__horario');
      b2.appendChild(criarElemento('span', 'shabat-card__horario-label', 'Término do Shabat (sábado)'));
      b2.appendChild(criarElemento('strong', null, formatarHorario(havdalah.date)));
      horarios.appendChild(b2);
    }
    card.appendChild(horarios);

    feriados.forEach(function (f) {
      card.appendChild(criarElemento('p', 'shabat-card__feriado', traduzirTitulo(f)));
    });

    var linkTora = criarElemento('a', 'btn', 'Ler esta parashá na Torá Online');
    linkTora.href = 'tora.html';
    card.appendChild(linkTora);
  }

  /* ---------- calendário mensal ---------- */

  function carregarMes() {
    var titulo = document.getElementById('mesTitulo');
    titulo.textContent = MESES[mesAtual].charAt(0).toUpperCase() + MESES[mesAtual].slice(1) + ' de ' + anoAtual;

    var lista = document.getElementById('mesLista');
    lista.innerHTML = '';
    lista.appendChild(criarElemento('p', 'mes-lista__status', 'Carregando o calendário do mês…'));

    var inicio = anoAtual + '-' + pad2(mesAtual + 1) + '-01';
    var fim = anoAtual + '-' + pad2(mesAtual + 1) + '-' + pad2(ultimoDiaDoMes(anoAtual, mesAtual));
    var url = 'https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&c=on&M=on&s=on' +
      '&geo=geoname&geonameid=' + geonameidSelecionado() + '&start=' + inicio + '&end=' + fim;

    fetch(url).then(function (r) { return r.json(); }).then(function (dados) {
      renderizarMes(dados.items || []);
    }).catch(function (erro) {
      lista.innerHTML = '';
      lista.appendChild(criarElemento('p', 'mes-lista__status',
        'Não foi possível carregar o calendário agora. Tente novamente em instantes.'));
      if (window.console) console.error(erro);
    });
  }

  // Tradução dos títulos mais comuns que a API do Hebcal devolve em inglês.
  // A API não tem versão em português para esses nomes nem para os textos
  // explicativos (memo) — por isso os títulos abaixo são traduzidos por uma
  // lista própria, e o texto explicativo (sempre em inglês) não é exibido.
  var TRADUCOES = {
    'Rosh Hashana': 'Rosh Hashaná', 'Rosh Hashana II': 'Rosh Hashaná II',
    'Erev Rosh Hashana': 'Véspera de Rosh Hashaná',
    'Tzom Gedaliah': 'Tzom Gedalyá', 'Yom Kippur': 'Yom Kipur',
    'Erev Yom Kippur': 'Véspera de Yom Kipur', 'Shabbat Shuva': 'Shabat Shuvá',
    'Sukkot I': 'Sucot I', 'Sukkot II': 'Sucot II', 'Sukkot VII (Hoshana Raba)': 'Hoshaná Rabá',
    'Shmini Atzeret': 'Sheminí Atzeret', 'Simchat Torah': 'Simchat Torá',
    'Erev Sukkot': 'Véspera de Sucot', 'Erev Shmini Atzeret': 'Véspera de Sheminí Atzeret',
    'Chanukah: 1 Candle': 'Chanucá: 1ª vela', 'Chanukah: 2 Candles': 'Chanucá: 2ª vela',
    'Chanukah: 3 Candles': 'Chanucá: 3ª vela', 'Chanukah: 4 Candles': 'Chanucá: 4ª vela',
    'Chanukah: 5 Candles': 'Chanucá: 5ª vela', 'Chanukah: 6 Candles': 'Chanucá: 6ª vela',
    'Chanukah: 7 Candles': 'Chanucá: 7ª vela', 'Chanukah: 8 Candles': 'Chanucá: 8ª vela',
    'Chanukah: 8th Day': 'Chanucá: 8º dia', 'Chanukah Ends': 'Fim de Chanucá',
    'Asara B\'Tevet': 'Assará BeTevet', 'Tu BiShvat': 'Tu BiShvat',
    'Ta\'anit Esther': 'Taanit Ester', 'Purim': 'Purim', 'Shushan Purim': 'Shushan Purim',
    'Erev Pesach': 'Véspera de Pessach', 'Pesach I': 'Pessach I', 'Pesach II': 'Pessach II',
    'Pesach VII': 'Pessach VII', 'Pesach VIII': 'Pessach VIII', 'Pesach Ends': 'Fim de Pessach',
    'Yom HaShoah': 'Yom HaShoá', 'Yom HaZikaron': 'Yom HaZicaron', 'Yom HaAtzma\'ut': 'Yom HaAtzmaut',
    'Lag BaOmer': 'Lag BaÔmer', 'Yom Yerushalayim': 'Yom Yerushalayim',
    'Erev Shavuot': 'Véspera de Shavuot', 'Shavuot I': 'Shavuot I', 'Shavuot II': 'Shavuot II',
    'Tzom Tammuz': 'Tzom Tamuz', 'Tish\'a B\'Av': 'Tishá BeAv', 'Tu B\'Av': 'Tu BeAv',
    'Leil Selichot': 'Leil Selichot', 'Shabbat HaGadol': 'Shabat HaGadol',
    'Shabbat Chazon': 'Shabat Chazon', 'Shabbat Nachamu': 'Shabat Nachamu',
    'Sigd': 'Sigd', 'Purim Katan': 'Purim Katan', 'Shushan Purim Katan': 'Shushan Purim Katan',
    'Yom HaAliyah': 'Yom HaAliá', 'Finish eating chametz': 'Prazo para comer chametz',
    'Biur Chametz': 'Queima do Chametz', 'Fast begins': 'Início do jejum', 'Fast ends': 'Fim do jejum'
  };
  var MESES_HEBRAICOS = {
    Nisan: 'Nissan', Iyyar: 'Iyar', Sivan: 'Sivan', Tamuz: 'Tamuz', Av: 'Av', Elul: 'Elul',
    Tishrei: 'Tishrei', Cheshvan: 'Chesvan', Kislev: 'Kislev', Tevet: 'Tevet',
    Shvat: 'Shevat', Adar: 'Adar', 'Adar I': 'Adar I', 'Adar II': 'Adar II'
  };

  function traduzirTitulo(item) {
    var t = item.title;
    if (t.indexOf('Parashat ') === 0) return t.replace('Parashat ', '');
    if (t.indexOf('Rosh Chodesh ') === 0) {
      var mes = t.replace('Rosh Chodesh ', '');
      return 'Rosh Chodesh ' + (MESES_HEBRAICOS[mes] || mes);
    }
    // alguns títulos vêm com o ano hebraico no final, ex.: "Rosh Hashana 5787"
    var comAno = t.match(/^(.+?)\s(\d{4})$/);
    if (comAno && TRADUCOES[comAno[1]]) return TRADUCOES[comAno[1]] + ' ' + comAno[2];
    // dias intermediários (Chol HaMoed), ex.: "Sukkot III (CH''M)"
    var cholHamoed = t.match(/^(Sukkot|Pesach) ([IVX]+) \(CH.{0,2}M\)$/);
    if (cholHamoed) {
      return (cholHamoed[1] === 'Sukkot' ? 'Sucot' : 'Pessach') + ' ' + cholHamoed[2] + ' (Chol HaMoed)';
    }
    return TRADUCOES[t] || t;
  }

  function renderizarMes(itens) {
    var lista = document.getElementById('mesLista');
    lista.innerHTML = '';

    // agrupa por data, já que um mesmo dia pode ter vela + parashá, ou feriado + rosh chodesh
    var porData = {};
    var ordem = [];
    itens.forEach(function (item) {
      var data = item.date.slice(0, 10);
      if (!porData[data]) { porData[data] = []; ordem.push(data); }
      porData[data].push(item);
    });

    if (!ordem.length) {
      lista.appendChild(criarElemento('p', 'mes-lista__status', 'Nenhum evento encontrado neste mês.'));
      return;
    }

    ordem.sort();
    ordem.forEach(function (data) {
      var grupo = porData[data];
      var principais = grupo.filter(function (i) { return i.category !== 'candles' && i.category !== 'havdalah'; });
      var vela = grupo.filter(function (i) { return i.category === 'candles'; })[0];
      var havdalah = grupo.filter(function (i) { return i.category === 'havdalah'; })[0];
      if (!principais.length && !vela && !havdalah) return;

      var partesData = formatarDiaSemanaEData(data);
      var linha = criarElemento('div', 'mes-lista__linha');

      var diaBloco = criarElemento('div', 'mes-lista__dia');
      diaBloco.appendChild(criarElemento('span', 'mes-lista__dia-semana', partesData.diaSemana));
      diaBloco.appendChild(criarElemento('span', 'mes-lista__dia-numero', String(partesData.dia)));
      linha.appendChild(diaBloco);

      var infoBloco = criarElemento('div', 'mes-lista__info');

      if (principais.length) {
        principais.forEach(function (item) {
          var tituloLinha = criarElemento('div', 'mes-lista__titulo');
          tituloLinha.appendChild(criarElemento('span', 'mes-lista__nome', traduzirTitulo(item)));
          if (item.category === 'parashat') tituloLinha.appendChild(criarElemento('span', 'mes-lista__tag', 'Parashá'));
          if (item.category === 'holiday' && item.subcat === 'major') tituloLinha.appendChild(criarElemento('span', 'mes-lista__tag mes-lista__tag--festa', 'Festa'));
          if (item.category === 'roshchodesh') tituloLinha.appendChild(criarElemento('span', 'mes-lista__tag', 'Rosh Chodesh'));
          infoBloco.appendChild(tituloLinha);
        });
      } else if (vela) {
        var tl1 = criarElemento('div', 'mes-lista__titulo');
        tl1.appendChild(criarElemento('span', 'mes-lista__nome', 'Véspera de Shabat'));
        infoBloco.appendChild(tl1);
      } else if (havdalah) {
        var tl2 = criarElemento('div', 'mes-lista__titulo');
        tl2.appendChild(criarElemento('span', 'mes-lista__nome', 'Fim do Shabat'));
        infoBloco.appendChild(tl2);
      }
      linha.appendChild(infoBloco);

      var horariosBloco = criarElemento('div', 'mes-lista__horarios');
      if (vela) horariosBloco.appendChild(criarElemento('span', 'mes-lista__horario', '🕯 ' + formatarHorario(vela.date)));
      if (havdalah) horariosBloco.appendChild(criarElemento('span', 'mes-lista__horario', '✦ ' + formatarHorario(havdalah.date)));
      linha.appendChild(horariosBloco);

      lista.appendChild(linha);
    });
  }

  function mudarMes(delta) {
    mesAtual += delta;
    if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
    if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
    carregarMes();
  }

  /* ---------- inicialização ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    popularCidades();
    carregarProximoShabat();
    carregarMes();
    document.getElementById('mesAnterior').addEventListener('click', function () { mudarMes(-1); });
    document.getElementById('mesProximo').addEventListener('click', function () { mudarMes(1); });
  });
})();
