// app.js — improved: image fallback + multi-hotels-target + robust rendering

// --- Demo data (same as before) ---
const DESTINATIONS = [
  {
    id: 'nyc',
    name: 'New York City, NY',
    img: 'https://images.unsplash.com/photo-1549921296-3f2f0a3d2b0b?auto=format&fit=crop&w=1200&q=80',
    desc: 'Iconic skyline, museums, Broadway shows.',
    hotels: [
      {name:'Central Boutique', rating:4.5, price:240},
      {name:'Midtown Budget Inn', rating:3.4, price:120},
      {name:'Riverside Luxury', rating:5, price:560}
    ],
    places: [
      {type:'attractions', name:'Statue of Liberty', rating:4.8},
      {type:'restaurants', name:'Famous Pizza', rating:4.5},
      {type:'parks', name:'Central Park', rating:4.9}
    ]
  },
  {
    id: 'gc',
    name: 'Grand Canyon, AZ',
    img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    desc: 'Vast canyon vistas and hiking.',
    hotels: [
      {name:'Rim Lodge', rating:4.2, price:180},
      {name:'Canyon Camp', rating:3.9, price:90}
    ],
    places: [
      {type:'attractions', name:'South Rim Viewpoints', rating:4.9},
      {type:'parks', name:'Grand Canyon National Park', rating:5}
    ]
  },
  {
    id: 'sf',
    name: 'San Francisco, CA',
    img: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
    desc: 'Golden Gate, cable cars, lively neighborhoods.',
    hotels: [
      {name:'Bayview Hotel', rating:4.3, price:220},
      {name:'Cozy Wharf Inn', rating:4.0, price:160}
    ],
    places: [
      {type:'attractions', name:'Golden Gate Bridge', rating:4.9},
      {type:'restaurants', name:"Fisherman's Wharf Eats", rating:4.4}
    ]
  },
  {
    id: 'ys',
    name: 'Yellowstone, WY',
    img: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=1200&q=80',
    desc: 'Geysers, wildlife, and wilderness.',
    hotels: [
      {name:'Old Faithful Inn', rating:4.7, price:210},
      {name:'Parkside Cabin', rating:4.1, price:130}
    ],
    places: [
      {type:'attractions', name:'Old Faithful', rating:4.9},
      {type:'parks', name:'Yellowstone National Park', rating:5}
    ]
  },
  {
    id: 'miami',
    name: 'Miami, FL',
    img: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
    desc: 'Beaches, nightlife, and Art Deco architecture.',
    hotels: [
      {name:'Oceanfront Suites', rating:4.4, price:280},
      {name:'Miami Budget Stay', rating:3.8, price:110}
    ],
    places: [
      {type:'attractions', name:'South Beach', rating:4.7},
      {type:'restaurants', name:'Cuban Corner', rating:4.6}
    ]
  }
];

// --- Helpers ---
function makePlaceholderDataUrl(text, w = 800, h = 480, bg = '#ddebf5', fg = '#0f1724') {
  // simple SVG placeholder encoded as data URL
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <rect width='100%' height='100%' fill='${bg}' />
    <text x='50%' y='50%' font-family='Inter,Arial,sans-serif' font-size='28' fill='${fg}' text-anchor='middle' dominant-baseline='central'>${escapeXml(text)}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function escapeXml(s){ return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c])); }

// --- DOM refs (robust) ---
const citySelect = document.getElementById('city');
const estimateBtn = document.getElementById('estimateBtn');
const estEls = document.querySelectorAll('.est, #estPanel'); // multiple spots OK
const findHotelsBtn = document.getElementById('findHotels');
const ratingSel = document.getElementById('rating');
const priceSel = document.getElementById('priceRange');
const placesEl = document.getElementById('places');
const typeFilter = document.getElementById('typeFilter') || document.getElementById('typeFilter'); // may exist
const sortBy = document.getElementById('sortBy') || document.getElementById('sortBy');
const saveBtn = document.getElementById('saveIt');
const clearBtn = document.getElementById('clearIt');
const itCard = document.getElementById('it-card');

