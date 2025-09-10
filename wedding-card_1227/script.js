/* 스크롤 이동 */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* 혼주 연락처 토글 (간단 구현) */
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
  // 필요 시 중복 방지: 세션당 1회만 열고 싶으면 아래 주석 해제
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
});

/* iframe 제출 완료 시 메시지 표시 */
(function iframeSubmitHandler() {
  const form   = document.getElementById('surveyForm');
  const iframe = document.getElementById('survey_iframe');
  const msg    = document.getElementById('surveyMsg');

  if (!form || !iframe) return;

  let submitted = false;

  form.addEventListener('submit', (e) => {
    // 간단 유효성 검사 및 허니팟
    const name = form.name?.value?.trim();
    const hp   = form._hp?.value || '';
    if (!name) {
      e.preventDefault();
      alert('이름을 입력해주세요.');
      form.name?.focus();
      return;
    }
    if (hp) {
      e.preventDefault();
      alert('제출 완료되었습니다.');
      form.reset();
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

    // 폼 리셋 및 메타 갱신
    form.reset();
    const src = form.querySelector('input[name="source_path"]');
    const tm  = form.querySelector('input[name="client_time"]');
    if (src) src.value = location.origin + location.pathname;
    if (tm)  tm.value  = new Date().toISOString();

    // 원하면 자동 닫기 (예: 1.2초 뒤)
    // setTimeout(closeSurvey, 1200);
  });
})();
