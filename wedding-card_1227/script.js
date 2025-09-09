document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('surveyModal');
  const form = document.getElementById('surveyForm');
  const msg = document.getElementById('surveyMsg');

  function openSurvey() {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  function closeSurvey() {
    modal.classList.add('hidden');
    modal.style.display = '';
  }

const password = '7757';  // 관리자 비밀번호

function openAdminPanel() {
  const inputPwd = prompt('관리자 비밀번호를 입력하세요:');
  if (inputPwd === password) {
    showSurveyResults();
  } else {
    alert('비밀번호가 올바르지 않습니다.');
  }
}

function showSurveyResults() {
  // 예: 로컬스토리지에 설문 저장 데이터가 있다면 불러와서 보여주기
  // 로컬저장소 키 'surveyData' 사용 예
  const dataJSON = localStorage.getItem('surveyData');
  if (!dataJSON) {
    alert('아직 설문 데이터가 없습니다.');
    return;
  }
  const dataList = JSON.parse(dataJSON);

  const resultsWindow = window.open('', '설문결과', 'width=600,height=400,scrollbars=yes');
  resultsWindow.document.write('<h2>설문 결과 목록</h2>');
  if (dataList.length === 0) {
    resultsWindow.document.write('<p>설문 응답이 없습니다.</p>');
  } else {
    dataList.forEach((entry, idx) => {
      resultsWindow.document.write(
        `<p><strong>${idx + 1}.</strong> 이름: ${entry.name}, 식사: ${entry.eat}, 버스: ${entry.bus}, 동행인원: ${entry.person}</p>`
      );
    });
  }
  resultsWindow.document.close();
}

// example: 참여 버튼에 연결
document.getElementById('adminButton').addEventListener('click', openAdminPanel);

// 설문 제출 시 로컬 저장 (form submit 핸들러 예시)
document.getElementById('surveyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const newEntry = {
    name: form.name.value,
    eat: form.eat.value,
    bus: form.bus.value,
    person: form.person.value,
  };

  let surveyData = JSON.parse(localStorage.getItem('surveyData') || '[]');
  surveyData.push(newEntry);
  localStorage.setItem('surveyData', JSON.stringify(surveyData));

  alert('제출이 완료되었습니다.');

  form.reset();
  closeSurvey();
});
