// 설문 모달 열기/닫기 함수 (원래 코드 유지)
function openSurvey() {
  const modal = document.getElementById('surveyModal');
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}
function closeSurvey() {
  const modal = document.getElementById('surveyModal');
  modal.classList.add('hidden');
  modal.style.display = '';
}

// 폼 제출 데이터 로컬 파일 저장 함수
function saveSurveyToFile(data) {
  const content = 
    `설문 응답\n` +
    `이름: ${data.name}\n` +
    `식사여부: ${data.eat}\n` +
    `버스 탑승: ${data.bus}\n` +
    `동행인원: ${data.person}\n` +
    `제출일시: ${new Date().toLocaleString()}\n`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.name || '응답'}_청첩장_설문.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// DOMContentLoaded 이벤트 후 로직 작성
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('surveyForm');
  const msg = document.getElementById('surveyMsg');

  if (!form) {
    console.error("❌ surveyForm 요소를 찾을 수 없습니다.");
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      eat: form.eat.value,
      bus: form.bus.value,
      person: form.person.value.trim()
    };

    // 로컬 파일 저장 함수 호출
    saveSurveyToFile(data);

    // 제출 완료 메시지 표시 후 폼 초기화 및 모달 닫기
    msg.classList.remove('hidden');
    msg.textContent = "제출 완료되었습니다.";
    setTimeout(() => {
      msg.classList.add('hidden');
      closeSurvey();
      form.reset();
    }, 1400);
  });
});
