/* ===== 지도: Kakao / Naver / Leaflet 폴백 ===== */
const MAP_DEFAULT_PROVIDER = 'kakao'; // 'kakao' | 'naver'
const KAKAO_JS_KEY = '243bffddd0f090d5a85151747fa7e347'; // ✅ 카카오 JavaScript 키
const NAVER_CLIENT_ID = 'v43co5qjet';                      // ✅ 네이버 ncpClientId(Web Dynamic Map)

const VENUE = {
  lat: 37.4966083,
  lng: 127.0269028,
  title: '삼성전자 서초사옥 5F'
};

function loadScript(src){
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => res(src);
    s.onerror = (e) => rej(new Error(`Script load error: ${src}`));
    document.head.appendChild(s);
  });
}
function loadCss(href){
  return new Promise((res, rej) => {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    l.onload = () => res(href);
    l.onerror = () => rej(new Error(`CSS load error: ${href}`));
    document.head.appendChild(l);
  });
}
function showMapError(html){
  const el = document.getElementById('map');
  if (!el) return;
  el.innerHTML = `<div class="w-full h-full flex items-center justify-center text-center text-xs text-red-600 px-3">${html}</div>`;
}

let currentProvider = null;
let mapInstance = null;

/* Kakao Map init */
async function initKakao(){
  if (!window.kakao || !window.kakao.maps){
    if (!KAKAO_JS_KEY) {
      throw new Error('Kakao: JavaScript 키가 비어 있습니다.');
    }
    // libraries 파라미터 포함, autoload=false 후 kakao.maps.load 사용
    await loadScript(`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`);
  }
  return new Promise((resolve) => {
    kakao.maps.load(() => {
      const container = document.getElementById('map');
      container.innerHTML = ''; // reset
      const center = new kakao.maps.LatLng(VENUE.lat, VENUE.lng);
      const map = new kakao.maps.Map(container, { center, level: 3 });
      const marker = new kakao.maps.Marker({ position: center, map });
      const iw = new kakao.maps.InfoWindow({ content: `<div style="padding:6px 8px;font-size:12px;">${VENUE.title}</div>` });
      iw.open(map, marker);
      mapInstance = map;
      resolve(map);
    });
  });
}

/* Naver Map init */
async function initNaver(){
  if (!window.naver || !window.naver.maps){
    if (!NAVER_CLIENT_ID) {
      throw new Error('Naver: ncpClientId가 비어 있습니다.');
    }
    // ✅ 공식 도메인(oapi) 사용
    await loadScript(`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}`);
  }
  const container = document.getElementById('map');
  container.innerHTML = ''; // reset
  const center = new naver.maps.LatLng(VENUE.lat, VENUE.lng);
  const map = new naver.maps.Map(container, { center, zoom: 16 });
  const marker = new naver.maps.Marker({ position: center, map });
  const iw = new naver.maps.InfoWindow({ content: `<div style="padding:6px 8px;font-size:12px;">${VENUE.title}</div>` });
  iw.open(map, marker);
  mapInstance = map;
  return map;
}

/* Leaflet (OpenStreetMap) 폴백: 키/허용도메인 없이 동작 */
async function initLeaflet(){
  await loadCss('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
  await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');

  // 아이콘 경로 지정(기본 아이콘이 상대경로라서 CDN 경로로 지정)
  const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25,41],
    iconAnchor: [12,41],
    popupAnchor: [1,-34],
    shadowSize: [41,41]
  });
  L.Marker.prototype.options.icon = DefaultIcon;

  const container = document.getElementById('map');
  container.innerHTML = '';
  const map = L.map(container).setView([VENUE.lat, VENUE.lng], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  L.marker([VENUE.lat, VENUE.lng]).addTo(map).bindPopup(VENUE.title).openPopup();
  mapInstance = map;
  // 안내 문구
  const note = document.createElement('div');
  note.className = 'absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-2 py-1 rounded';
  note.textContent = '임시 지도(Leaflet/OSM) — 키 인증 실패 시 표시';
  container.style.position = 'relative';
  container.appendChild(note);
  return map;
}

