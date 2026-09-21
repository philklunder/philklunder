// Generates the animated header card for the GitHub profile README.
//
//   node scripts/generate-header.js
//
// The avatar is fetched live and embedded, so re-run this after changing the
// profile picture.
const fs = require('fs');
const path = require('path');

const LOGIN = 'philklunder';
const OUT = path.join(__dirname, '..', 'assets', 'header.svg');

const C = {
  bg: '#0C0C0E', surface: '#16161A', line: '#26262C',
  text: '#F4F4F5', steel: '#A1A1AA', dim: '#3F3F46',
  crimson: '#C8102E', deep: '#6E0B19', ember: '#E5243B',
};
const SANS = `'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'Cascadia Code', Consolas, 'Liberation Mono', monospace`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function avatarDataUri() {
  const res = await fetch(`https://avatars.githubusercontent.com/${LOGIN}?s=160`);
  if (!res.ok) throw new Error(`avatar: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${res.headers.get('content-type') || 'image/png'};base64,${buf.toString('base64')}`;
}

function header(avatar) {
  const W = 840, H = 280, ax = 702, ay = 140, r = 68;
  // octagon around the portrait
  const oct = (rad) => Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 8) + (i * Math.PI) / 4;
    return `${(ax + rad * Math.cos(a)).toFixed(1)},${(ay + rad * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  // HUD corner brackets
  const b = 96, k = 18;
  const brackets = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
    `<path d="M${ax + sx * b} ${ay + sy * (b - k)}V${ay + sy * b}H${ax + sx * (b - k)}" fill="none" stroke="${C.steel}" stroke-width="2"/>`).join('');
  const roles = ['Application Developer EFZ · final year', 'Intern · building full-stack web apps', 'TypeScript · Angular · Swift · C#'];
  // rose petals drifting down: [x, scale, duration s, delay s, colour, sway]
  const petals = [
    [470, 1.4, 13, 0, C.crimson, 'a'],
    [585, 1.1, 17, 5, C.ember, 'b'],
    [660, 1.7, 15, 9, C.deep, 'a'],
    [760, 1.3, 12, 3, C.crimson, 'b'],
    [820, 1.0, 19, 12, C.ember, 'a'],
    [520, 0.9, 21, 15, C.crimson, 'b'],
  ].map(([x, s, dur, delay, fill, sway]) =>
    `<g transform="translate(${x} -24) scale(${s})"><path class="petal ${sway}" style="animation-duration:${dur}s;animation-delay:-${delay}s" d="M0 0C8 -10 20 -6 18 6C15 16 3 13 0 0Z" fill="${fill}"/></g>`).join('');
  const lines = roles.map((t, i) => `<text class="role r${i}" x="56" y="192">${esc(t)}</text>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Philipp Klunder — Application Developer EFZ apprentice from Switzerland">
<defs>
  <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.line}"/><stop offset=".7" stop-color="${C.line}"/><stop offset="1" stop-color="${C.crimson}" stop-opacity=".8"/>
  </linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0" spreadMethod="reflect">
    <stop offset="0" stop-color="${C.text}"/><stop offset=".42" stop-color="${C.text}"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset=".58" stop-color="${C.steel}"/><stop offset="1" stop-color="${C.text}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="-1 0; 1 0" dur="6s" repeatCount="indefinite"/>
  </linearGradient>
  <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.crimson}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
  <pattern id="diag" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <path d="M0 0V16" stroke="${C.line}" stroke-width="1.2"/>
  </pattern>
  <linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0"><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>
  <mask id="diagMask"><rect width="${W}" height="${H}" fill="url(#fadeL)"/></mask>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
  <clipPath id="card"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10"/></clipPath>
  <clipPath id="avatarClip"><polygon points="${oct(r)}"/></clipPath>
  <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.crimson}" stop-opacity="0"/><stop offset="1" stop-color="${C.crimson}" stop-opacity=".35"/></linearGradient>
