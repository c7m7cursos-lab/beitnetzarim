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
})();
