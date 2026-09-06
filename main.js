/* Congregação Yisraelita Beit Netzarim — interações */
(function () {
  'use strict';

  var body = document.body;
  var header = document.getElementById('header');
  var menuBtn = document.getElementById('menuBtn');
  var overlay = document.getElementById('overlay');

  /* --- cabeçalho compacto ao rolar --- */
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- menu overlay --- */
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    body.classList.toggle('no-scroll', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    var label = menuBtn.querySelector('.label');
    if (label) label.textContent = open ? 'Fechar' : 'Menu';

    // entrada escalonada dos links
    overlay.querySelectorAll('nav a').forEach(function (a, i) {
      a.style.transitionDelay = open ? (0.06 * i + 0.1) + 's' : '0s';
    });
  }

  menuBtn.addEventListener('click', function () {
    setMenu(!body.classList.contains('menu-open'));
  });

  overlay.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' || e.target === overlay) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) setMenu(false);
  });

  /* --- revelar elementos ao entrar na tela ---
     A checagem por rolagem é a fonte principal (funciona em qualquer navegador
     e mesmo quando o IntersectionObserver não dispara); o observer apenas
     antecipa a revelação. */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function show(el) {
    if (el.classList.contains('in')) return;
    var siblings = el.parentElement
      ? Array.prototype.filter.call(el.parentElement.children, function (c) {
          return c.classList.contains('reveal');
        })
      : [];
    var i = Math.max(0, siblings.indexOf(el));
    el.style.transitionDelay = Math.min(i * 0.08, 0.5) + 's';
    el.classList.add('in');
  }

  var ticking = false;
  function checkReveals() {
    ticking = false;
    var limite = window.innerHeight * 0.92;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var el = reveals[i];
      // qualquer elemento que já entrou na tela (ou que ficou para trás,
      // no caso de saltos por âncora) é revelado
      var r = el.getBoundingClientRect();
      if (r.top < limite) {
        show(el);
        reveals.splice(i, 1);
      }
    }
  }
  function queueCheck() {
    if (ticking) return;
    ticking = true;
    // setTimeout em vez de rAF: continua funcionando quando a aba está em segundo plano
    window.setTimeout(checkReveals, 16);
  }

  window.addEventListener('scroll', queueCheck, { passive: true });
  window.addEventListener('resize', queueCheck);
  window.addEventListener('load', queueCheck);
  document.addEventListener('visibilitychange', queueCheck);
  checkReveals();

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        var idx = reveals.indexOf(entry.target);
        if (idx > -1) reveals.splice(idx, 1);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* --- janelas em <dialog> (festas do moadim e "Ver mais" do líder) --- */
  var modalAberto = null;

  function abrirModal(dialogo) {
    if (!dialogo) return;
    if (typeof dialogo.showModal === 'function') dialogo.showModal();
    else dialogo.setAttribute('open', ''); // navegadores sem <dialog>
    modalAberto = dialogo;
    body.classList.add('no-scroll');
    var corpo = dialogo.querySelector('.moed-modal__body');
    if (corpo) corpo.scrollTop = 0;
  }

  function fecharModal() {
    if (!modalAberto) return;
    var d = modalAberto;
    modalAberto = null;
    if (typeof d.close === 'function' && d.open) d.close();
    else d.removeAttribute('open');
    body.classList.remove('no-scroll');
  }

  document.querySelectorAll('.moed[data-moed]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      abrirModal(document.getElementById('moed-' + botao.dataset.moed));
    });
  });

  var liderBtn = document.getElementById('liderBtn');
  if (liderBtn) {
    liderBtn.addEventListener('click', function () {
      abrirModal(document.getElementById('lider-modal'));
    });
  }

  document.querySelectorAll('.moed-modal').forEach(function (dialogo) {
    dialogo.querySelectorAll('.moed-modal__close').forEach(function (x) {
      x.addEventListener('click', fecharModal);
    });
    // clique fora do conteúdo (na área do backdrop) fecha
    dialogo.addEventListener('click', function (e) {
      if (e.target !== dialogo) return;
      var r = dialogo.getBoundingClientRect();
      var fora = e.clientY < r.top || e.clientY > r.bottom ||
                 e.clientX < r.left || e.clientX > r.right;
      if (fora) fecharModal();
    });
    dialogo.addEventListener('close', function () {
      modalAberto = null;
      body.classList.remove('no-scroll');
    });
    dialogo.addEventListener('cancel', function () { // Esc
      modalAberto = null;
      body.classList.remove('no-scroll');
    });
  });

  /* --- playlists de estudo ---
     Enquanto o href de um card for "#", ele se apresenta como "Em breve" e não navega.
     Basta trocar o href pelo endereço da playlist para o card virar link ativo. */
  function ligarLinkExterno(el) {
    var href = el.getAttribute('href');
    var semLink = !href || href === '#';

    if (semLink) {
      el.classList.add('pl--vazio');
      el.setAttribute('aria-disabled', 'true');
      var acao = el.querySelector('.pl__acao');
      if (acao) acao.textContent = 'Em breve';
      el.addEventListener('click', function (e) { e.preventDefault(); });
      return;
    }

    el.target = '_blank';
    el.rel = 'noopener';
  }

  document.querySelectorAll('.pl').forEach(ligarLinkExterno);

  var linkCanal = document.querySelector('[data-canal]');
  if (linkCanal) {
    var hrefCanal = linkCanal.getAttribute('href');
    if (!hrefCanal || hrefCanal === '#') {
      linkCanal.setAttribute('aria-disabled', 'true');
      linkCanal.style.opacity = '.55';
      linkCanal.style.pointerEvents = 'none';
      linkCanal.textContent = 'Canal em breve';
    } else {
      linkCanal.target = '_blank';
      linkCanal.rel = 'noopener';
    }
  }

  /* --- ano no rodapé --- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* --- formulário de contato (abre o WhatsApp com a mensagem pronta) --- */
  var form = document.getElementById('contatoForm');
  var status = document.getElementById('formStatus');
  var WHATSAPP = '5500000000000'; // TODO: número real da congregação, só dígitos

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var dados = new FormData(form);
      var nome = (dados.get('nome') || '').toString().trim();
      var contato = (dados.get('contato') || '').toString().trim();
      var mensagem = (dados.get('mensagem') || '').toString().trim();

      if (!nome || !contato || !mensagem) {
        status.textContent = 'Por favor, preencha todos os campos.';
        return;
      }

      var texto =
        'Shalom! Sou ' + nome + '.\n' +
        'Contato: ' + contato + '\n\n' + mensagem;

      status.textContent = 'Abrindo o WhatsApp...';
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    });
  }

  /* --- faixa de membros apoiadores ---
     Lista mantida à mão: como ainda não há gateway de pagamento integrado,
     ninguém é adicionado aqui automaticamente. Sempre que alguém contribuir
     (por Pix, cartão etc.), adicione uma linha abaixo com o nome (ou "Anônimo")
     e, se quiser, o valor. Enquanto a lista estiver vazia, aparece um convite
     no lugar da faixa — nunca nomes inventados. */
  var DOADORES = [
    // { nome: 'Família Cardoso', valor: 'R$ 100/mês' },
    // { nome: 'Anônimo', valor: 'R$ 50' },
  ];

  var trilho = document.getElementById('doadoresTrilho');
  if (trilho) {
    if (!DOADORES.length) {
      var vazio = document.createElement('p');
      vazio.className = 'doadores-ticker__vazio';
      vazio.textContent = 'Seja a primeira pessoa a apoiar esta casa — seu nome pode aparecer aqui.';
      trilho.parentElement.replaceChild(vazio, trilho);
    } else {
      // a lista é duplicada uma vez, lado a lado, para a rolagem em CSS
      // (translateX de -50%) dar a volta sem deixar um "buraco" no meio
      var listaDobrada = DOADORES.concat(DOADORES);
      listaDobrada.forEach(function (d) {
        var item = document.createElement('span');
        item.className = 'doadores-item';
        var nome = document.createElement('strong');
        nome.textContent = d.nome;
        item.appendChild(nome);
        if (d.valor) item.appendChild(document.createTextNode(' — ' + d.valor));
        trilho.appendChild(item);
      });
    }
  }

  /* --- membro apoiador (Pix recorrente ou cartão): abre o WhatsApp com a
     escolha pronta, até a congregação configurar um gateway de pagamento --- */
  var painelApoiador = document.querySelector('.apoiador-painel');
  if (painelApoiador) {
    var botoesValor = Array.prototype.slice.call(painelApoiador.querySelectorAll('[data-valor]'));
    var botoesForma = Array.prototype.slice.call(painelApoiador.querySelectorAll('[data-forma]'));
    var outroWrap = document.getElementById('apoiadorOutroWrap');
    var outroInput = document.getElementById('apoiadorOutroValor');
    var aviso = document.getElementById('apoiadorAviso');
    var btnContinuar = document.getElementById('apoiadorContinuar');

    botoesValor.forEach(function (botao) {
      botao.addEventListener('click', function () {
        botoesValor.forEach(function (b) { b.classList.toggle('is-ativo', b === botao); });
        var ehOutro = botao.dataset.valor === 'outro';
        outroWrap.hidden = !ehOutro;
        if (ehOutro) outroInput.focus();
        else outroInput.value = '';
      });
    });

    botoesForma.forEach(function (botao) {
      botao.addEventListener('click', function () {
        botoesForma.forEach(function (b) { b.classList.toggle('is-ativo', b === botao); });
      });
    });

    btnContinuar.addEventListener('click', function () {
      var botaoValorAtivo = botoesValor.filter(function (b) { return b.classList.contains('is-ativo'); })[0];
      var botaoFormaAtivo = botoesForma.filter(function (b) { return b.classList.contains('is-ativo'); })[0];

      var valor = null;
      if (botaoValorAtivo) {
        if (botaoValorAtivo.dataset.valor === 'outro') {
          var digitado = parseFloat(outroInput.value);
          if (digitado > 0) valor = digitado;
        } else {
          valor = parseFloat(botaoValorAtivo.dataset.valor);
        }
      }

      aviso.classList.remove('apoiador-aviso--erro');
      if (!valor) {
        aviso.textContent = 'Escolha (ou digite) o valor da contribuição mensal.';
        aviso.classList.add('apoiador-aviso--erro');
        return;
      }
      if (!botaoFormaAtivo) {
        aviso.textContent = 'Escolha a forma de contribuição: Pix recorrente ou cartão de crédito.';
        aviso.classList.add('apoiador-aviso--erro');
        return;
      }

      var valorFormatado = valor % 1 === 0 ? valor.toFixed(0) : valor.toFixed(2).replace('.', ',');
      var texto =
        'Shalom! Quero ser um membro apoiador da Beit Netzarim, contribuindo com R$ ' + valorFormatado +
        ' por mês via ' + botaoFormaAtivo.dataset.forma + '. Podem me enviar as instruções para começar?';

      aviso.textContent = 'Abrindo o WhatsApp...';
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    });
  }
})();