</defs>
<style>
  .diag{animation:slide 6s linear infinite}
  @keyframes slide{to{transform:translateX(22.6px)}}
  .glow{transform-origin:${ax}px ${ay}px;animation:breathe 6s ease-in-out infinite}
  @keyframes breathe{0%,100%{opacity:.35}50%{opacity:.6}}
  .ring{transform-origin:${ax}px ${ay}px;animation:spin 20s linear infinite}
  .ring2{animation-duration:34s;animation-direction:reverse}
  @keyframes spin{to{transform:rotate(360deg)}}
  .scan{animation:scan 5s ease-in-out infinite}
  @keyframes scan{0%{transform:translateY(-${2 * r}px);opacity:0}15%{opacity:1}60%{transform:translateY(0);opacity:0}100%{transform:translateY(0);opacity:0}}
  .petal{opacity:0;animation:fall 16s linear infinite}
  .petal.b{animation-name:fallB}
  @keyframes fall{0%{opacity:0;transform:translate(0,0) rotate(0)}8%{opacity:.75}35%{transform:translate(-40px,160px) rotate(120deg)}65%{opacity:.5}80%,100%{opacity:0;transform:translate(-120px,420px) rotate(280deg)}}
  @keyframes fallB{0%{opacity:0;transform:translate(0,0) rotate(0)}8%{opacity:.7}40%{transform:translate(30px,180px) rotate(-90deg)}65%{opacity:.5}80%,100%{opacity:0;transform:translate(-50px,420px) rotate(-240deg)}}
  .hi{font:500 14px ${MONO};fill:${C.steel};letter-spacing:.5px}
  .name{font:800 50px ${SANS};letter-spacing:1px}
  .role{font:600 19px ${SANS};fill:${C.steel};opacity:0;animation:cycle 12s infinite both}
  .r1{animation-delay:4s}.r2{animation-delay:8s}
  @keyframes cycle{0%{opacity:0;transform:translateX(-10px)}4%,30%{opacity:1;transform:none}34%,100%{opacity:0;transform:translateX(10px)}}
  .tag{font:700 11.5px ${SANS};fill:${C.text};letter-spacing:1.6px}
  .in{animation:rise .8s cubic-bezier(.2,.8,.2,1) both}
  @keyframes rise{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
  .ul{transform-box:fill-box;transform-origin:left;transform:scaleX(0);animation:grow .9s .35s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes grow{to{transform:scaleX(1)}}
  .blink{animation:blink 1.4s steps(1) infinite}
  @keyframes blink{50%{opacity:.2}}
</style>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${C.bg}" stroke="url(#edge)" stroke-width="1.5"/>
<g clip-path="url(#card)">
  <g mask="url(#diagMask)"><rect class="diag" x="-40" y="0" width="${W + 80}" height="${H}" fill="url(#diag)"/></g>
  <circle class="glow" cx="${ax}" cy="${ay}" r="95" fill="${C.crimson}" filter="url(#glow)"/>
  <path d="M${W - 160} ${H}L${W} ${H - 160}V${H}Z" fill="${C.deep}" opacity=".35"/>
  <rect x="0" y="0" width="5" height="${H}" fill="url(#bar)"/>
  ${petals}
</g>
<polygon class="ring" points="${oct(r + 12)}" fill="none" stroke="${C.crimson}" stroke-width="2" stroke-dasharray="40 10 4 10"/>
<polygon class="ring ring2" points="${oct(r + 22)}" fill="none" stroke="${C.dim}" stroke-width="1" stroke-dasharray="2 6"/>
${brackets}
<g clip-path="url(#avatarClip)">
  <image href="${avatar}" x="${ax - r}" y="${ay - r}" width="${2 * r}" height="${2 * r}" preserveAspectRatio="xMidYMid slice"/>
  <rect class="scan" x="${ax - r}" y="${ay - r}" width="${2 * r}" height="${2 * r}" fill="url(#scan)"/>
</g>
<polygon points="${oct(r)}" fill="none" stroke="${C.bg}" stroke-width="3"/>
<g class="in"><text class="hi" x="56" y="70">~/philklunder <tspan fill="${C.crimson}">❯</tspan> whoami</text></g>
<g class="in" style="animation-delay:.12s"><text class="name" x="54" y="134" fill="url(#metal)">PHILIPP KLUNDER</text></g>
<rect class="ul" x="56" y="152" width="64" height="4" fill="${C.crimson}"/>
<rect class="ul" x="126" y="152" width="18" height="4" fill="${C.dim}" style="animation-delay:.5s"/>
${lines}
<g class="in" style="animation-delay:.45s">
  <rect class="blink" x="56" y="228" width="8" height="8" fill="${C.crimson}"/>
  <text class="tag" x="74" y="236">ALWAYS BUILDING</text>
  <g transform="translate(222 220)">
    <rect width="24" height="24" rx="3" fill="${C.crimson}"/>
    <path d="M10 5h4v5h5v4h-5v5h-4v-5H5v-4h5z" fill="#fff"/>
  </g>
  <text class="tag" x="256" y="236">SWITZERLAND</text>
</g>
</svg>`;
}

(async () => {
  fs.writeFileSync(OUT, header(await avatarDataUri()));
  console.log(`written ${path.relative(process.cwd(), OUT)}`);
})().catch((e) => { console.error(e); process.exit(1); });
