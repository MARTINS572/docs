// Aplica o tema antes da primeira pintura para evitar o "piscar" de cores.
(() => {
  let theme = null;
  try {
    theme = localStorage.getItem('theme');
  } catch {
    theme = null;
  }
  if (theme !== 'light' && theme !== 'dark') {
    const prefersLight = window.matchMedia?.(
      '(prefers-color-scheme: light)',
    ).matches;
    theme = prefersLight ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
