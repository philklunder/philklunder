// Generates the animated SVG cards for the GitHub profile README.
//
//   GITHUB_TOKEN=... node scripts/generate-cards.js
//
// Contributions and the avatar are fetched live (the workflow runs this daily).
// Language totals come from data/languages.json, because the workflow token
// cannot read private repositories — refresh that file by hand now and then.
const fs = require('fs');
const path = require('path');

const LOGIN = 'philklunder';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets');
const APPRENTICESHIP = { start: new Date('2023-08-01'), end: new Date('2027-07-31'), years: 4 };

const C = {
  bg: '#130C11', surface: '#1E1319', border: '#3A1E2A',
  text: '#F5E9EE', muted: '#B39BA6', dim: '#6B4A58',
  wine: '#881337', crimson: '#BE123C', rose: '#F43F5E', blush: '#FDA4AF', gold: '#F6C177',
};
const HEAT = { NONE: '#241820', FIRST_QUARTILE: '#5B1A2E', SECOND_QUARTILE: '#9F1239', THIRD_QUARTILE: '#E11D48', FOURTH_QUARTILE: '#FDA4AF' };
const SANS = `'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'Cascadia Code', Consolas, 'Liberation Mono', monospace`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const defs = `
  <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.crimson}"/><stop offset=".55" stop-color="${C.rose}"/><stop offset="1" stop-color="${C.blush}"/>
  </linearGradient>
  <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.rose}" stop-opacity=".75"/><stop offset=".5" stop-color="${C.border}"/><stop offset="1" stop-color="${C.blush}" stop-opacity=".55"/>
  </linearGradient>`;
