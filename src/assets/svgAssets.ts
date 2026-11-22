export interface InlineSvgAssets {
  hero: string;
  antagonists: Record<'cybersec' | 'ai' | 'devops', string>;
  orbs: Record<'cybersec' | 'ai' | 'devops', string>;
  pickups: Record<'freeze' | 'shield' | 'double' | 'triple' | 'sticky', string>;
}

function svg(markup: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

const hero = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><filter id="g"><feGaussianBlur stdDeviation="2"/></filter></defs>
  <rect x="18" y="25" width="28" height="28" rx="8" fill="#10273a" stroke="#00f0ff" stroke-width="3"/>
  <circle cx="32" cy="18" r="12" fill="#dffcff" stroke="#00f0ff" stroke-width="3"/>
  <path d="M24 18h16M32 10v16" stroke="#00f0ff" stroke-width="2" opacity=".9"/>
  <rect x="23" y="53" width="18" height="5" rx="2" fill="#00f0ff" opacity=".8"/>
  <circle cx="32" cy="18" r="18" fill="none" stroke="#00f0ff" opacity=".35" filter="url(#g)"/>
</svg>`);

const orbSvg = (icon: string, color: string) => svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="27" fill="#101827" stroke="${color}" stroke-width="4"/>
  <circle cx="32" cy="32" r="20" fill="${color}" opacity=".12"/>
  ${icon}
</svg>`);

export const SVG_ASSETS: InlineSvgAssets = {
  hero,
  antagonists: {
    cybersec: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="10" y="10" width="76" height="76" rx="12" fill="#101827" stroke="#00f0ff" stroke-width="4"/><rect x="25" y="25" width="46" height="34" rx="5" fill="#07131d" stroke="#00f0ff"/><path d="M20 70h56M30 80h36" stroke="#ff2a55" stroke-width="5"/><circle cx="38" cy="42" r="4" fill="#ff2a55"/><circle cx="58" cy="42" r="4" fill="#00f0ff"/></svg>`),
    ai: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="38" fill="#161022" stroke="#c77dff" stroke-width="5"/><g fill="#c77dff"><circle cx="34" cy="34" r="7"/><circle cx="62" cy="34" r="7"/><circle cx="48" cy="61" r="8"/></g><g stroke="#c77dff" stroke-width="3"><path d="M34 34l14 27 14-27M34 34h28"/></g></svg>`),
    devops: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="10" y="16" width="76" height="64" rx="8" fill="#101d14" stroke="#7cff6b" stroke-width="4"/><path d="M28 34h40M28 48h26M28 62h34" stroke="#7cff6b" stroke-width="5"/><circle cx="75" cy="62" r="7" fill="#ff2a55"/></svg>`),
  },
  orbs: {
    cybersec: orbSvg(`<path d="M23 25h18v14H23zM27 21h10v4M27 39v5M37 39v5" fill="none" stroke="#00f0ff" stroke-width="3"/>`, '#00f0ff'),
    ai: orbSvg(`<circle cx="24" cy="24" r="5" fill="#c77dff"/><circle cx="40" cy="24" r="5" fill="#c77dff"/><circle cx="32" cy="41" r="6" fill="#c77dff"/><path d="M24 24l8 17 8-17M24 24h16" fill="none" stroke="#c77dff" stroke-width="3"/>`, '#c77dff'),
    devops: orbSvg(`<path d="M32 20v24M22 27l20 10M42 27l-20 10" stroke="#7cff6b" stroke-width="4"/><circle cx="32" cy="20" r="5" fill="#7cff6b"/>`, '#7cff6b'),
  },
  pickups: {
    freeze: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#10273a" stroke="#00f0ff" stroke-width="4"/><path d="M32 12v40M15 22l34 20M49 22L15 42" stroke="#bdfcff" stroke-width="4"/></svg>`),
    shield: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#14233a" stroke="#ffffff" stroke-width="4"/><path d="M32 14l16 6v11c0 11-6 17-16 21-10-4-16-10-16-21V20z" fill="#ffffff" opacity=".8"/></svg>`),
    double: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#30270d" stroke="#ffd700" stroke-width="4"/><path d="M20 44V20l12 12V20l12 24" fill="none" stroke="#ffd700" stroke-width="5"/></svg>`),
    triple: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#30270d" stroke="#ff9d00" stroke-width="4"/><path d="M14 44V20l10 12V20l10 24 10-24v24" fill="none" stroke="#ff9d00" stroke-width="4"/></svg>`),
    sticky: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#30101b" stroke="#ff6f91" stroke-width="4"/><circle cx="32" cy="32" r="12" fill="none" stroke="#ff6f91" stroke-width="5"/><path d="M32 44v10" stroke="#ff6f91" stroke-width="5"/></svg>`),
  },
};
