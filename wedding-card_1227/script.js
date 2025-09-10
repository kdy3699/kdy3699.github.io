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
