// app.js — minimal interactive logic + auto holiday decorations
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const suggestions = document.getElementById('suggestions');
  const cards = document.getElementById('cards');
  const savedCountEl = document.getElementById('savedCount');
  const toggleMap = document.getElementById('toggleMap');
  const mapRegion = document.getElementById('mapRegion');
  const selectedTransport = document.getElementById('selectedTransport');
  const datePill = document.getElementById('datePill');

  let saved = 0;
  const common = ['New York','Grand Canyon','San Francisco','Miami','Yellowstone','Los Angeles','Chicago','Las Vegas','San Diego','New Orleans'];

  // seed sample cards
  const sample = [
    {name:'Skyline Hotel', city:'New York', price:199, img:'https://source.unsplash.com/400x300/?newyork,hotel'},
    {name:'Canyon View Lodge', city:'Grand Canyon', price:149, img:'https://source.unsplash.com/400x300/?grand-canyon,lodge'},
    {name:'Golden Gate Inn', city:'San Francisco', price:180, img:'https://source.unsplash.com/400x300/?san-francisco,hotel'}
  ];
  function addCard(p){ 
    const art=document.createElement('article'); art.className='thumb';
    art.innerHTML = `<img src="${p.img}" alt="${p.city} hotel"><div class="meta"><strong>${p.name}</strong><div class="small muted">${p.city} • $${p.price}</div><div style="margin-top:8px;"><button class="btn save">Save</button> <button class="btn" data-hotel="${p.name}">Book</button></div></div>`;
    cards.appendChild(art);
  }
  sample.forEach(addCard);

  // suggestions
  function showSuggestions(q){
    const ql = q.trim().toLowerCase();
    suggestions.textContent = '';
    if(!ql) return;
    const matches = common.filter(s => s.toLowerCase().includes(ql)).slice(0,5);
    matches.forEach(m => {
      const b = document.createElement('button');
      b.className = 'pill';
      b.type = 'button';
      b.textContent = m;
      b.addEventListener('click', () => { searchInput.value = m; doSearch(m); });
      suggestions.appendChild(b);
    });
  }
  searchInput.addEventListener('input', e => showSuggestions(e.target.value));

  // transport radio -> label update
  document.querySelectorAll('.transport input').forEach(r => {
    r.addEventListener('change', () => selectedTransport.textContent = r.dataset.mode || r.parentElement.textContent.trim());
  });

  // form submit
  searchForm.addEventListener('submit', e => { e.preventDefault(); doSearch(searchInput.value.trim()); });

  function doSearch(q){
    if(!q){ suggestions.textContent = 'Enter a destination.'; return; }
    suggestions.textContent = `Searching ${q}...`;
    datePill.textContent = document.getElementById('departDate').value || 'Flexible dates';
    setTimeout(() => {
      suggestions.textContent = `Showing results for ${q}`;
      const p = {name: `${q} Highlights`, city: q, price: 0, img: `https://source.unsplash.com/400x300/?${encodeURIComponent(q)}`};
      addCard(p);
    }, 420);
  }

  // card actions (delegation)
  cards.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    if(btn.classList.contains('save')){ btn.classList.toggle('saved'); saved += btn.classList.contains('saved') ? 1 : -1; savedCountEl.textContent = Math.max(0, saved); }
    if(btn.dataset.hotel){ alert('Booking (demo) → ' + btn.dataset.hotel); }
  });

  // toggle map
  toggleMap.addEventListener('click', () => { mapRegion.hidden = !mapRegion.hidden; });

  // keyboard: enter on pill triggers search
  document.addEventListener('keydown', e => {
    if(e.key === 'Enter' && document.activeElement && document.activeElement.classList.contains('pill')){
      e.preventDefault();
      doSearch(document.activeElement.textContent);
    }
  });

  // keep mapRegion accessible
  new MutationObserver(() => { if(!mapRegion.hidden) mapRegion.setAttribute('tabindex','-1'); else mapRegion.removeAttribute('tabindex'); })
    .observe(mapRegion, {attributes:true,attributeFilter:['hidden']});

  // -------------------------
  // Auto-insert holiday decorations (no toggle)
  // -------------------------
  (function autoHoliday(){
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // bg
    const bg = document.createElement('div'); bg.className = 'holiday-bg';
    if(!document.body.contains(bg)) document.body.appendChild(bg);
    // lights
    if(!reduce){
      const lights = document.createElement('div'); lights.className = 'holiday-lights';
      const colors = ['c1','c2','c3','c4','c5'];
      for(let i=0;i<16;i++){
        const b = document.createElement('div'); b.className = 'bulb ' + colors[i%colors.length];
        b.style.animationDelay = (Math.random()*2) + 's';
        lights.appendChild(b);
      }
      document.body.appendChild(lights);
      const snow = document.createElement('div'); snow.className = 'holiday-snow'; document.body.appendChild(snow);
    }
    document.documentElement.classList.add('holiday-root');
    document.querySelector('.container')?.classList.add('holiday');
    document.querySelector('.brand')?.classList.add('holiday');
  })();
});
