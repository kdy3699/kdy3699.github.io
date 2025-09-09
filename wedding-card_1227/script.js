// script.js
const modal = document.getElementById('surveyModal');
const form = document.getElementById('surveyForm');
const msg = document.getElementById('surveyMsg');

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzgBeQfgUjpRn6ZF2atoh5CyOtqvphdUa2tjaW0p9lavuxb-QhC6wdBRKvaNHYVNZsp/exec"; // <- 교체

function openSurvey() {
  modal.classList.remove('hidden');
}
function closeSurvey() {
  modal.classList.add('hidden');
}

// 스크롤 함수
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// 제출 처리
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: form.name.value.trim(),
    attend: form.eat.value,
    bus: form.bus.value,
    note: form.person.value || ''
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result && (result.result === 'success' || result.message)) {
      msg.classList.remove('hidden');
      msg.textContent = result.message || '제출 완료되었습니다.';
      setTimeout(() => {
        msg.classList.add('hidden');
        closeSurvey();
        form.reset();
      }, 1400);
    } else {
      alert('제출이 완료되지 않았습니다. 다시 시도해주세요.');
    }
  } catch (err) {
    console.error(err);
    alert('제출 중 오류가 발생했습니다.');
  }
});
