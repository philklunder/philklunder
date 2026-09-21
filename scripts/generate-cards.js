// Generates the animated SVG cards for the GitHub profile README.
// Usage: node gen.js <langs.jsonl> <outDir>
const fs = require('fs');
const path = require('path');
const [, , langFile, outDir] = process.argv;
fs.mkdirSync(outDir, { recursive: true });

const C = {
  bg: '#0A0E1A', surface: '#0F1526', border: '#1E2742',
  text: '#E6EAF2', muted: '#8B95A9', dim: '#4B5570',
  violet: '#8B5CF6', cyan: '#22D3EE', pink: '#F472B6', red: '#FF3B5C', green: '#34D399',
};
const SANS = `'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'Cascadia Code', Consolas, 'Liberation Mono', monospace`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const defs = `
  <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.violet}"/><stop offset="0.5" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.pink}"/>
  </linearGradient>
  <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.violet}" stop-opacity=".7"/><stop offset=".5" stop-color="${C.border}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".7"/>
  </linearGradient>`;
const frame = (w, h) => `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18" fill="${C.bg}" stroke="url(#edge)" stroke-width="1.5"/>`;

/* ---------- 1. Header ---------- */
function header() {
  const W = 840, H = 280;
  const roles = [
    'Application Developer EFZ · apprentice',
    'Intern · shipping full-stack web apps',
    'TypeScript · Angular · Swift · C#',
  ];
  const lines = roles.map((r, i) => `<text class="role r${i}" x="56" y="196">${esc(r)}</text>`).join('');
  // tiny floating code glyphs in the background
  const glyphs = ['{ }', '</>', '=>', '::', '[]', '&&', '#', '()'];
  const floaters = glyphs.map((g, i) => {
    const x = 470 + (i % 4) * 90 + (i > 3 ? 45 : 0), y = 60 + Math.floor(i / 4) * 110;
    return `<text class="fl" style="animation-delay:-${i * 1.3}s" x="${x}" y="${y}">${esc(g)}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Philipp Klunder — Application Developer EFZ apprentice from Switzerland">
<defs>${defs}
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46"/></filter>
  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="${C.border}" stroke-width=".6"/></pattern>
  <radialGradient id="fade" cx=".75" cy=".4" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <mask id="gridMask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  <clipPath id="card"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18"/></clipPath>
  <linearGradient id="nameGrad" x1="0" y1="0" x2="1" y2="0" spreadMethod="reflect">
    <stop offset="0" stop-color="${C.text}"/><stop offset=".35" stop-color="${C.cyan}"/><stop offset=".65" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.text}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="-0.6 0; 0.6 0; -0.6 0" dur="9s" repeatCount="indefinite"/>
  </linearGradient>
</defs>
<style>
  .b{animation:drift 14s ease-in-out infinite alternate}
  .b2{animation-duration:18s;animation-delay:-6s}.b3{animation-duration:22s;animation-delay:-11s}
  @keyframes drift{0%{transform:translate(0,0)}50%{transform:translate(-60px,30px)}100%{transform:translate(40px,-20px)}}
  .hi{font:500 15px ${MONO};fill:${C.muted}}
  .name{font:800 54px ${SANS};letter-spacing:-1.5px}
  .role{font:500 20px ${SANS};fill:${C.text};opacity:0;animation:cycle 12s infinite both}
  .r1{animation-delay:4s}.r2{animation-delay:8s}
  @keyframes cycle{0%{opacity:0;transform:translateY(10px)}4%,30%{opacity:1;transform:translateY(0)}34%,100%{opacity:0;transform:translateY(-10px)}}
  .caret{fill:${C.cyan};animation:blink 1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  .fl{font:600 18px ${MONO};fill:${C.dim};opacity:.55;animation:float 7s ease-in-out infinite}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  .tag{font:600 12px ${SANS};fill:${C.text};letter-spacing:.5px}
  .in{animation:rise .9s cubic-bezier(.2,.8,.2,1) both}
  @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .ping{transform-origin:62px 237px;animation:ping 2.4s ease-out infinite}
  @keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(3);opacity:0}}
</style>
${frame(W, H)}
<g clip-path="url(#card)">
  <g filter="url(#blur)" opacity=".55">
    <circle class="b" cx="690" cy="70" r="110" fill="${C.violet}"/>
    <circle class="b b2" cx="560" cy="240" r="90" fill="${C.cyan}"/>
    <circle class="b b3" cx="800" cy="230" r="70" fill="${C.red}"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/>
  ${floaters}
</g>
<g class="in"><text class="hi" x="56" y="72">~/philklunder <tspan fill="${C.cyan}">$</tspan> hello --world</text></g>
<g class="in" style="animation-delay:.15s"><text class="name" x="52" y="140" fill="url(#nameGrad)">Philipp Klunder</text></g>
<rect x="56" y="164" width="120" height="3" rx="1.5" fill="url(#brand)" class="in" style="animation-delay:.3s"/>
${lines}
<g class="in" style="animation-delay:.5s">
  <circle class="ping" cx="62" cy="237" r="5" fill="${C.green}"/>
  <circle cx="62" cy="237" r="5" fill="${C.green}"/>
  <text class="tag" x="76" y="241">OPEN TO LEARN · ALWAYS BUILDING</text>
  <g transform="translate(330 225)">
    <rect width="24" height="24" rx="5" fill="${C.red}"/>
    <path d="M10 5h4v5h5v4h-5v5h-4v-5H5v-4h5z" fill="#fff"/>
  </g>
  <text class="tag" x="362" y="241">SWITZERLAND</text>
</g>
</svg>`;
}

/* ---------- 2. About (terminal) ---------- */
function about() {
  const W = 840, H = 330;
  const rows = [
    ['cmd', 'whoami'],
    ['out', [['k', 'name     '], ['v', 'Philipp Klunder']]],
    ['out', [['k', 'role     '], ['v', 'Intern · apprentice Application Developer EFZ']]],
    ['out', [['k', 'where    '], ['v', 'Switzerland '], ['r', '+']]],
    ['cmd', 'cat now.txt'],
    ['out', [['a', '▸ '], ['v', 'Building a full-stack assessment platform (Express · Prisma · Angular)']]],
    ['out', [['a', '▸ '], ['v', 'Side quest: '], ['c', 'cram'], ['v', ' — iOS + FastAPI + Claude flashcards']]],
    ['out', [['a', '▸ '], ['v', 'Learning: clean architecture, testing, security']]],
  ];
  let y = 92, t = 0.3, body = '';
  for (const [kind, content] of rows) {
    if (kind === 'cmd') {
      if (y > 92) y += 8;
      const w = content.length * 9.1 + 4;
      body += `<g class="line" style="animation-delay:${t}s"><text class="p" x="36" y="${y}">philipp@ch</text><text class="p2" x="130" y="${y}">~ $</text>
  <clipPath id="c${y}"><rect x="164" y="${y - 16}" height="22" width="${w}" class="type" style="animation-delay:${t}s;--w:${w}px"/></clipPath>
  <text class="cmd" x="166" y="${y}" clip-path="url(#c${y})">${esc(content)}</text></g>\n`;
      t += 0.9;
    } else {
      const spans = content.map(([c, s]) => `<tspan class="${c}">${esc(s)}</tspan>`).join('');
      body += `<text xml:space="preserve" class="line o" x="36" y="${y}" style="animation-delay:${t}s">${spans}</text>\n`;
      t += 0.22;
    }
    y += 27;
  }
  body += `<g class="line" style="animation-delay:${t}s"><text class="p" x="36" y="${y + 8}">philipp@ch</text><text class="p2" x="130" y="${y + 8}">~ $</text><rect class="caret" x="166" y="${y - 6}" width="9" height="17"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="About Philipp: intern and apprentice Application Developer EFZ in Switzerland">
<defs>${defs}</defs>
<style>
  text{font:14.5px ${MONO}}
  .p{fill:${C.green};font-weight:700}.p2{fill:${C.cyan};font-weight:700}
  .cmd{fill:${C.text}}
  .k{fill:${C.violet}}.v{fill:${C.text}}.a{fill:${C.cyan}}.c{fill:${C.pink};font-weight:700}.r{fill:${C.red};font-weight:800}
  .line{opacity:0;animation:show .01s linear forwards}
  .o{animation:showUp .35s ease-out forwards}
  @keyframes show{to{opacity:1}}
  @keyframes showUp{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
  .type{width:0;animation:type .6s steps(12) forwards}
  @keyframes type{to{width:var(--w)}}
  .caret{fill:${C.cyan};animation:blink 1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  .title{font:600 12.5px ${SANS};fill:${C.muted};letter-spacing:.4px}
</style>
${frame(W, H)}
<path d="M1 50h${W - 2}" stroke="${C.border}"/>
<circle cx="30" cy="26" r="6" fill="#FF5F57"/><circle cx="50" cy="26" r="6" fill="#FEBC2E"/><circle cx="70" cy="26" r="6" fill="#28C840"/>
<text class="title" x="${W / 2}" y="30" text-anchor="middle">philipp@ch — zsh — about-me</text>
${body}
</svg>`;
}

/* ---------- 3. Languages ---------- */
function languages() {
  const totals = {}, repoCount = {};
  const rows = fs.readFileSync(langFile, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  for (const r of rows) for (const [k, v] of Object.entries(r)) { totals[k] = (totals[k] || 0) + v; repoCount[k] = (repoCount[k] || 0) + 1; }
  // Group dialects the way people talk about them
  const group = { SCSS: 'CSS', PLpgSQL: 'SQL' };
  const g = {};
  for (const [k, v] of Object.entries(totals)) { const n = group[k] || k; g[n] = (g[n] || 0) + v; }
  const sum = Object.values(g).reduce((a, b) => a + b, 0);
  let list = Object.entries(g).sort((a, b) => b[1] - a[1]);
  const top = list.slice(0, 8), rest = list.slice(8).reduce((a, [, v]) => a + v, 0);
  if (rest) top.push(['Other', rest]);
  const palette = ['#38BDF8', '#818CF8', '#A78BFA', '#C084FC', '#F472B6', '#FB7185', '#FDBA74', '#FCD34D', '#64748B'];
  const W = 840, H = 400, cx = 170, cy = 212, R = 104, SW = 26, circ = 2 * Math.PI * R;
  let acc = 0, ring = '', bars = '';
  const maxPct = top[0][1] / sum;
  top.forEach(([name, v], i) => {
    const pct = v / sum, len = Math.max(pct * circ - 2, 0.5), col = palette[i];
    ring += `<circle class="seg" cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${col}" stroke-width="${SW}" stroke-dasharray="${len.toFixed(2)} ${circ.toFixed(2)}" stroke-dashoffset="${(-acc * circ).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})" style="animation-delay:${(0.2 + i * 0.12).toFixed(2)}s"/>`;
    acc += pct;
    const y = 88 + i * 31, bw = Math.max((pct / maxPct) * 250, 4);
    const label = pct < 0.001 ? '<0.1%' : (pct * 100).toFixed(1) + '%';
    bars += `<g class="row" style="animation-delay:${(0.3 + i * 0.1).toFixed(2)}s">
  <circle cx="370" cy="${y - 5}" r="5" fill="${col}"/><text class="ln" x="384" y="${y}">${esc(name)}</text>
  <rect x="490" y="${y - 12}" width="250" height="12" rx="6" fill="${C.surface}"/>
  <rect class="bar" x="490" y="${y - 12}" width="${bw.toFixed(1)}" height="12" rx="6" fill="${col}" style="animation-delay:${(0.4 + i * 0.1).toFixed(2)}s"/>
  <text class="pc" x="${W - 36}" y="${y}" text-anchor="end">${label}</text></g>`;
  });
  const mb = (sum / 1e6).toFixed(1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Languages by code volume: ${top.map(([n, v]) => `${n} ${((v / sum) * 100).toFixed(1)}%`).join(', ')}">
<defs>${defs}</defs>
<style>
  .h{font:700 20px ${SANS};fill:${C.text}}.sub{font:13px ${SANS};fill:${C.muted}}
  .ln{font:600 14px ${SANS};fill:${C.text}}.pc{font:600 13px ${MONO};fill:${C.muted}}
  .seg{opacity:0;animation:pop .6s cubic-bezier(.2,.8,.2,1) forwards;transform-box:view-box}
  @keyframes pop{from{opacity:0;stroke-width:4}to{opacity:1;stroke-width:${SW}}}
  .row{opacity:0;animation:fade .5s ease-out forwards}
  @keyframes fade{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}
  .bar{transform-box:fill-box;transform-origin:left;transform:scaleX(0);animation:grow 1.1s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes grow{to{transform:scaleX(1)}}
  .big{font:800 34px ${SANS};fill:${C.text}}.small{font:600 11px ${SANS};fill:${C.muted};letter-spacing:1.5px}
  .spin{transform-origin:${cx}px ${cy}px;animation:spin 24s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
${frame(W, H)}
<text class="h" x="36" y="46">What I write</text>
<text class="sub" x="36" y="68">by code volume across ${rows.length} repositories · public &amp; private</text>
<circle class="spin" cx="${cx}" cy="${cy}" r="${R + 24}" fill="none" stroke="url(#brand)" stroke-width="1.2" stroke-dasharray="2 9" opacity=".7"/>
<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.surface}" stroke-width="${SW}"/>
${ring}
<text class="big" x="${cx}" y="${cy + 6}" text-anchor="middle">${list.length}</text>
<text class="small" x="${cx}" y="${cy + 28}" text-anchor="middle">LANGUAGES</text>
${bars}
<text class="sub" x="36" y="${H - 22}">≈ ${mb} MB of source · C# shows up in ${repoCount['C#'] || 0} repos — small files, where it all started</text>
</svg>`;
}

/* ---------- 4. Journey timeline ---------- */
function journey() {
  const W = 840, H = 250;
  const steps = [
    ['2025', 'First steps', 'C# to-do app', '& calculator'],
    ['2025', 'First website', 'Recipe book in', 'HTML · CSS · JS'],
    ['Dec 25', 'Exam project', 'Secure employee', 'app in C#'],
    ['Mar 26', 'Going mobile', 'Angular + Ionic', 'GPS · QR · sensors'],
    ['Jul 26', 'cram', 'iOS · FastAPI', '+ Claude'],
    ['Now', 'Intern', 'Full-stack platform', 'in TypeScript'],
  ];
  const x0 = 80, x1 = W - 80, ly = 118, gap = (x1 - x0) / (steps.length - 1);
  const nodes = steps.map(([d, t, s, s2], i) => {
    const x = x0 + i * gap, delay = (0.3 + i * 0.35).toFixed(2), last = i === steps.length - 1;
    return `<g class="node" style="animation-delay:${delay}s">
  ${last ? `<circle class="pulse" cx="${x}" cy="${ly}" r="9" fill="${C.cyan}"/>` : ''}
  <circle cx="${x}" cy="${ly}" r="9" fill="${C.bg}" stroke="${last ? C.cyan : C.violet}" stroke-width="3"/>
  <circle cx="${x}" cy="${ly}" r="3.5" fill="${last ? C.cyan : C.text}"/>
  <text class="d" x="${x}" y="${ly - 26}" text-anchor="middle">${esc(d)}</text>
  <text class="t" x="${x}" y="${ly + 38}" text-anchor="middle">${esc(t)}</text>
  <text class="s" x="${x}" y="${ly + 58}" text-anchor="middle">${esc(s)}</text>
  <text class="s" x="${x}" y="${ly + 75}" text-anchor="middle">${esc(s2)}</text></g>`;
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Journey: from first C# apps in 2025 to intern building a full-stack platform">
<defs>${defs}</defs>
<style>
  .h{font:700 20px ${SANS};fill:${C.text}}
  .line{stroke-dasharray:${x1 - x0};stroke-dashoffset:${x1 - x0};animation:draw 2.2s .2s cubic-bezier(.4,0,.2,1) forwards}
  @keyframes draw{to{stroke-dashoffset:0}}
  .node{opacity:0;animation:in .5s cubic-bezier(.2,.8,.2,1.4) forwards}
  @keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .d{font:700 11px ${MONO};fill:${C.cyan};letter-spacing:1px}
  .t{font:700 14px ${SANS};fill:${C.text}}.s{font:12px ${SANS};fill:${C.muted}}
  .pulse{transform-box:fill-box;transform-origin:center;animation:ping 2s ease-out infinite}
  @keyframes ping{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.6);opacity:0}}
</style>
${frame(W, H)}
<text class="h" x="36" y="46">The road so far</text>
<path d="M${x0} ${ly}H${x1}" stroke="${C.border}" stroke-width="3" stroke-linecap="round"/>
<path class="line" d="M${x0} ${ly}H${x1}" stroke="url(#brand)" stroke-width="3" stroke-linecap="round"/>
${nodes}
</svg>`;
}

for (const [name, fn] of Object.entries({ header, about, languages, journey })) {
  fs.writeFileSync(path.join(outDir, `${name}.svg`), fn());
}
console.log('ok');