const frame = (w, h) => `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18" fill="${C.bg}" stroke="url(#edge)" stroke-width="1.5"/>`;
const svg = (w, h, label, style, body, extraDefs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<defs>${defs}${extraDefs}</defs>
<style>${style}</style>
${frame(w, h)}
${body}
</svg>`;

/* ---------- data ---------- */
async function gql(query) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': LOGIN },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function contributions() {
  const base = await gql(`{ user(login: "${LOGIN}") { contributionsCollection {
    contributionYears
    contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`);
  const cc = base.user.contributionsCollection;
  const aliases = cc.contributionYears.map((y) =>
    `y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") { contributionCalendar { totalContributions } }`).join('\n');
  const yearly = await gql(`{ user(login: "${LOGIN}") { ${aliases} } }`);
  const years = cc.contributionYears.sort().map((y) => [y, yearly.user[`y${y}`].contributionCalendar.totalContributions]);
  return { total: cc.contributionCalendar.totalContributions, weeks: cc.contributionCalendar.weeks, years };
}

async function avatarDataUri() {
  const res = await fetch(`https://avatars.githubusercontent.com/${LOGIN}?s=160`);
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${res.headers.get('content-type') || 'image/png'};base64,${buf.toString('base64')}`;
}

/* ---------- 1. Header ---------- */
function header(avatar) {
  const W = 840, H = 280, ax = 700, ay = 140;
  const roles = ['Application Developer EFZ · final year', 'Intern · shipping full-stack web apps', 'TypeScript · Angular · Swift · C#'];
  const lines = roles.map((r, i) => `<text class="role r${i}" x="56" y="196">${esc(r)}</text>`).join('');
  // rose petals drifting down behind the portrait
  const petals = Array.from({ length: 9 }, (_, i) => {
    const x = 450 + ((i * 53) % 370), s = 0.6 + ((i * 7) % 5) / 6, dur = 9 + (i % 4) * 2.5;
    return `<g transform="translate(${x} -30)"><path class="petal" style="animation-duration:${dur}s;animation-delay:-${(i * 2.1).toFixed(1)}s" d="M0 0C${9 * s} ${-11 * s} ${22 * s} ${-6 * s} ${20 * s} ${7 * s}C${16 * s} ${18 * s} ${3 * s} ${14 * s} 0 0Z" fill="${i % 3 ? C.rose : C.crimson}"/></g>`;
  }).join('');
  return svg(W, H, 'Philipp Klunder — Application Developer EFZ apprentice from Switzerland', `
  .b{animation:drift 14s ease-in-out infinite alternate}
  .b2{animation-duration:18s;animation-delay:-6s}.b3{animation-duration:22s;animation-delay:-11s}
  @keyframes drift{0%{transform:translate(0,0)}50%{transform:translate(-50px,25px)}100%{transform:translate(35px,-20px)}}
  .petal{opacity:0;animation:fall 11s linear infinite}
  @keyframes fall{0%{opacity:0;transform:translate(0,0) rotate(0)}10%{opacity:.55}85%{opacity:.4}100%{opacity:0;transform:translate(-70px,340px) rotate(300deg)}}
  .hi{font:500 15px ${MONO};fill:${C.muted}}
  .name{font:800 54px ${SANS};letter-spacing:-1.5px}
  .role{font:500 20px ${SANS};fill:${C.text};opacity:0;animation:cycle 12s infinite both}
  .r1{animation-delay:4s}.r2{animation-delay:8s}
  @keyframes cycle{0%{opacity:0;transform:translateY(10px)}4%,30%{opacity:1;transform:translateY(0)}34%,100%{opacity:0;transform:translateY(-10px)}}
  .tag{font:600 12px ${SANS};fill:${C.text};letter-spacing:.5px}
  .in{animation:rise .9s cubic-bezier(.2,.8,.2,1) both}
  @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .ping{transform-origin:62px 237px;animation:ping 2.4s ease-out infinite}
  @keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(3);opacity:0}}
  .ring{transform-origin:${ax}px ${ay}px;animation:spin 18s linear infinite}
  .ring2{animation-duration:30s;animation-direction:reverse}
  @keyframes spin{to{transform:rotate(360deg)}}
  .glow{transform-origin:${ax}px ${ay}px;animation:breathe 5s ease-in-out infinite}
  @keyframes breathe{0%,100%{opacity:.45;transform:scale(.95)}50%{opacity:.8;transform:scale(1.05)}}`, `
<g clip-path="url(#card)">
  <g filter="url(#blur)" opacity=".6">
    <circle class="b" cx="720" cy="60" r="110" fill="${C.wine}"/>
    <circle class="b b2" cx="540" cy="250" r="90" fill="${C.crimson}"/>
    <circle class="b b3" cx="820" cy="250" r="80" fill="${C.rose}" opacity=".6"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/>
  ${petals}
</g>
<circle class="glow" cx="${ax}" cy="${ay}" r="84" fill="${C.rose}" filter="url(#soft)"/>
<circle class="ring" cx="${ax}" cy="${ay}" r="80" fill="none" stroke="url(#brand)" stroke-width="2.5" stroke-dasharray="60 14 6 14" stroke-linecap="round"/>
<circle class="ring ring2" cx="${ax}" cy="${ay}" r="90" fill="none" stroke="${C.blush}" stroke-opacity=".5" stroke-width="1" stroke-dasharray="2 8"/>
<image href="${avatar}" x="${ax - 70}" y="${ay - 70}" width="140" height="140" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
<circle cx="${ax}" cy="${ay}" r="70" fill="none" stroke="${C.bg}" stroke-width="3"/>
<g class="in"><text class="hi" x="56" y="72">~/philklunder <tspan fill="${C.rose}">$</tspan> hello --world</text></g>
<g class="in" style="animation-delay:.15s"><text class="name" x="52" y="140" fill="url(#nameGrad)">Philipp Klunder</text></g>
<rect x="56" y="164" width="120" height="3" rx="1.5" fill="url(#brand)" class="in" style="animation-delay:.3s"/>
${lines}
<g class="in" style="animation-delay:.5s">
  <circle class="ping" cx="62" cy="237" r="5" fill="${C.gold}"/>
  <circle cx="62" cy="237" r="5" fill="${C.gold}"/>
  <text class="tag" x="76" y="241">OPEN TO LEARN · ALWAYS BUILDING</text>
  <g transform="translate(330 225)">
    <rect width="24" height="24" rx="5" fill="${C.rose}"/>
    <path d="M10 5h4v5h5v4h-5v5h-4v-5H5v-4h5z" fill="#fff"/>
  </g>
  <text class="tag" x="362" y="241">SWITZERLAND</text>
</g>`, `
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46"/></filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="${C.border}" stroke-width=".6"/></pattern>
  <radialGradient id="fade" cx=".75" cy=".4" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <mask id="gridMask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  <clipPath id="card"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18"/></clipPath>
  <clipPath id="avatarClip"><circle cx="${ax}" cy="${ay}" r="70"/></clipPath>
  <linearGradient id="nameGrad" x1="0" y1="0" x2="1" y2="0" spreadMethod="reflect">
    <stop offset="0" stop-color="${C.text}"/><stop offset=".35" stop-color="${C.blush}"/><stop offset=".65" stop-color="${C.rose}"/><stop offset="1" stop-color="${C.text}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="-0.6 0; 0.6 0; -0.6 0" dur="9s" repeatCount="indefinite"/>
  </linearGradient>`);
}

/* ---------- 2. About (terminal) ---------- */
function about(progress) {
  const W = 840, H = 358;
  const rows = [
    ['cmd', 'whoami'],
    ['out', [['k', 'name     '], ['v', 'Philipp Klunder']]],
    ['out', [['k', 'role     '], ['v', 'Intern · apprentice Application Developer EFZ']]],
    ['out', [['k', 'since    '], ['v', 'August 2023 · '], ['c', `year ${progress.year} of ${APPRENTICESHIP.years}`], ['v', progress.year === APPRENTICESHIP.years ? ' — final year' : '']]],
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
  return svg(W, H, 'About Philipp: intern and apprentice Application Developer EFZ in Switzerland, final year', `
  text{font:14.5px ${MONO}}
  .p{fill:${C.rose};font-weight:700}.p2{fill:${C.blush};font-weight:700}
  .cmd{fill:${C.text}}
  .k{fill:${C.muted}}.v{fill:${C.text}}.a{fill:${C.rose}}.c{fill:${C.gold};font-weight:700}.r{fill:${C.rose};font-weight:800}
  .line{opacity:0;animation:show .01s linear forwards}
  .o{animation:showUp .35s ease-out forwards}
  @keyframes show{to{opacity:1}}
  @keyframes showUp{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
  .type{width:0;animation:type .6s steps(12) forwards}
  @keyframes type{to{width:var(--w)}}
  .caret{fill:${C.rose};animation:blink 1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  .title{font:600 12.5px ${SANS};fill:${C.muted};letter-spacing:.4px}`, `
<path d="M1 50h${W - 2}" stroke="${C.border}"/>
<circle cx="30" cy="26" r="6" fill="#FF5F57"/><circle cx="50" cy="26" r="6" fill="#FEBC2E"/><circle cx="70" cy="26" r="6" fill="#28C840"/>
<text class="title" x="${W / 2}" y="30" text-anchor="middle">philipp@ch — zsh — about-me</text>
${body}`);
}

/* ---------- 3. Languages ---------- */
function languages(data) {
  const group = { SCSS: 'CSS', PLpgSQL: 'SQL' };
  const g = {};
  for (const [k, v] of Object.entries(data.bytes)) { const n = group[k] || k; g[n] = (g[n] || 0) + v; }
  const sum = Object.values(g).reduce((a, b) => a + b, 0);
  const list = Object.entries(g).sort((a, b) => b[1] - a[1]);
  const top = list.slice(0, 5), rest = list.slice(5).reduce((a, [, v]) => a + v, 0);
  if (rest) top.push(['Other', rest]);
  const palette = ['#F43F5E', '#FDA4AF', '#F6C177', '#C084FC', '#FB923C', '#6B4A58'];
  const W = 840, H = 214, bx = 36, bw = W - 72, by = 92;
  let acc = 0, segs = '', legend = '';
  top.forEach(([name, v], i) => {
    const pct = v / sum, x = bx + acc * bw, w = pct * bw;
    segs += `<rect class="seg" x="${x.toFixed(1)}" y="${by}" width="${Math.max(w - 2, 2).toFixed(1)}" height="16" fill="${palette[i]}" style="animation-delay:${(0.2 + acc * 1.2).toFixed(2)}s"/>`;
    acc += pct;
    const col = i % 3, row = Math.floor(i / 3), lx = bx + col * (bw / 3), ly = 146 + row * 30;
    legend += `<g class="lg" style="animation-delay:${(0.6 + i * 0.1).toFixed(2)}s"><circle cx="${lx + 5}" cy="${ly - 4}" r="5" fill="${palette[i]}"/>
  <text class="ln" x="${lx + 18}" y="${ly}">${esc(name)}</text><text class="pc" x="${lx + 118}" y="${ly}">${(pct * 100).toFixed(1)}%</text></g>`;
  });
  return svg(W, H, `Languages by code volume: ${top.map(([n, v]) => `${n} ${((v / sum) * 100).toFixed(1)}%`).join(', ')}`, `
  .h{font:700 20px ${SANS};fill:${C.text}}.sub{font:13px ${SANS};fill:${C.muted}}
  .ln{font:600 14px ${SANS};fill:${C.text}}.pc{font:600 13px ${MONO};fill:${C.muted}}
  .seg{transform-box:fill-box;transform-origin:left;transform:scaleX(0);animation:grow .7s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes grow{to{transform:scaleX(1)}}
  .lg{opacity:0;animation:fade .5s ease-out forwards}
  @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .shine{animation:shine 4s 2s ease-in-out infinite}
  @keyframes shine{0%{transform:translateX(-120px)}60%,100%{transform:translateX(${W}px)}}`, `
<text class="h" x="36" y="46">What I write</text>
<text class="sub" x="36" y="68">by code volume across ${data.repositories} repositories · public &amp; private</text>
<g clip-path="url(#barClip)">
  <rect x="${bx}" y="${by}" width="${bw}" height="16" fill="${C.surface}"/>
  ${segs}
  <rect class="shine" x="0" y="${by}" width="80" height="16" fill="url(#shineGrad)"/>
</g>
${legend}`, `
  <clipPath id="barClip"><rect x="${bx}" y="${by}" width="${bw}" height="16" rx="8"/></clipPath>
  <linearGradient id="shineGrad"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
}

/* ---------- 4. Contributions ---------- */
function activity(c) {
  const W = 840, H = 500;
  const days = c.weeks.flatMap((w) => w.contributionDays);
  const today = days[days.length - 1];

  // streaks (a day without contributions today does not break the current one yet)
  let longest = 0, run = 0;
  for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
  let current = 0, i = days.length - 1;
  if (!today.contributionCount) i--;
  while (i >= 0 && days[i].contributionCount) { current++; i--; }
  const best = days.reduce((a, d) => (d.contributionCount > a.contributionCount ? d : a), days[0]);
  const fmt = (iso) => { const d = new Date(iso + 'T00:00:00Z'); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };

  const tiles = [
    [c.total.toLocaleString('en-US'), 'LAST 12 MONTHS', 'contributions'],
    [current, 'CURRENT STREAK', current === 1 ? 'day' : 'days'],
    [longest, 'LONGEST STREAK', 'days'],
    [best.contributionCount, 'BEST DAY', fmt(best.date)],
  ];
  const tw = (W - 72 - 36) / 4;
  const tileSvg = tiles.map(([v, label, unit], k) => {
    const x = 36 + k * (tw + 12);
    return `<g class="tile" style="animation-delay:${(0.1 + k * 0.1).toFixed(1)}s">
  <rect x="${x}" y="84" width="${tw}" height="70" rx="12" fill="${C.surface}" stroke="${C.border}"/>
  <text class="tl" x="${x + 16}" y="106">${label}</text>
  <text class="tv" x="${x + 16}" y="138">${esc(v)}<tspan class="tu" dx="6">${esc(unit)}</tspan></text></g>`;
  }).join('\n');

  // heatmap
  const cell = 11, step = 14, x0 = 70, y0 = 196;
  let cells = '', monthLabels = '', lastMonth = -1;
  c.weeks.forEach((w, col) => {
    const m = new Date(w.contributionDays[0].date + 'T00:00:00Z').getUTCMonth();
    if (m !== lastMonth && col < c.weeks.length - 2) {
      if (col > 0 || new Date(c.weeks[3].contributionDays[0].date + 'T00:00:00Z').getUTCMonth() === m) monthLabels += `<text class="ml" x="${x0 + col * step}" y="${y0 - 8}">${MONTHS[m]}</text>`;
      lastMonth = m;
    }
    w.contributionDays.forEach((d) => {
      const row = new Date(d.date + 'T00:00:00Z').getUTCDay();
      cells += `<rect x="${x0 + col * step}" y="${y0 + row * step}" width="${cell}" height="${cell}" rx="2.5" fill="${HEAT[d.contributionLevel]}" style="animation-delay:${(0.3 + col * 0.022).toFixed(2)}s"><title>${d.contributionCount} on ${d.date}</title></rect>`;
    });
  });
  const dayLabels = [[1, 'Mon'], [3, 'Wed'], [5, 'Fri']].map(([r, l]) => `<text class="ml" x="36" y="${y0 + r * step + 9}">${l}</text>`).join('');
  const legendX = W - 36 - 5 * step - 34;
  const legend = `<text class="ml" x="${legendX - 32}" y="${y0 + 7 * step + 18}">Less</text>` +
    Object.values(HEAT).map((col, k) => `<rect x="${legendX + k * step}" y="${y0 + 7 * step + 9}" width="${cell}" height="${cell}" rx="2.5" fill="${col}"/>`).join('') +
    `<text class="ml" x="${legendX + 5 * step + 4}" y="${y0 + 7 * step + 18}">More</text>`;

  // per year
  const maxYear = Math.max(...c.years.map(([, v]) => v), 1);
  const yearBars = c.years.map(([y, v], k) => {
    const yy = H - 100 + k * 28, bw = Math.max((v / maxYear) * 190, 4);
    return `<text class="yl" x="36" y="${yy + 10}">${y}</text>
  <rect x="84" y="${yy}" width="190" height="12" rx="6" fill="${C.surface}"/>
  <rect class="bar" x="84" y="${yy}" width="${bw.toFixed(1)}" height="12" rx="6" fill="url(#brand)" style="animation-delay:${(0.8 + k * 0.15).toFixed(2)}s"/>
  <text class="yv" x="${84 + bw + 8}" y="${yy + 10}">${v}</text>`;
  }).join('\n');

  // per month (last 12)
  const perMonth = new Map();
  for (const d of days) { const k = d.date.slice(0, 7); perMonth.set(k, (perMonth.get(k) || 0) + d.contributionCount); }
  const months = [...perMonth.entries()].slice(-12);
  const maxM = Math.max(...months.map(([, v]) => v), 1);
  const baseY = H - 40, chartH = 96, mx0 = 372, mstep = 36;
  const monthBars = months.map(([k, v], j) => {
    const h = Math.max((v / maxM) * chartH, 2), x = mx0 + j * mstep, m = Number(k.slice(5)) - 1;
    return `<rect class="col" x="${x}" y="${baseY - h}" width="22" height="${h.toFixed(1)}" rx="5" fill="${j === months.length - 1 ? C.gold : 'url(#vbrand)'}" style="animation-delay:${(0.9 + j * 0.06).toFixed(2)}s"><title>${v} in ${MONTHS[m]} ${k.slice(0, 4)}</title></rect>
  ${v ? `<text class="mv" x="${x + 11}" y="${baseY - h - 6}" text-anchor="middle" style="animation-delay:${(1.4 + j * 0.06).toFixed(2)}s">${v}</text>` : ''}
  <text class="ml" x="${x + 11}" y="${baseY + 16}" text-anchor="middle">${MONTHS[m][0]}</text>`;
  }).join('\n');

  return svg(W, H, `Contribution activity: ${c.total} contributions in the last year; per year ${c.years.map(([y, v]) => `${y}: ${v}`).join(', ')}`, `
  .h{font:700 20px ${SANS};fill:${C.text}}.sub{font:13px ${SANS};fill:${C.muted}}.h2{font:700 15px ${SANS};fill:${C.text}}
  .tl{font:600 10.5px ${SANS};fill:${C.muted};letter-spacing:1.2px}
  .tv{font:800 24px ${SANS};fill:${C.text}}.tu{font:500 12px ${SANS};fill:${C.muted}}
  .ml{font:11px ${SANS};fill:${C.muted}}
  .yl{font:600 12px ${MONO};fill:${C.muted}}.yv{font:700 12px ${MONO};fill:${C.text}}
  .mv{font:600 10px ${MONO};fill:${C.muted};opacity:0;animation:appear .4s ease-out forwards}
  .tile{opacity:0;animation:appear .5s ease-out forwards}
  @keyframes appear{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .heat rect{opacity:0;animation:cellIn .4s ease-out forwards}
  @keyframes cellIn{to{opacity:1}}
  .bar{transform-box:fill-box;transform-origin:left;transform:scaleX(0);animation:grow 1s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes grow{to{transform:scaleX(1)}}
  .col{transform-box:fill-box;transform-origin:bottom;transform:scaleY(0);animation:rise 1s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes rise{to{transform:scaleY(1)}}`, `
<text class="h" x="36" y="46">Contribution activity</text>
<text class="sub" x="36" y="68">${c.total} contributions in the last year · updated daily</text>
${tileSvg}
${monthLabels}${dayLabels}
<g class="heat">${cells}</g>
${legend}
<path d="M36 ${H - 150}H${W - 36}" stroke="${C.border}"/>
<text class="h2" x="36" y="${H - 122}">Per year</text>
<text class="h2" x="372" y="${H - 122}">Last 12 months</text>
${yearBars}
<path d="M${mx0 - 6} ${baseY}H${W - 36}" stroke="${C.border}"/>
${monthBars}`, `
  <linearGradient id="vbrand" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.crimson}"/><stop offset="1" stop-color="${C.blush}"/></linearGradient>`);
}

/* ---------- 5. Journey ---------- */
function journey(progress) {
  const steps = [
    ['Aug 2023', 'Apprenticeship', 'begins'],
    ['Feb 2025', 'First repos', 'C# & the web'],
    ['Dec 2025', 'Exam project', 'secure C# app'],
    ['Mar 2026', 'Going mobile', 'Angular + Ionic'],
    ['Jun 2026', 'cram', 'iOS + FastAPI'],
    ['Now', 'Final year', '+ internship', 'now'],
    ['2027', 'EFZ diploma', 'the goal', 'next'],
  ];
  const W = 840, H = 270, x0 = 90, x1 = W - 90, ly = 180, gap = (x1 - x0) / (steps.length - 1), pbW = W - 72;
  const lineLen = (steps.length - 2) * gap;
  const nodes = steps.map(([d, t, s, state], i) => {
    const x = x0 + i * gap, stroke = state === 'now' ? C.gold : state === 'next' ? C.dim : C.rose;
    return `<g class="node${state === 'next' ? ' future' : ''}" style="animation-delay:${(0.5 + i * 0.22).toFixed(2)}s">
  ${state === 'now' ? `<circle class="pulse" cx="${x}" cy="${ly}" r="9" fill="${C.gold}"/>` : ''}
  <circle cx="${x}" cy="${ly}" r="9" fill="${C.bg}" stroke="${stroke}" stroke-width="3" ${state === 'next' ? 'stroke-dasharray="3 3"' : ''}/>
  ${state === 'next' ? '' : `<circle cx="${x}" cy="${ly}" r="3.5" fill="${state === 'now' ? C.gold : C.text}"/>`}
  <text class="d${state === 'now' ? ' dnow' : ''}" x="${x}" y="${ly - 22}" text-anchor="middle">${esc(d)}</text>
  <text class="t" x="${x}" y="${ly + 34}" text-anchor="middle">${esc(t)}</text>
  <text class="s" x="${x}" y="${ly + 52}" text-anchor="middle">${esc(s)}</text></g>`;
  }).join('\n');
  return svg(W, H, `Journey from the start of the apprenticeship in August 2023 to the EFZ diploma in 2027`, `
  .h{font:700 20px ${SANS};fill:${C.text}}.sub{font:13px ${SANS};fill:${C.muted}}
  .pl{font:600 12px ${MONO};fill:${C.gold}}
  .pb{transform-box:fill-box;transform-origin:left;transform:scaleX(0);animation:grow 1.6s .2s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes grow{to{transform:scaleX(1)}}
  .line{stroke-dasharray:${lineLen};stroke-dashoffset:${lineLen};animation:draw ${(steps.length * 0.22).toFixed(2)}s .5s linear forwards}
  @keyframes draw{to{stroke-dashoffset:0}}
  .node{opacity:0;animation:in .5s cubic-bezier(.2,.8,.2,1.4) forwards}
  .future{animation-name:inDim}
  @keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes inDim{from{opacity:0}to{opacity:.6}}
  .d{font:700 11px ${MONO};fill:${C.blush};letter-spacing:.5px}.dnow{fill:${C.gold}}
  .t{font:700 13.5px ${SANS};fill:${C.text}}.s{font:12px ${SANS};fill:${C.muted}}
  .pulse{transform-box:fill-box;transform-origin:center;animation:ping 2s ease-out infinite}
  @keyframes ping{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.6);opacity:0}}`, `
<text class="h" x="36" y="46">The road so far</text>
<text class="sub" x="36" y="68">Apprenticeship · Application Developer EFZ · year ${progress.year} of ${APPRENTICESHIP.years}</text>
<text class="pl" x="${W - 36}" y="68" text-anchor="end">${Math.round(progress.ratio * 100)}% DONE</text>
<rect x="36" y="84" width="${pbW}" height="8" rx="4" fill="${C.surface}"/>
<rect class="pb" x="36" y="84" width="${(pbW * progress.ratio).toFixed(1)}" height="8" rx="4" fill="url(#brand)"/>
${[1, 2, 3].map((k) => `<path d="M${36 + (pbW * k) / 4} 82v12" stroke="${C.bg}" stroke-width="2"/>`).join('')}
<path d="M${x0} ${ly}H${x1}" stroke="${C.border}" stroke-width="3" stroke-linecap="round"/>
<path class="line" d="M${x0} ${ly}H${x0 + lineLen}" stroke="url(#hline)" stroke-width="3" stroke-linecap="round"/>
${nodes}`, `
  <linearGradient id="hline" gradientUnits="userSpaceOnUse" x1="${x0}" y1="0" x2="${x0 + lineLen}" y2="0"><stop offset="0" stop-color="${C.crimson}"/><stop offset="1" stop-color="${C.gold}"/></linearGradient>`);
}

function apprenticeship(now = new Date()) {
  const { start, end, years } = APPRENTICESHIP;
  const ratio = Math.min(Math.max((now - start) / (end - start), 0), 1);
  const year = Math.min(Math.floor((now - start) / (365.25 * 864e5)) + 1, years);
  return { ratio, year };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const langs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'languages.json'), 'utf8'));
  const [contrib, avatar] = await Promise.all([contributions(), avatarDataUri()]);
  const progress = apprenticeship();
  const cards = {
    header: header(avatar), about: about(progress), languages: languages(langs),
    activity: activity(contrib), journey: journey(progress),
  };
  for (const [name, content] of Object.entries(cards)) fs.writeFileSync(path.join(OUT, `${name}.svg`), content);
  console.log(`cards written · ${contrib.total} contributions · year ${progress.year} (${Math.round(progress.ratio * 100)}%)`);
})().catch((e) => { console.error(e); process.exit(1); });
