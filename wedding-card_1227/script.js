/* ===== 스무스 스크롤 + 메뉴 ===== */
document.querySelectorAll('.emboss-btn[data-scroll]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const sel = btn.getAttribute('data-scroll');
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

/* ===== 참석 인원: 스프레드시트 K1 값 표시 ===== */
const likeBtn   = document.getElementById('likeBtn');
const likeBtn2  = document.getElementById('likeBtn2');
const likeCount = document.getElementById('likeCount');
const likeCount2= document.getElementById('likeCount2');
// Apps Script 웹앱 URL (index.html의 form action과 동일하게 맞추세요)
const SURVEY_API = 'https://script.google.com/macros/s/AKfycbzjk3viHditZWZoKHI4qfJHkB5435N4tqBf-fp_1y7ihBfPpuxvHNJVKMqC6fzQ8e_H/exec';

function renderK1(n){
  const v = Number.isFinite(n) ? n : 0;
  if (likeCount)  likeCount.textContent  = v;
  if (likeCount2) likeCount2.textContent = v;
}
// JSONP 유틸 (CORS 회피)
function jsonp(url, params, cb, timeoutMs=8000){
  const cbName = `__jsonp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  const q = new URLSearchParams(params || {});
  q.set('callback', cbName);
  const s = document.createElement('script');
  s.src = `${url}?${q.toString()}`; s.async = true;
  let done=false;
  const cleanup=()=>{ if(done) return; done=true; try{ delete window[cbName]; }catch{} s.remove(); };
  const timer = setTimeout(()=>{ if(done) return; cleanup(); cb && cb(new Error('jsonp timeout')); }, timeoutMs);
  window[cbName] = (data)=>{ if(done) return; clearTimeout(timer); try{ cb && cb(null,data);} finally{ cleanup(); } };
  s.onerror = ()=>{ if(done) return; clearTimeout(timer); try{ cb && cb(new Error('jsonp error')); } finally{ cleanup(); } };
  document.body.appendChild(s);
}
function fetchK1(){
  if (likeCount)  likeCount.textContent  = '…';
  if (likeCount2) likeCount2.textContent = '…';
  jsonp(SURVEY_API, { action:'getTotal', _ts: Date.now() }, (err, data)=>{
    if (err || !data || data.ok !== true){ console.warn('getTotal failed', err || data); renderK1(0); return; }
    renderK1(Number(data.total) || 0);
  });
}
// 하트 버튼 클릭 시 증가 대신 설문 열기(선택)
[likeBtn, likeBtn2].forEach(b => b && b.addEventListener('click', openSurvey));
// 페이지 진입 시 1회 조회
document.addEventListener('DOMContentLoaded', fetchK1);

/* ===== 참석하기 버튼 → 설문 모달 ===== */
const ctaAttend = document.getElementById('ctaAttend');
const ctaAttend2 = document.getElementById('ctaAttend2');
[ctaAttend, ctaAttend2].forEach(b => b && b.addEventListener('click', openSurvey));
function openSurvey(){ document.getElementById('surveyModal')?.classList.remove('hidden'); }
function closeSurvey(){ document.getElementById('surveyModal')?.classList.add('hidden'); }
window.closeSurvey = closeSurvey; window.openSurvey = openSurvey;

/* ===== 페이지 진입 시 자동 팝업 ===== */
document.addEventListener('DOMContentLoaded', () => {
  try { openSurvey(); } catch(e){}
});

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
  const submitBtn = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', (e) => {
    const name  = form.name?.value?.trim();
    const hp    = form._hp?.value || '';
    if (!name) { e.preventDefault(); alert('이름을 입력해주세요.'); form.name?.focus(); return; }
    personInput.value = clampToMin1(personInput.value);
    if (hp) { e.preventDefault(); alert('제출 완료되었습니다.'); form.reset(); personInput.value = 1; return; }
    // 실제 제출: 딜레이 없이 모달을 즉시 닫고 전송 진행
    submitted = true;
    submitBtn?.setAttribute('disabled','disabled');
    submitBtn?.classList.add('opacity-60','pointer-events-none');
    if (submitBtn) submitBtn.textContent = '전송 중…';
    try { showToast('제출 중입니다…'); } catch(e){}
    // iframe으로 POST는 계속 진행되며, 모달만 바로 닫음
    setTimeout(closeSurvey, 0);
  });
  iframe.addEventListener('load', () => {
    if (!submitted) return; submitted = false;
    // 완료 토스트만 표시 (모달은 이미 닫힘)
    try { showToast('제출이 완료되었습니다. 감사합니다!'); } catch(e){}
    msg?.classList.add('hidden');    form.reset(); if (personInput) personInput.value = 1;
    if (src) src.value = location.origin + location.pathname;
    if (tm)  tm.value  = new Date().toISOString();
    // setTimeout(closeSurvey, 1200);
    // 버튼 상태 복원
    if (submitBtn){
      submitBtn.removeAttribute('disabled');
      submitBtn.classList.remove('opacity-60','pointer-events-none');
      submitBtn.textContent = '제출하기';
    }
    // 설문 종료 후 K1 재조회
    fetchK1();
  });
})();

/* ===== 배경음악: 기본 재생 시도 ===== */
(function bgmInit(){
  const audio = document.getElementById('bgm');
  const btn   = document.getElementById('bgmToggle');
  if (!audio || !btn) return;

  function updateUI(playing){
    btn.classList.toggle('on', !!playing);
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    const ic = btn.querySelector('.icon');
    if (ic) ic.textContent = playing ? '🔊' : '🔈';
  }
  async function play(){
    try{ await audio.play(); localStorage.setItem('bgm_on','1'); updateUI(true); return true; }
    catch(e){ /* iOS 등 사용자 제스처 필요 */ return false; }
    async function play(){
    try{
      // iOS 정책 회피는 불가하지만 먼저 시도
      audio.muted = false;
      await audio.play();
      localStorage.setItem('bgm_on','1');
      updateUI(true);
      return true;
    }catch(e){
      // 자동재생 차단됨
      updateUI(false);
      return false;
    }
  }
  function pause(){
    try{ audio.pause(); }catch(e){}
    localStorage.setItem('bgm_on','0'); updateUI(false);
  }
  // 버튼 토글
  btn.addEventListener('click', async ()=>{
    if (audio.paused) await play(); else pause();
  });
  // 기본값 = 재생 의향 있음(로컬 스토리지에 값 없으면 true)
  const pref = localStorage.getItem('bgm_on');
  const want = (pref === null) ? true : pref === '1';
  // 초기 UI
  updateUI(false);
  // 즉시 자동재생 시도
  (async ()=>{
    if (!want) return;                 // 사용자가 이전에 끔
    const ok = await play();           // 자동재생 시도
    if (ok) return;
    // 차단된 경우: 첫 사용자 제스처에서 재생
    const unlock = async ()=>{
      await play();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('scroll', unlock, true);
    };
    window.addEventListener('pointerdown', unlock, { once:true, passive:true });
    window.addEventListener('touchstart', unlock, { once:true, passive:true });
    window.addEventListener('keydown', unlock, { once:true });
    window.addEventListener('scroll', unlock, { once:true, passive:true, capture:true });
  })();
  // 탭 전환 시 살짝 배려 (숨겨지면 일시정지)
  document.addEventListener('visibilitychange', ()=>{
    if (document.hidden) pause();
  });
})();

/* ===== 고정 내비 높이 측정 → 컨텐츠 간격 확보 ===== */
function setNavSpacer(){
  const nav = document.getElementById('topNav');
  const sp  = document.getElementById('navSpacer');
  if (!nav || !sp) return;
  const h = Math.ceil(nav.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--nav-h', h + 'px');
  sp.style.height = `calc(${h}px + env(safe-area-inset-top, 0px))`;
}
window.addEventListener('resize', setNavSpacer, { passive:true });
window.addEventListener('orientationchange', setNavSpacer);
document.addEventListener('DOMContentLoaded', setNavSpacer);

