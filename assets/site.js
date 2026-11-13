
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
if (menuButton && nav) {
  const small = matchMedia('(max-width: 650px)');
  menuButton.hidden = false;
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  small.addEventListener('change', closeMenu);
  document.documentElement.classList.add('js');
}

const filters = document.querySelector('.filters');
if (filters) {
  filters.hidden = false;
  const buttons = [...filters.querySelectorAll('[data-filter]')];
  const search = document.querySelector('#project-search');
  const count = document.querySelector('#project-count');
  const noResults = document.querySelector('#no-results');
  const norm = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const cards = [...document.querySelectorAll('.work-card')].map(el => ({
    el,
    index: norm(el.textContent),
    area: el.dataset.area
  }));
  let area = 'todos';
  function update() {
    const terms = norm(search.value).split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const card of cards) {
      const match = (area === 'todos' || area === card.area) && terms.every(t => card.index.includes(t));
      card.el.hidden = !match;
      if (match) shown++;
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === area));
    count.textContent = shown === 1 ? '1 projeto' : shown + ' projetos';
    noResults.hidden = shown > 0;
  }
  function readLocation(scroll) {
    const value = new URLSearchParams(location.search).get('area');
    area = buttons.some(b => b.dataset.filter === value) ? value : 'todos';
    const focus = cards.find(c => '#'+c.el.id === location.hash);
    if (focus) {
      if (area !== 'todos' && area !== focus.area) area = 'todos';
      search.value = '';
      focus.el.querySelector('details').open = true;
    }
    update();
    if (focus && scroll) requestAnimationFrame(() => focus.el.scrollIntoView({block:'start'}));
  }
  function changeArea(value) {
    area = value;
    const url = new URL(location.href);
    if (area === 'todos') url.searchParams.delete('area');
    else url.searchParams.set('area', area);
    url.hash = '';
    try { history.replaceState(null, '', url); } catch { /* file previews may restrict history */ }
    update();
  }
  for (const button of buttons) button.addEventListener('click', () => changeArea(button.dataset.filter));
  search.addEventListener('input', update);
  document.querySelector('#reset-filters').addEventListener('click', () => {
    search.value = '';
    changeArea('todos');
    search.focus();
  });
  addEventListener('hashchange', () => readLocation(true));
  readLocation(true);
}

const dialog = document.querySelector('#lightbox');
if (dialog && typeof dialog.showModal === 'function') {
  const dialogTitle = dialog.querySelector('#lightbox-title');
  const body = dialog.querySelector('.lightbox-body');
  let trigger;
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-lightbox]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    trigger = link;
    dialogTitle.textContent = link.dataset.title;
    const photo = new Image();
    photo.alt = link.dataset.desc;
    photo.src = link.href;
    body.replaceChildren(photo);
    dialog.showModal();
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    body.replaceChildren();
    trigger?.focus();
  });
}
