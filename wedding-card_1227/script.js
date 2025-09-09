const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzgBeQfgUjpRn6ZF2atoh5CyOtqvphdUa2tjaW0p9lavuxb-QhC6wdBRKvaNHYVNZsp/exec"; // 반드시 교체

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

  // 페이지 로드 후 모달 열기
  setTimeout(openSurvey, 300);

  if (!form) {
    console.error("❌ surveyForm 요소를 찾을 수 없습니다.");
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("📩 폼 제출 이벤트 발생");

    const data = {
      name: form.name.value.trim(),
      eat: form.eat.value,
      bus: form.bus.value,
      person: form.person.value || ''
    };
    console.log("➡️ 전송 데이터:", data);

    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      console.log("✅ fetch 요청 성공:", res);

      const result = await res.json();
      console.log("📥 서버 응답:", result);

      if (result && (result.result === 'success' || result.message)) {
        msg.classList.remove('hidden');
        msg.textContent = result.message || '제출 완료되었습니다.';
        setTimeout(() => {
          msg.classList.add('hidden');
          closeSurvey();
          form.reset();
        }, 1400);
      } else {
        alert("제출 실패: 응답 형식이 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("🚨 fetch 에러:", err);
      alert("제출 중 오류가 발생했습니다. 콘솔을 확인하세요.");
    }
  });
});
