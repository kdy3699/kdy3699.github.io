/* ====== 설정 ====== */
const SURVEY_API = "https://script.google.com/macros/s/AKfycbzAl77U20vY9S6yizY6Jo2CIBQi6hhoNOG4Q4uJsOCzdQu5ZvZXqqrFfp8FLwjeYZKW/exec"; // 현재 웹앱 URL

/* ===== 유틸 ===== */
function showToast(message) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t);
  }
  t.textContent = message; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600);
}
async function copyText(text){
  if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
  else {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position='fixed'; ta.style.top='-1000px';
    document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
  }
}
function isInAppKakao(){
  const ua = (navigator.userAgent || '').toUpperCase();
  return ua.includes('KAKAOTALK') || ua.includes('KAKAOWEBVIEW') || ua.includes('KAKAO');
}
function jsonp(url, params, cb){
  const cbName = `__jsonp_cb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  const q = new URLSearchParams(params || {});
  q.set('callback', cbName);
  q.set('_ts', Date.now().toString());
  const s = document.createElement('script');
  s.src = `${url}?${q.toString()}`;
  s.async = true;
  const cleanup = () => { try{ delete window[cbName]; }catch{} s.remove(); };
  window[cbName] = (data) => { try{ cb && cb(null, data); } finally { cleanup(); } };
  s.onerror = () => { try{ cb && cb(new Error('JSONP load error')); } finally { cleanup(); } };
  document.body.appendChild(s);
}

/* ===== Nav 고정 높이 보정 ===== */
function setNavSpacer(){
  const nav = document.getElementById('topNav');
  const sp  = document.getElementById('navSpacer');
  if (!nav || !sp) return;
  const h = Math.ceil(nav.getBoundingClientRect().height);
  sp.style.height = h + 'px';
}
window.addEventListener('resize', setNavSpacer, { passive:true });
window.addEventListener('orientationchange', setNavSpacer);
document.addEventListener('DOMContentLoaded', setNavSpacer);

/* ===== 스무스 스크롤 ===== */
document.querySelectorAll('.emboss-btn[data-scroll]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const sel = btn.getAttribute('data-scroll');
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

/* ===== Like 카운트: K1 읽기 ===== */
const likeBtn   = document.getElementById('likeBtn');
const likeBtn2  = document.getElementById('likeBtn2');
const likeCount = document.getElementById('likeCount');
const likeCount2= document.getElementById('likeCount2');

function renderTotal(n){
  const v = Number.isFinite(+n) ? +n : 0;
  if (likeCount)  likeCount.textContent  = v;
  if (likeCount2) likeCount2.textContent = v;
}
function fetchTotal(){
  // K1 값 읽기
  if (likeCount)  likeCount.textContent  = '…';
  if (likeCount2) likeCount2.textContent = '…';
  jsonp(SURVEY_API, { action:'getTotal' }, (err, data)=>{
    if (err || !data || data.ok !== true){ console.warn('getTotal failed', err||data); renderTotal(0); return; }
    renderTotal(data.total || 0);
  });
}
// 버튼은 설문 모달 열기만
[likeBtn, likeBtn2].forEach(b => b && b.addEventListener('click', openSurvey));
// 페이지 진입 시 1회 조회
document.addEventListener('DOMContentLoaded', fetchTotal);

/* ===== 참석하기 버튼 ===== */
const ctaAttend  = document.getElementById('ctaAttend');
const ctaAttend2 = document.getElementById('ctaAttend2');
[ctaAttend, ctaAttend2].forEach(b => b && b.addEventListener('click', openSurvey));
function openSurvey(){ document.getElementById('surveyModal')?.classList.remove('hidden'); }
function closeSurvey(){ document.getElementById('surveyModal')?.classList.add('hidden'); }
window.openSurvey = openSurvey; window.closeSurvey = closeSurvey;

/* ===== 개요 더보기 ===== */
const synopsis = document.getElementById('synopsis');
const moreBtn  = document.getElementById('moreBtn');
if (moreBtn && synopsis){
  let expanded = false;
  moreBtn.addEventListener('click', ()=>{
    expanded = !expanded;
    synopsis.classList.toggle('line-clamp-5', !expanded);
    moreBtn.textContent = expanded ? '접기' : '더보기';
  });
}

/* ===== 주소/계좌 복사 ===== */
document.getElementById('copyVenue')?.addEventListener('click', async ()=>{
  const txt = document.getElementById('venueText')?.textContent?.trim() || '';
  try { await copyText(txt); showToast('장소가 복사되었습니다'); } catch(e){ showToast('복사 실패'); }
});
document.addEventListener('click', async (e)=>{
  const a = e.target.closest('a.copy-link'); if (!a) return;
  e.preventDefault(); const text = a.getAttribute('href') || '';
  try { await copyText(text); showToast('계좌가 복사되었습니다'); } catch(e){ showToast('복사 실패'); }
});

/* ===== 라이트박스 ===== */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('gallery');
  const lightbox  = document.getElementById('lightbox');
  if (!container || !lightbox) return;
  const items = Array.from(container.querySelectorAll('.gallery-item'));
  const imgs  = items.map(a => a.getAttribute('href') || a.querySelector('img')?.src).filter(Boolean);
  const lbImg= lightbox.querySelector('img'), btnClose=lightbox.querySelector('.close');
  const btnNext=lightbox.querySelector('.next'), btnPrev=lightbox.querySelector('.prev');
  const lbCounter= document.getElementById('lbCounter') || lightbox.querySelector('.counter');
  let idx = 0;
  function updateCounter(){ if (lbCounter) lbCounter.textContent = (idx+1)+' / '+imgs.length; }
  function open(i){ idx=i; lbImg.src=imgs[idx]; updateCounter(); lightbox.classList.add('show'); document.body.style.overflow='hidden'; }
  function close(){ lightbox.classList.remove('show'); document.body.style.overflow=''; }
  function next(){ idx=(idx+1)%imgs.length; lbImg.src=imgs[idx]; updateCounter(); }
  function prev(){ idx=(idx-1+imgs.length)%imgs.length; lbImg.src=imgs[idx]; updateCounter(); }
  items.forEach((a,i)=> a.addEventListener('click',(e)=>{ e.preventDefault(); open(i); }));
  btnClose.addEventListener('click', close); btnNext.addEventListener('click', next); btnPrev.addEventListener('click', prev);
  lightbox.addEventListener('click',(e)=>{ if (e.target===lightbox) close(); });
  document.addEventListener('keydown',(e)=>{ if(!lightbox.classList.contains('show')) return;
    if(e.key==='Escape') close(); if(e.key==='ArrowRight') next(); if(e.key==='ArrowLeft') prev(); });
});

/* ===== D-DAY 렌더 ===== */
(function(){
  const EVENT = new Date('2025-12-27T13:00:00+09:00');
  const line = document.getElementById('ddayLine'); if (!line) return;
  function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
  function dayDiff(a,b){ return Math.round((startOfDay(a)-startOfDay(b))/86400000); }
  const diff = dayDiff(EVENT, new Date());
  let label = diff > 0 ? `D-${diff}` : diff === 0 ? 'D-DAY' : `D+${Math.abs(diff)}`;
  line.innerHTML = `김도엽 ❤️ 나두리의 결혼식 &nbsp; <strong>${label}</strong> &nbsp; 2025.12.27(토) 13:00 &nbsp; 삼성전자 서초사옥 5F`;
})();

/* ===== 설문 제출: 페이지 진입/종료 시 K1 읽기 ===== */
(function surveyHandler() {
  const form   = document.getElementById('surveyForm');
  const iframe = document.getElementById('survey_iframe');
  const msg    = document.getElementById('surveyMsg');
  const submitBtn = document.getElementById('surveySubmitBtn');

  if (!form || !iframe) return;

  // 메타
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
    if (hp) { e.preventDefault(); alert('제출 완료되었습니다.'); form.reset(); personInput.value = 1; fetchTotal(); return; }

    // 버튼 상태
    submitBtn?.setAttribute('disabled','disabled');
    submitBtn?.classList.add('opacity-60','pointer-events-none');
    if (submitBtn) submitBtn.textContent = '전송 중…';
    try { showToast('제출 중입니다…'); } catch(e){}

    if (isInAppKakao()){
      // Kakao 인앱: JSONP로 직접 기록
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
        submitBtn?.removeAttribute('disabled');
        submitBtn?.classList.remove('opacity-60','pointer-events-none');
        if (submitBtn) submitBtn.textContent = '제출하기';
        if (err || !data || data.ok !== true){
          console.warn('jsonp submit failed', err || data);
          showToast('전송 실패, 다시 시도해주세요');
        }else{
          showToast('제출이 완료되었습니다. 감사합니다!');
          form.reset(); if (personInput) personInput.value = 1;
          fetchTotal(); // 설문 종료 후 K1 1회 조회
          msg?.classList.add('hidden');
          closeSurvey();
        }
      });
      return;
    }

    // 일반 브라우저: iframe POST
    submitted = true;
    setTimeout(closeSurvey, 0);
  });

  iframe.addEventListener('load', () => {
    if (!submitted) return; submitted = false;
    try { showToast('제출이 완료되었습니다. 감사합니다!'); } catch(e){}
    msg?.classList.add('hidden');
    form.reset(); if (personInput) personInput.value = 1;
    if (src) src.value = location.origin + location.pathname;
    if (tm)  tm.value  = new Date().toISOString();
    if (submitBtn){
      submitBtn.removeAttribute('disabled');
      submitBtn.classList.remove('opacity-60','pointer-events-none');
      submitBtn.textContent = '제출하기';
    }
    fetchTotal(); // 설문 종료 후 K1 1회 조회
  });
})();
