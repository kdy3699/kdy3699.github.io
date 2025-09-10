/* 스크롤 이동 */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* 혼주 연락처 토글 */
function toggleFoldable() {
  const box = document.querySelector('.foldable-content');
  const icon = document.getElementById('toggleIcon');
  if (!box) return;
  const showing = box.classList.toggle('show');
  icon && (icon.textContent = showing ? '▲' : '▼');
}
function toggleFoldable2() {
  const box = document.querySelector('.foldable-content2');
  const icon = document.getElementById('toggleIcon2');
  if (!box) return;
  const showing = box.classList.toggle('show');
  icon && (icon.textContent = showing ? '▲' : '▼');
}

/* 설문 모달 열기/닫기 */
function openSurvey() {
  const modal = document.getElementById('surveyModal');
  if (modal) modal.classList.remove('hidden');
}
function closeSurvey() {
  const modal = document.getElementById('surveyModal');
  if (modal) modal.classList.add('hidden');
}

/* 페이지 진입 시 자동 팝업 */
window.addEventListener('load', () => {
  // 세션당 1회만 열고 싶으면 아래 2줄 주석 해제
  // if (sessionStorage.getItem('surveyShown') === '1') return;
  openSurvey();
  // sessionStorage.setItem('surveyShown', '1');

  // 메타 채우기
  const form = document.getElementById('surveyForm');
  if (form) {
    const src = form.querySelector('input[name="source_path"]');
    const tm  = form.querySelector('input[name="client_time"]');
    if (src) src.value = location.origin + location.pathname;
    if (tm)  tm.value  = new Date().toISOString();
  }

  // 스텝퍼 세팅
  initStepper();
});

/* ===== 동행인원 스텝퍼 로직 ===== */
function clampToMin1(n) {
  n = parseInt(n, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}
function initStepper() {
  const input = document.getElementById('personInput');
  const form  = document.getElementById('surveyForm');
  if (!input || !form) return;

  // 입력 강제 보정
  input.value = clampToMin1(input.value);

  // 버튼 클릭
  form.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      let v = clampToMin1(input.value);
      if (action === 'increment') v += 1;
      if (action === 'decrement') v = Math.max(1, v - 1);
      input.value = v;
    });
  });

  // 직접 타이핑 시도 시에도 1 미만 방지
  input.addEventListener('input', () => {
    input.value = clampToMin1(input.value);
  });
}

/* iframe 제출 완료 시 메시지 표시 */
(function iframeSubmitHandler() {
  const form   = document.getElementById('surveyForm');
  const iframe = document.getElementById('survey_iframe');
  const msg    = document.getElementById('surveyMsg');

  if (!form || !iframe) return;

  let submitted = false;

  form.addEventListener('submit', (e) => {
    // 필수값 & 허니팟
    const name  = form.name?.value?.trim();
    const hp    = form._hp?.value || '';
    const personInput = document.getElementById('personInput');
    const personVal   = clampToMin1(personInput?.value || 1);

    if (!name) {
      e.preventDefault();
      alert('이름을 입력해주세요.');
      form.name?.focus();
      return;
    }
    // 동행인원 1 이상 강제
    if (personInput) personInput.value = personVal;

    if (hp) {
      e.preventDefault();
      alert('제출 완료되었습니다.');
      form.reset();
      // 스텝퍼 값 복구
      if (personInput) personInput.value = 1;
      return;
    }
    submitted = true;
  });

  iframe.addEventListener('load', () => {
    if (!submitted) return; // 첫 로드 무시
    submitted = false;

    // 성공 메시지 노출
    if (msg) {
      msg.classList.remove('hidden');
      msg.textContent = '제출 완료되었습니다.';
    }

    // 폼 리셋 및 스텝퍼/메타 갱신
    form.reset();
    const personInput = document.getElementById('personInput');
    if (personInput) personInput.value = 1;

    const src = form.querySelector('input[name="source_path"]');
    const tm  = form.querySelector('input[name="client_time"]');
    if (src) src.value = location.origin + location.pathname;
    if (tm)  tm.value  = new Date().toISOString();

    // 자동 닫기 원하면:
    // setTimeout(closeSurvey, 1200);
  });
})();

/* ===== 갤러리: masonry + 라이트박스 ===== */
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
  let idx = 0;
  let wheelLock = false; // 휠 내비 과실입력 방지
  // 라이트박스에서 핀치/더블탭 확대 금지용 핸들러
  const prevent = (e) => { e.preventDefault(); };

  function setImageTo3xOfThumb(i){
    // 썸네일 실제 렌더 크기 측정 → 3배로 요청
    const thumb = items[i].querySelector('img');
    if (!thumb) return;
    const rect = thumb.getBoundingClientRect();
    const desiredW = Math.round((rect.width || 0) * 3);
    // 뷰포트 한계 내에서만 적용
    lbImg.style.width = desiredW ? desiredW + 'px' : '';
    // 높이는 비율 맞춰 자동, CSS max-*로 상한 제한
  }

  function bindNoZoom(){
    // 모바일 Safari 핀치줌 방지
    document.addEventListener('gesturestart', prevent, { passive:false });
    document.addEventListener('gesturechange', prevent, { passive:false });
    document.addEventListener('gestureend', prevent, { passive:false });
    // 라이트박스 내부 더블클릭 확대 방지
    lightbox.addEventListener('dblclick', prevent, { passive:false });
    // 휠 스크롤을 페이지로 전달하지 않음(내비에 사용)
    lightbox.addEventListener('wheel', prevent, { passive:false });
    // 이미지 우클릭/드래그 방지(임의 확대 방지 보조)
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
    idx = i;
    lbImg.src = imgs[idx];
    setImageTo3xOfThumb(idx);
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    bindNoZoom();
  }
  function close(){
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    unbindNoZoom();
  }
  function next(){ idx = (idx + 1) % imgs.length; lbImg.src = imgs[idx]; }
  function prev(){ idx = (idx - 1 + imgs.length) % imgs.length; lbImg.src = imgs[idx]; }

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
  
  // 스크롤(휠)로 다음/이전 이동
  lightbox.addEventListener('wheel', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (wheelLock) return;
    wheelLock = true;
    const dir = (Math.abs(e.deltaX) > Math.abs(e.deltaY)) ? e.deltaX : e.deltaY;
    if (dir > 0) next(); else if (dir < 0) prev();
    setTimeout(() => { wheelLock = false; }, 350); // 스크롤 연속 입력 완충
  }, { passive:false });

  // 창 크기 바뀌면 현재 이미지도 3배 규칙으로 재계산
  window.addEventListener('resize', () => {
    if (!lightbox.classList.contains('show')) return;
    setImageTo3xOfThumb(idx);
  });
}