// hotels: there may be multiple containers with id="hotels" (panel + content). select all
function getHotelsContainers(){
  // querySelectorAll supports duplicate IDs; returns NodeList
  return document.querySelectorAll('#hotels');
}

// --- Populate city select ---
function populateCities() {
  if (!citySelect) return;
  citySelect.innerHTML = '';
  DESTINATIONS.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.name;
    citySelect.append(opt);
  });
}
populateCities();

// --- Image creation with fallback ---
function createPlaceThumb(dest, p) {
  const div = document.createElement('div');
  div.className = 'thumb';
  div.setAttribute('role', 'listitem');

  const img = document.createElement('img');
  img.alt = `${p.name} — ${dest.name}`;

  // set primary src
  img.src = dest.img;

  // if the image fails to load, use data-URI placeholder with place name
  img.onerror = () => {
    img.onerror = null;
    img.src = makePlaceholderDataUrl(p.name);
  };

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `<strong>${p.name}</strong><div class="muted">${p.type} • Rating: ${p.rating}</div>`;

  div.append(img, meta);
  return div;
}

// --- Render places gallery for selected city ---
function renderPlacesFor(cityId) {
  if (!placesEl) return;
  placesEl.innerHTML = '';
  const dest = DESTINATIONS.find(d => d.id === cityId);
  if (!dest) return;
  // create thumbs for each place
  dest.places.forEach(p => {
    const thumb = createPlaceThumb(dest, p);
    placesEl.appendChild(thumb);
  });
}

// --- Render hotels to all hotels containers ---
function renderHotels(cityId) {
  const containers = getHotelsContainers();
  containers.forEach(c => c.innerHTML = ''); // clear them
  const dest = DESTINATIONS.find(d => d.id === cityId);
  if (!dest) {
    containers.forEach(c => c.textContent = 'No hotels for this destination.');
    return;
  }
  const minRating = Number(ratingSel ? ratingSel.value : 0);
  const maxPrice = Number(priceSel ? priceSel.value : 9999);
  const filtered = dest.hotels.filter(h => h.rating >= minRating && h.price <= maxPrice);
  if (filtered.length === 0) {
    containers.forEach(c => c.textContent = 'No hotels match filters.');
    return;
  }
  filtered.forEach(h => {
    const html = document.createElement('div');
    html.className = 'item';
    html.innerHTML = `<div style="flex:1">
      <strong>${h.name}</strong><div class="muted">Rating: ${h.rating} • $${h.price}/night</div>
    </div>
    <div><button class="btn small" data-name="${h.name}">Select</button></div>`;
    containers.forEach(c => c.appendChild(html.cloneNode(true)));
  });
}

// --- Simple estimator ---
function estimate() {
  const transport = document.querySelector('input[name="transport"]:checked')?.value || 'flight';
  const cityId = citySelect?.value;
  const dest = DESTINATIONS.find(d => d.id === cityId);
  if (!dest) {
    updateEst('Pick a destination first.');
    return;
  }
  const distFactor = {nyc:1, gc:2.8, sf:2.5, ys:3, miami:2.2}[cityId] || 2;
  let time, price;
  if (transport === 'flight') {
    time = Math.round(1.5 * distFactor) + 'h';
    price = Math.round(120 * distFactor);
  } else if (transport === 'train') {
    time = Math.round(3.5 * distFactor) + 'h';
    price = Math.round(60 * distFactor);
  } else {
    time = Math.round(5 * distFactor) + 'h';
    price = Math.round(40 * distFactor);
  }
  updateEst(`Estimate: approx ${time}, from $${price} per passenger (mock).`);
}

function updateEst(text) {
  estEls.forEach(el => { if (el) el.textContent = text; });
}

