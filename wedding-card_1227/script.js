const modal = document.getElementById('surveyModal');
const form = document.getElementById('surveyForm');
const msg = document.getElementById('surveyMsg');
const adminBtn = document.getElementById('adminButton');

function openSurvey() {
  modal.classList.remove('hidden');
}

function closeSurvey() {
  modal.classList.add('hidden');
}

// 설문 제출 시 로컬스토리지에 저장
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    name: form.name.value.trim(),
    eat: form.eat.value,
    bus: form.bus.value,
    person: form.person.value || ''
  };

  // 로컬스토리지에 저장
  let surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
  surveys.push(data);
  localStorage.setItem('surveys', JSON.stringify(surveys));

  msg.classList.remove('hidden');
  msg.textContent = '제출 완료되었습니다.';

  setTimeout(() => {
    msg.classList.add('hidden');
    closeSurvey();
    form.reset();
  }, 1400);
});

// 관리자 로그인 및 설문 결과 보기
adminBtn.addEventListener('click', () => {
  const pw = prompt('관리자 비밀번호를 입력하세요');
  if (pw === '7757') {
    const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    if (surveys.length === 0) {
      alert('설문 응답이 없습니다.');
      return;
    }

    const resultWindow = window.open('', '설문 결과', 'width=600,height=400,scrollbars=yes');
    resultWindow.document.write('<h2>설문 결과</h2><hr>');

    surveys.forEach((entry, idx) => {
      resultWindow.document.write(`<p><strong>${idx + 1}.</strong> 이름: ${entry.name}, 식사: ${entry.eat}, 버스: ${entry.bus}, 동행인원: ${entry.person}</p>`);
    });
    resultWindow.document.close();
  } else {
    alert('비밀번호가 올바르지 않습니다.');
  }
});

// 페이지 로드 시 모달 자동 오픈(옵션)
window.addEventListener('load', () => {
  openSurvey();
});

// 스크롤 함수
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
