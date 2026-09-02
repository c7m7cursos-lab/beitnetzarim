# Site — Congregação Yisraelita Beit Netzarim

Site institucional de página única, em HTML/CSS/JS puro (sem build, sem dependências).
Inspirado na estrutura e na linguagem visual de beit.org.br: fundo escuro, dourado,
tipografia Playfair Display + Manrope, menu em tela cheia e revelação suave ao rolar.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Todo o conteúdo e a estrutura das seções |
| `styles.css` | Estilos e paleta (variáveis CSS no topo do arquivo) |
| `main.js` | Menu, animação de entrada, ano do rodapé e formulário |
| `logo.png` | Selo da congregação, 512px, fundo transparente (og:image e ícone de app) |
| `logo-320.png` | Versão usada como marca d'água do hero |
| `logo-96.png` | Versão usada no cabeçalho e no rodapé |
| `favicon.png` | Ícone da aba, 48px |
| `tora.html` / `tora.js` | Página Torá Online — parashá da semana e leitura livre |
| `calendario.html` / `calendario.js` | Página Calendário Judaico — horários de Shabat e agenda do mês |

## Torá Online e Calendário Judaico

Duas páginas à parte, no mesmo estilo visual, que buscam dados ao vivo em APIs públicas
(sem backend próprio — tudo roda no navegador de quem visita):

- **Hebraico** — Sefaria.org, texto *Miqra according to the Masorah* (domínio público /
  CC BY-SA), busca por `https://www.sefaria.org/api/texts/{Livro}.{capítulo}`.
- **Português** — João Ferreira de Almeida, edição de domínio público, via
  `https://bible-api.com/{livro}+{capítulo}?translation=almeida`. **Não é a mesma
  tradução do beit.org.br** — a deles é um texto próprio e autoral, que não pode ser
  reproduzido aqui.
- **Parashá, aliyot e calendário** — Hebcal.com (`hebcal.com/leyning`,
  `hebcal.com/shabbat`, `hebcal.com/hebcal`).

Pontos que exigiram tratamento especial:

- **Numeração de versículos divergente** — a tradição judaica (hebraico) e a cristã
  (a maioria das traduções em português, incluindo a Almeida) numeram os versículos de
  forma diferente em alguns capítulos, sobretudo em Deuteronômio 29 e Levítico 5–6. O
  leitor detecta automaticamente quando a contagem não bate e mostra só o hebraico
  nesses capítulos, com um aviso — para nunca parear a linha errada.
- **bible-api.com tem limite de requisições** — pedir um livro inteiro dispara dezenas
  de chamadas; elas passam por uma fila única com espera entre uma e outra, e cada
  capítulo tem nova tentativa automática e um botão "Tentar novamente" se ainda assim
  falhar.
- **Busca de cidade sem CORS** — o endpoint de autocomplete de cidades do Hebcal
  (`hebcal.com/complete`) não libera chamadas de navegador. Por isso o seletor de
  cidade em `calendario.js` é uma lista fixa de 37 capitais e cidades grandes, com o
  `geonameid` de cada uma já resolvido — para adicionar uma cidade, busque o id em
  `hebcal.com/complete?q=NomeDaCidade` (funciona por `curl`, só não pelo navegador) e
  acrescente ao array `CIDADES`.
- **Nomes de feriados em inglês** — a API do Hebcal não traduz títulos nem os textos
  explicativos (`memo`). Os títulos são traduzidos por um dicionário próprio
  (`TRADUCOES` em `calendario.js`); o `memo`, sempre em inglês, não é exibido.

## Ver localmente

Basta abrir o `index.html` no navegador. Para servir por HTTP:

```bash
npx --yes serve "site" -p 8098
```

## Seções

1. **Hero** — “Guardando a Torá, seguindo Yeshua”
2. **Quem Somos** — nossa jornada
3. **Nossos Pilares** — quatro pilares (Torá, Yeshua, Yisrael, Kehilá)
4. **Emunatênu / Nossa Fé** — declaração de fé completa, em acordeão de seis itens
5. **Encontros** — agenda semanal
6. **Moadim** — as festas do Eterno; cada uma abre uma janela com explicação completa
7. **Ensino** — beit midrash (seção clara) + grade de playlists do canal
8. **Tzedaká** — Birkat Kohanim e chamado à contribuição
9. **Contato** — dados, horários e formulário que abre o WhatsApp

### Playlists do YouTube

Canal da congregação: `https://www.youtube.com/channel/UC_2wBOGGuZ4y0qSCQz2NJFg`
(CIN - Congregação Israelita Netzarim), linkado no botão **Ver o canal** e no rodapé.

A seção Ensino tem seis cards (`<a class="pl">`), já preenchidos com playlists reais:

| Card | Playlist |
|---|---|
| Shacharit | `PLZwtx-fEFDiA` |
| Shabat Shalom | `PLAhxFaeY1Tp8` |
| Orações | `PLdvBGjWq7hrs` |
| Leitura da Bíblia em Hebraico-Português | `PLDzP4UAe86XY` |
| Bessorá de Yochanan | `PLG7YoGF0X_nk` |
| Yeshua Judeu | `PLn-RRK7mLYjsGPqWSfwJLdS8RMcQrpIRp` |

Ficaram de fora, por não serem estudo: **Yeshua Judeu (Shorts)**
(`PLn-RRK7mLYjs99fjwxR252aSU-dt9iFsC`) e **Aprenda violão**
(`PLn-RRK7mLYjui8ALIj0yxGabkAZBwknAL`).

Para acrescentar outra playlist, duplique um bloco `<a class="pl">` e troque três coisas:
o `href` (`https://www.youtube.com/playlist?list=...`), a capa
(`https://img.youtube.com/vi/ID_DO_PRIMEIRO_VIDEO/hqdefault.jpg`) e os textos
(`.pl__serie`, `.pl__titulo`, `.pl__desc`, `.pl__qtd`). Um card cujo `href` seja `"#"`
aparece automaticamente como **Em breve**, com borda tracejada e clique desativado — vale
também para o botão do canal (`[data-canal]`).

### Sobre as janelas das festas

Cada card de Moadim é um botão que abre um `<dialog>` nativo (`#moed-pessach`,
`#moed-omer`, `#moed-shavuot`, `#moed-teruah`, `#moed-kipur`, `#moed-sucot`,
`#moed-chanuca`, `#moed-purim`, `#moed-shabat`). Todos seguem a mesma estrutura de três
blocos: **O que é** (a festa e sua base nas Escrituras), **Como Israel guarda** (a prática
consagrada na tradição) e **Como vivemos em Beit Netzarim**. O texto é expositivo e não
polêmico: descreve o que é praticado em comum e o que a comunidade acrescenta em leitura,
sem contrapor uma coisa à outra. Para acrescentar uma festa, copie um `<button class="moed">`
e o `<dialog>` correspondente — o JavaScript liga os dois pelo atributo `data-moed`.

### Sobre a declaração de fé

Os seis fundamentos (`#emunatenu` no `index.html`) foram redigidos na voz da Beit Netzarim.
O conteúdo doutrinário é o mesmo da declaração de referência entregue pela congregação —
nenhum ponto foi acrescentado, suavizado ou omitido —, mas a redação é própria, e o
parágrafo de encerramento identifica a própria congregação.

## O que ainda precisa ser preenchido

Os textos são reais e prontos, mas os **dados de contato são fictícios**. Substitua:

- **Endereço** — `index.html`, aparece 2×: no menu (`.overlay__aside`) e na seção Contato
- **Telefone/WhatsApp** — `index.html`, 3× (`https://wa.me/5500000000000`) e
  `main.js` (constante `WHATSAPP`, só dígitos: código do país + DDD + número)
- **E-mail** — `index.html`, 2× (`contato@beitnetzarim.com.br`)
- **Redes sociais** — rodapé do `index.html`, os `href="#"` de Instagram, YouTube e Facebook
- **Horários** — seção Encontros, caso os dias/horas reais sejam outros
- **Link da tzedaká** — botão “Fazer uma tzedaká” hoje leva ao Contato; pode apontar
  para PIX, Kiwify ou outra plataforma
- **Logo** — feito: o selo oficial da congregação está no cabeçalho, no rodapé, na aba
  do navegador e como marca d'água do hero. Os PNGs foram gerados a partir do original
  (1024px) com o fundo preto removido; para trocar a logo, gere de novo os quatro
  tamanhos mantendo os mesmos nomes de arquivo
- **Fotos** — o site não usa fotos ainda. Fotos da congregação no hero e na seção
  “Quem Somos” dariam bastante vida; hoje esses espaços usam textura e placas em hebraico

## Publicar

Por serem arquivos estáticos, sobe em qualquer lugar:

- **Netlify / Vercel** — arraste a pasta `site` na interface, ou conecte o repositório
- **GitHub Pages** — publique a pasta em um repositório e ative o Pages
- **Hospedagem tradicional** — envie os arquivos por FTP para a pasta pública

Depois de publicar, aponte o domínio da congregação para o serviço escolhido.

## Personalizar cores e fontes

Tudo está no bloco `:root` de `styles.css`:

```css
--ink:#131210;    /* fundo escuro */
--cream:#f7f4e9;  /* fundo claro da seção de ensino */
--gold:#c7a257;   /* dourado principal */
--serif: "Playfair Display", ...   /* títulos */
--sans:  "Manrope", ...            /* textos */
```