// --- Itinerary save/clear ---
function saveItinerary() {
  const cityId = citySelect?.value;
  const dest = DESTINATIONS.find(d => d.id === cityId);
  const from = document.getElementById('from')?.value || '—';
  const to = document.getElementById('to')?.value || '—';
  const pax = document.getElementById('pax')?.value || '1';
  const transport = document.querySelector('input[name="transport"]:checked')?.value || 'flight';
  const it = {city: dest ? dest.name : '—', from, to, pax, transport};
  localStorage.setItem('itinerary', JSON.stringify(it));
  renderItinerary();
}

function clearItinerary() {
  localStorage.removeItem('itinerary');
  renderItinerary();
}

function renderItinerary() {
  if (!itCard) return;
  const raw = localStorage.getItem('itinerary');
  if (!raw) { itCard.textContent = 'No saved itinerary yet.'; return; }
  const it = JSON.parse(raw);
  itCard.innerHTML = `<strong>${it.city}</strong><div class="muted">From: ${it.from} • To: ${it.to} • Pax: ${it.pax}</div><div style="margin-top:6px">Transport: ${it.transport}</div>`;
}

// --- Wire events ---
document.addEventListener('DOMContentLoaded', () => {
  // initial populate
  populateCities();
  if (citySelect) {
    citySelect.value = DESTINATIONS[0].id;
    renderPlacesFor(citySelect.value);
    renderHotels(citySelect.value);
    citySelect.addEventListener('change', () => {
      renderPlacesFor(citySelect.value);
      renderHotels(citySelect.value);
    });
  }

  if (estimateBtn) estimateBtn.addEventListener('click', estimate);
  const findHotelsBtnEl = document.getElementById('findHotels');
  if (findHotelsBtnEl) findHotelsBtnEl.addEventListener('click', () => renderHotels(citySelect.value));

  if (typeFilter) {
    typeFilter.addEventListener('change', () => {
      const cityId = citySelect.value;
      const dest = DESTINATIONS.find(d => d.id === cityId);
      if (!dest) return;
      const type = typeFilter.value;
      placesEl.innerHTML = '';
      dest.places
        .filter(p => type === 'all' ? true : p.type === type)
        .forEach(p => placesEl.appendChild(createPlaceThumb(dest, p)));
    });
  }

  if (sortBy) {
    sortBy.addEventListener('change', () => {
      const cityId = citySelect.value;
      const dest = DESTINATIONS.find(d => d.id === cityId);
      if (!dest) return;
      const items = [...dest.places];
      if (sortBy.value === 'rating') items.sort((a,b)=>b.rating-a.rating);
      else if (sortBy.value === 'distance') items.reverse();
      placesEl.innerHTML = '';
      items.forEach(p => placesEl.appendChild(createPlaceThumb(dest, p)));
    });
  }

  // hotels select click (delegation)
  document.addEventListener('click', (e) => {
    if (e.target.matches('#hotels .btn, .list .btn')) {
      const name = e.target.dataset.name;
      if (name) alert(`Selected hotel: ${name} (mock).`);
    }
  });

  if (saveBtn) saveBtn.addEventListener('click', saveItinerary);
  if (clearBtn) clearBtn.addEventListener('click', clearItinerary);

  renderItinerary();

  // keyboard: Enter/Space on focused buttons triggers click
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.tagName === 'BUTTON') {
      document.activeElement.click();
      e.preventDefault();
    }
  });
});

// --- Utility: createPlaceThumb re-used by filters (keeps images fallback consistent) ---
function createPlaceThumb(dest, p) {
  const div = document.createElement('div');
  div.className = 'thumb';
  div.setAttribute('role', 'listitem');

  const img = document.createElement('img');
  img.alt = `${p.name} — ${dest.name}`;
  img.src = dest.img;
  img.onerror = () => { img.onerror = null; img.src = makePlaceholderDataUrl(p.name); };

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `<strong>${p.name}</strong><div class="muted">${p.type} • Rating: ${p.rating}</div>`;

  div.appendChild(img);
  div.appendChild(meta);
  return div;
}