/* Provider 전환 + 실패 시 폴백 */
async function setMapProvider(p){
  if (p === currentProvider) return;
  currentProvider = p;

  document.getElementById('btnKakao')?.classList.toggle('is-active', p === 'kakao');
  document.getElementById('btnNaver')?.classList.toggle('is-active', p === 'naver');

  try{
    if (p === 'kakao') {
      await initKakao();
    } else {
      await initNaver();
    }
  }catch(e){
    console.error('지도를 불러오지 못했습니다:', e);
    // 에러 내용을 맵 영역에 출력
    showMapError(`
      지도 SDK 로드/인증 실패<br/>
      <span class="text-gray-500">(${String(e.message || e)})</span><br/><br/>
      <div class="text-gray-500">
        - 콘솔의 빨간 에러문구를 확인해 주세요<br/>
        - 카카오: Kakao Developers &gt; 앱 &gt; 플랫폼 &gt; 도메인에
          <b>kdy3699.github.io</b> 등록<br/>
        - 네이버: NCP &gt; Maps &gt; Web Dynamic Map 참조자(Referer)에
          <b>https://kdy3699.github.io/*</b> 등록<br/>
      </div>
    `);

    // 네이버 실패 시 → 카카오 폴백, 카카오도 실패하면 → Leaflet 폴백
    if (p === 'naver') {
      try {
        await initKakao();
        document.getElementById('btnKakao')?.classList.add('is-active');
        document.getElementById('btnNaver')?.classList.remove('is-active');
        currentProvider = 'kakao';
        return;
      } catch(_) {
        // 계속 진행하여 Leaflet 폴백
      }
    }
    try {
      await initLeaflet();
      // 탭 활성화 해제(임시 지도)
      document.getElementById('btnKakao')?.classList.remove('is-active');
      document.getElementById('btnNaver')?.classList.remove('is-active');
      currentProvider = 'leaflet';
    } catch(e2){
      console.error('Leaflet 폴백도 실패:', e2);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 초기: 카카오 → 실패시 네이버 → 실패시 Leaflet
  setMapProvider(MAP_DEFAULT_PROVIDER);

  // 탭 버튼
  document.getElementById('btnKakao')?.addEventListener('click', () => setMapProvider('kakao'));
  document.getElementById('btnNaver')?.addEventListener('click', () => setMapProvider('naver'));
});

/* ===== 스무스 스크롤 + 메뉴 ===== */
document.querySelectorAll('.emboss-btn[data-scroll]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const sel = btn.getAttribute('data-scroll');
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

/* ===== 기대돼요(좋아요) 로컬 카운트 ===== */
const likeBtn = document.getElementById('likeBtn');
const likeBtn2 = document.getElementById('likeBtn2');
const likeCount = document.getElementById('likeCount');
const likeCount2 = document.getElementById('likeCount2');
function loadLikes(){
  const n = parseInt(localStorage.getItem('likeCount')||'0',10)||0;
  likeCount.textContent = n; likeCount2.textContent = n;
}
function addLike(){
  const n = parseInt(localStorage.getItem('likeCount')||'0',10)||0;
  const next = n+1; localStorage.setItem('likeCount', String(next));
  likeCount.textContent = next; likeCount2.textContent = next;
}
[likeBtn, likeBtn2].forEach(b => b && b.addEventListener('click', addLike));
loadLikes();

/* ===== 참석하기 버튼 → 설문 모달 ===== */
const ctaAttend = document.getElementById('ctaAttend');
const ctaAttend2 = document.getElementById('ctaAttend2');
[ctaAttend, ctaAttend2].forEach(b => b && b.addEventListener('click', openSurvey));
function openSurvey(){ document.getElementById('surveyModal')?.classList.remove('hidden'); }
function closeSurvey(){ document.getElementById('surveyModal')?.classList.add('hidden'); }
window.closeSurvey = closeSurvey; window.openSurvey = openSurvey;

/* ===== 개요 더보기 ===== */
const synopsis = document.getElementById('synopsis');
const moreBtn = document.getElementById('moreBtn');
if (moreBtn && synopsis){
  let expanded = false;
  moreBtn.addEventListener('click', ()=>{
    expanded = !expanded;
    synopsis.classList.toggle('line-clamp-3', !expanded);
    moreBtn.textContent = expanded ? '접기' : '더보기';
  });
}

/* ===== 주소 복사 / 계좌 복사 / 토스트 ===== */
function showToast(message) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = message;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}
async function copyText(text){
  if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
  else {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.top='-1000px';
    document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
  }
}
document.getElementById('copyVenue')?.addEventListener('click', async ()=>{
  const txt = document.getElementById('venueText')?.textContent?.trim() || '';
  try { await copyText(txt); showToast('장소가 복사되었습니다'); } catch(e){ showToast('복사에 실패했습니다'); }
});
document.addEventListener('click', async (e)=>{
  const a = e.target.closest('a.copy-link');
  if (!a) return;
  e.preventDefault();
  const text = a.getAttribute('href') || '';
  try { await copyText(text); showToast('계좌가 복사되었습니다'); } catch(e){ showToast('복사에 실패했습니다'); }
});

/* ===== 라이트박스 ===== */
document.addEventListener('DOMContentLoaded', initGallery);
function initGallery(){
  const container = document.getElementById('gallery');
  const lightbox  = document.getElementById('lightbox');
  if (!container || !lightbox) return;

  const items = Array.from(container.querySelectorAll('.gallery-item'));
  const imgs  = items.map(a => a.getAttribute('href') || a.querySelector('img')?.src).filter(Boolean);

  const lbImg    = lightbox.querySelector('img');
  const btnClose = lightbox.querySelector('.close');
  const btnNext  = lightbox.querySelector('.next');
  const btnPrev  = lightbox.querySelector('.prev');
  const lbCounter= document.getElementById('lbCounter') || lightbox.querySelector('.counter');
  let idx = 0, wheelLock = false;

  const prevent = (e) => { e.preventDefault(); };
  function updateCounter(){ if (lbCounter) lbCounter.textContent = (idx + 1) + ' / ' + imgs.length; }
  function setImageTo3xOfThumb(i){
    const thumb = items[i].querySelector('img'); if (!thumb) return;
    const rect = thumb.getBoundingClientRect();
    const desiredW = Math.round((rect.width || 0) * 3);
    lbImg.style.width = desiredW ? desiredW + 'px' : '';
  }
  function bindNoZoom(){
    document.addEventListener('gesturestart', prevent, { passive:false });
    document.addEventListener('gesturechange', prevent, { passive:false });
    document.addEventListener('gestureend', prevent, { passive:false });
    lightbox.addEventListener('dblclick', prevent, { passive:false });
    lightbox.addEventListener('wheel', prevent, { passive:false });
    lbImg.addEventListener('contextmenu', prevent);
    lbImg.addEventListener('dragstart', prevent);
  }
  function unbindNoZoom(){
    document.removeEventListener('gesturestart', prevent);
    document.removeEventListener('gesturechange', prevent);
    document.removeEventListener('gestureend', prevent);
    lightbox.removeEventListener('dblclick', prevent);
    lightbox.removeEventListener('wheel', prevent);
    lbImg.removeEventListener('contextmenu', prevent);
    lbImg.removeEventListener('dragstart', prevent);
  }
  function open(i){
    idx = i; lbImg.src = imgs[idx]; setImageTo3xOfThumb(idx); updateCounter();
    lightbox.classList.add('show'); lightbox.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    bindNoZoom();
  }
  function close(){
    lightbox.classList.remove('show'); lightbox.setAttribute('aria-hidden','true'); document.body.style.overflow='';
    unbindNoZoom();
  }
  function next(){ idx = (idx + 1) % imgs.length; lbImg.src = imgs[idx]; setImageTo3xOfThumb(idx); updateCounter(); }
  function prev(){ idx = (idx - 1 + imgs.length) % imgs.length; lbImg.src = imgs[idx]; setImageTo3xOfThumb(idx); updateCounter(); }

  items.forEach((a,i) => a.addEventListener('click', (e)=>{ e.preventDefault(); open(i); }));
  btnClose.addEventListener('click', close);
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e)=> {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });
  lightbox.addEventListener('wheel', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (wheelLock) return; wheelLock = true;
    const dir = (Math.abs(e.deltaX) > Math.abs(e.deltaY)) ? e.deltaX : e.deltaY;
    if (dir > 0) next(); else if (dir < 0) prev();
    setTimeout(() => { wheelLock = false; }, 350);
  }, { passive:false });

  window.addEventListener('resize', () => {
    if (!lightbox.classList.contains('show')) return;
    setImageTo3xOfThumb(idx);
  });
}

