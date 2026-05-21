/* eslint-disable */

// Home page logic
// Note: This file is expected to populate containers defined in pages/index.html.

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function safeText(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

function getImgFromEvent(e) {
  // Try common fields used by typical APIs in this project.
  // If none exists, return empty string so UI still renders.
  return (
    e?.image ||
    e?.logo ||
    e?.poster ||
    e?.thumbnail ||
    e?.coverImage ||
    e?.cover_image ||
    e?.event_image ||
    e?.eventImage ||
    ''
  );
}

function getEventTitle(e) {
  return e?.title || e?.name || e?.eventName || e?.event_name || '';
}

function getEventId(e) {
  return e?.id || e?.eventId || e?.event_id || '';
}

function setHeroSlide(index, slide) {
  const track = qs('#hero-slider-track');
  if (!track) return;

  track.style.transform = `translateX(${-index * 100}%)`;

  qsa('#hero-dots-container .hero-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

window.setHeroSlide = function (index) {
  setHeroSlide(index, index);
};

window.moveHeroSlide = function (dir) {
  const dots = qsa('#hero-dots-container .hero-dot');
  const activeIndex = dots.findIndex(d => d.classList.contains('active'));
  const current = activeIndex >= 0 ? activeIndex : 0;
  const next = (current + dir + dots.length) % dots.length;
  setHeroSlide(next, next);
};

function renderEventCard(el, e) {
  const id = getEventId(e);
  const img = getImgFromEvent(e);
  const title = getEventTitle(e);

  // Minimal structure expected by dynamic cards in index.html.
  // Containers are empty; we just inject a clickable card with an img + title.
  el.innerHTML = `
    <div class="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <a href="user/event-detail.html?id=${encodeURIComponent(id)}" class="block">
        <div class="h-44 bg-gray-100 overflow-hidden">
          <img src="${img}" alt="${title}" class="w-full h-full object-cover" onerror="this.style.display='none'" />
        </div>
        <div class="p-5">
          <h3 class="font-bold text-gray-900 text-sm line-clamp-2">${title}</h3>
        </div>
      </a>
    </div>
  `;
}

async function fetchJson(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function initHeroAuto() {
  const dots = qsa('#hero-dots-container .hero-dot');
  if (dots.length < 2) return;
  let index = 0;
  setHeroSlide(0);
  setInterval(() => {
    index = (index + 1) % dots.length;
    setHeroSlide(index);
  }, 4500);
}

function initStaticSearchUI() {
  const btnSearch = qs('#btn-search-events');
  const input = qs('#event-search-keyword');
  const start = qs('#filter-start-date');
  const end = qs('#filter-end-date');

  if (!btnSearch || !input) return;

  const go = () => {
    const keyword = input.value?.trim() || '';
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (start?.value) params.set('start', start.value);
    if (end?.value) params.set('end', end.value);
    window.location.href = `index.html?${params.toString()}`;
  };

  btnSearch.addEventListener('click', go);
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') go();
  });

  const btnFilter = qs('#btn-filter-date');
  if (btnFilter) btnFilter.addEventListener('click', go);
}

async function initHeroFromApi() {
  // Hero is visible in index.html with 3 slides and links inside.
  // We will populate hero images from the CSDL via backend APIs if available.

  const slides = qsa('#hero-slider-track > div');
  if (!slides.length) return;

  // Try common endpoints used by this project.
  // If endpoint is not found, keep existing (blank) src.
  const endpoints = [
    '/api/events/featured',
    '/api/events/hero',
    '/api/home/hero-events',
    '/api/events',
  ];

  let events = null;
  for (const ep of endpoints) {
    try {
      const data = await fetchJson(ep);
      // Normalize to array
      events = Array.isArray(data) ? data : (data?.content || data?.events || data?.data || null);
      if (Array.isArray(events) && events.length) break;
    } catch (e) {
      // try next
    }
  }

  if (!Array.isArray(events) || !events.length) return;

  const top3 = events.slice(0, 3);

  top3.forEach((e, i) => {
    const imgSrc = getImgFromEvent(e);
    const id = getEventId(e);
    const title = getEventTitle(e);

    const imgEl = slides[i]?.querySelector('img');
    if (imgEl && imgSrc) imgEl.src = imgSrc;

    // Optional: if backend provides hero titles/labels, you can map here.
    // Requirement: do not create new fields; only use what exists.
    const link = slides[i]?.querySelector('a');
    if (link && id) link.href = `user/event-detail.html?id=${encodeURIComponent(id)}`;

    // Alt can be title if available
    if (imgEl && title) imgEl.alt = title;
  });
}

async function initFeaturedFromApi() {
  const giant = qs('#featured-giant-container');
  const grid = qs('#featured-grid-container');
  if (!giant || !grid) return;

  // Ensure grid has 4 slots if API returns more.
  const endpoints = [
    '/api/events/featured',
    '/api/events',
    '/api/home/featured-events',
  ];

  let events = null;
  for (const ep of endpoints) {
    try {
      const data = await fetchJson(ep);
      events = Array.isArray(data) ? data : (data?.content || data?.events || data?.data || null);
      if (Array.isArray(events) && events.length) break;
    } catch (e) {
      // try next
    }
  }

  if (!Array.isArray(events) || !events.length) return;

  const [first, ...rest] = events;

  if (first) {
    renderEventCard(giant, first);
  }

  grid.innerHTML = '';
  rest.slice(0, 4).forEach((e) => {
    const wrapper = document.createElement('div');
    renderEventCard(wrapper, e);
    // card wrapper returns full card; keep consistent grid sizing
    grid.appendChild(wrapper.firstElementChild || wrapper);
  });
}

async function initCategorySectionsFromApi() {
  // These sections exist as empty divs; actual events are expected to be injected.
  // We will only create links/cards based on whatever event objects returned.

  const mappings = [
    { sel: '#music-event-list', category: 'am nhac' },
    { sel: '#culture-event-list', category: 'van hoa nghe thuat' },
    { sel: '#tourism-event-list', category: 'tham quan - du lich' },
  ];

  // Optional query parameter filtering.
  const urlParams = new URLSearchParams(location.search);

  // If backend supports category filtering endpoint.
  const endpoints = [
    '/api/events/by-category',
    '/api/events',
  ];

  async function loadEventsForCategory(cat) {
    // Try by-category endpoint with query params.
    try {
      const res = await fetchJson(`/api/events/by-category?category=${encodeURIComponent(cat)}`);
      const arr = Array.isArray(res) ? res : (res?.content || res?.events || res?.data || null);
      if (Array.isArray(arr)) return arr;
    } catch (_) {
      // fallback below
    }

    // Fallback: list and filter on client (only if event has category/name).
    try {
      const res = await fetchJson('/api/events');
      const arr = Array.isArray(res) ? res : (res?.content || res?.events || res?.data || null);
      if (!Array.isArray(arr)) return [];
      const normalized = cat.toLowerCase();
      return arr.filter(e => {
        const c = (e?.category || e?.type || e?.genre || e?.eventCategory || '').toString().toLowerCase();
        return c.includes(normalized.split(' ')[0]);
      });
    } catch (_) {
      return [];
    }
  }

  for (const m of mappings) {
    const container = qs(m.sel);
    if (!container) continue;

    const events = await loadEventsForCategory(m.category);
    container.innerHTML = '';

    events.slice(0, 8).forEach((e) => {
      const wrapper = document.createElement('div');
      renderEventCard(wrapper, e);
      container.appendChild(wrapper.firstElementChild || wrapper);
    });
  }
}

async function initMiniSliderAndChipsFromApi() {
  // index.html has containers but expects home.js to populate.
  const chipContainer = qs('#category-filters');
  const miniTrack = qs('#mini-slider-track');
  if (!chipContainer || !miniTrack) return;

  // Try endpoint categories
  let categories = [];
