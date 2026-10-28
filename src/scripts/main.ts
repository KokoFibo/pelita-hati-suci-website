import { initTheme, initHeader, initMenu, initFaq, initFilters, initForms, initPlaceholders, initCopy, initLangSwitch, initYear } from './ui';
import { initAnimations } from './animations';

const safe = (fn: () => void) => {
  try { fn(); } catch (e) { console.error(e); }
};

[initTheme, initHeader, initMenu, initFaq, initFilters, initForms, initPlaceholders, initCopy, initLangSwitch, initYear].forEach(safe);
safe(initAnimations);
// Selalu tandai siap, supaya konten tidak pernah tertahan tersembunyi.
document.documentElement.setAttribute('data-anim', 'ready');