/* ===== D-DAY 문구 렌더 (달력은 이미지) ===== */
(function(){
  const EVENT = new Date('2025-12-27T13:00:00+09:00'); // 2025.12.27 13:00 KST
  const line = document.getElementById('ddayLine');
  if (!line) return;
  function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
  function dayDiff(a,b){ return Math.round((startOfDay(a) - startOfDay(b)) / 86400000); }
  const now = new Date();
  const diff = dayDiff(EVENT, now);
  let label = diff > 0 ? `D-${diff}` : diff === 0 ? 'D-DAY' : `D+${Math.abs(diff)}`;
  line.innerHTML = `김도엽 ❤️ 나두리의 결혼식 &nbsp; <strong>${label}</strong> &nbsp; 2025.12.27(토) 13:00 &nbsp; 삼성전자 서초사옥 5F`;
})();

/* ===== 설문(iframe 제출 OK) ===== */
(function iframeSubmitHandler() {
  const form   = document.getElementById('surveyForm');
  const iframe = document.getElementById('survey_iframe');
  const msg    = document.getElementById('surveyMsg');
  if (!form || !iframe) return;

  // 메타 채우기
  const src = form.querySelector('input[name="source_path"]');
  const tm  = form.querySelector('input[name="client_time"]');
  if (src) src.value = location.origin + location.pathname;
  if (tm)  tm.value  = new Date().toISOString();

  // 스텝퍼
  function clampToMin1(n){ n = parseInt(n,10); return (!Number.isFinite(n) || n < 1) ? 1 : n; }
  const personInput = document.getElementById('personInput');
  form.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.getAttribute('data-action');
      let v = clampToMin1(personInput.value);
      if (act === 'increment') v += 1;
      if (act === 'decrement') v = Math.max(1, v - 1);
      personInput.value = v;
    });
  });
  personInput.addEventListener('input', ()=>{ personInput.value = clampToMin1(personInput.value); });

  let submitted = false;
  form.addEventListener('submit', (e) => {
    const name  = form.name?.value?.trim();
    const hp    = form._hp?.value || '';
    if (!name) { e.preventDefault(); alert('이름을 입력해주세요.'); form.name?.focus(); return; }
    personInput.value = clampToMin1(personInput.value);
    if (hp) { e.preventDefault(); alert('제출 완료되었습니다.'); form.reset(); personInput.value = 1; return; }
    submitted = true;
  });
  iframe.addEventListener('load', () => {
    if (!submitted) return; submitted = false;
    msg.classList.remove('hidden'); msg.textContent = '제출 완료되었습니다.';
    form.reset(); if (personInput) personInput.value = 1;
    if (src) src.value = location.origin + location.pathname;
    if (tm)  tm.value  = new Date().toISOString();
    // setTimeout(closeSurvey, 1200);
  });
})();


