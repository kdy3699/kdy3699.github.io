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

/* ===== 스무스 스크롤 + 메뉴 ===== */
document.querySelectorAll('.emboss-btn[data-scroll]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const sel = btn.getAttribute('data-scroll');
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

/* ===== 참석 인원 실시간 집계(=스프레드시트 person 합계) ===== */
const likeBtn      = document.getElementById('likeBtn');
const likeBtn2     = document.getElementById('likeBtn2');
const likeCount    = document.getElementById('likeCount');
const likeCount2   = document.getElementById('likeCount2');
const SURVEY_API   = "https://script.google.com/macros/s/AKfycbyT_VfoiSiIoLyQKnD8-LS8geiKjrVzcOxckrFTkLthkocnWfu4ZxTpgQja_r9xC04o/exec"; // ← 본인 Web App URL

function renderHeadcount(n){
  const v = Number.isFinite(n) ? n : 0;
  if (likeCount)  likeCount.textContent  = v;
  if (likeCount2) likeCount2.textContent = v;
}
// JSONP 유틸 (CORS 우회)
function jsonp(url, params, cb, timeoutMs=8000){
  const cbName = `__jsonp_cb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  const q = new URLSearchParams(params || {});
  q.set('callback', cbName);
  const s = document.createElement('script');
  s.src = `${url}?${q.toString()}`;
  s.async = true;
  let done = false;
  const cleanup = () => { if (done) return; done = true; try{ delete window[cbName]; }catch{} s.remove(); };
  const timer = setTimeout(() => { if (done) return; cleanup(); cb && cb(new Error('JSONP timeout')); }, timeoutMs);
  window[cbName] = (data) => { if (done) return; clearTimeout(timer); try{ cb && cb(null, data); } finally { cleanup(); } };
  s.onerror = () => { if (done) return; clearTimeout(timer); try{ cb && cb(new Error('JSONP load error')); } finally { cleanup(); } };
  document.body.appendChild(s);
}
function fetchHeadcount(){
  if (likeCount)  likeCount.textContent  = "…";
  if (likeCount2) likeCount2.textContent = "…";
  jsonp(SURVEY_API, { action:'getTotal' }, (err, data)=>{
    if (err || !data || data.ok !== true){
      console.warn('getTotal failed', err || data);
      renderTotal(0);
      return;
    }
    renderTotal(Number(data.total) || 0);
  });
}
// 클릭으로 숫자 증가하지 않도록(옵션: 설문 열기)
[likeBtn, likeBtn2].forEach(b => b && b.addEventListener('click', openSurvey));
+// 페이지 처음 접속했을 때 1회 조회
+document.addEventListener('DOMContentLoaded', fetchHeadcount);

/* ===== 참석하기 버튼 → 설문 모달 ===== */
const ctaAttend = document.getElementById('ctaAttend');
const ctaAttend2 = document.getElementById('ctaAttend2');
[ctaAttend, ctaAttend2].forEach(b => b && b.addEventListener('click', openSurvey));
function openSurvey(){ document.getElementById('surveyModal')?.classList.remove('hidden'); }
function closeSurvey(){ document.getElementById('surveyModal')?.classList.add('hidden'); }
window.closeSurvey = closeSurvey; window.openSurvey = openSurvey;

/* ===== In-app browser (Kakao 등) 감지 ===== */
function isInAppKakao(){
  const ua = (navigator.userAgent || '').toUpperCase();
  return ua.includes('KAKAOTALK') || ua.includes('KAKAOWEBVIEW') || ua.includes('KAKAO');
}

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
    // 공통 버튼 비활성화 + 토스트
    submitBtn?.setAttribute('disabled','disabled');
    submitBtn?.classList.add('opacity-60','pointer-events-none');
    if (submitBtn) submitBtn.textContent = '전송 중…';
    try { showToast('제출 중입니다…'); } catch(e){}

    // 카카오 인앱 브라우저에서는 JSONP로 직접 기록 (iframe POST 회피)
    if (isInAppKakao()){
      e.preventDefault();
      const payload = {
        action: 'add',
        name: name,
        phone: form.phone?.value?.trim() || '',
        eat: form.eat?.value || '',
        bus: form.bus?.value || '',
        person: clampToMin1(form.person?.value),
        source_path: location.origin + location.pathname,
        client_time: new Date().toISOString(),
        ua: navigator.userAgent || '',
        ref: document.referrer || ''
      };
      jsonp(SURVEY_API, payload, (err, data)=>{
        if (err || !data || data.ok !== true){
          console.warn('jsonp submit failed', err || data);
          showToast('전송 실패, 다시 시도해주세요');
        } else {
          showToast('제출이 완료되었습니다. 감사합니다!');
          form.reset(); personInput.value = 1;
          // 설문 종료 후 1회만 조회
          fetchHeadcount();
        }
        // UI 복원 및 모달 닫기
        submitBtn?.removeAttribute('disabled');
        submitBtn?.classList.remove('opacity-60','pointer-events-none');
        if (submitBtn) submitBtn.textContent = '제출하기';
        closeSurvey();
      });
      return;
    }

    // 일반 브라우저: 기존대로 iframe POST
    submitted = true;
    setTimeout(closeSurvey, 0);
  });
  iframe.addEventListener('load', () => {
    if (!submitted) return; submitted = false;
    // 완료 토스트만 표시 (모달은 이미 닫힘)
    try { showToast('제출이 완료되었습니다. 감사합니다!'); } catch(e){}
    msg?.classList.add('hidden');    form.reset(); if (personInput) personInput.value = 1;
    if (src) src.value = location.origin + location.pathname;
    if (tm)  tm.value  = new Date().toISOString();
    // 버튼 상태 복원
    if (submitBtn){
      submitBtn.removeAttribute('disabled');
      submitBtn.classList.remove('opacity-60','pointer-events-none');
      submitBtn.textContent = '제출하기';
    }
    // 설문 종료 후 1회만 조회
    fetchHeadcount();
  });
})();


