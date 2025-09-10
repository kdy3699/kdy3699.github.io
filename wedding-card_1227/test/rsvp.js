// /wedding-card_1227/assets/js/rsvp.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rsvpForm');
  const btn  = document.getElementById('rsvpSubmit');
  const msg  = document.getElementById('rsvpMessage');

  // Apps Script 웹앱 URL 넣기
  const ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec';

  // 중복 제출 방지용 간단 토큰 (세션 탭 기준)
  const token = sessionStorage.getItem('rsvpToken') || crypto.randomUUID();
  sessionStorage.setItem('rsvpToken', token);

  function setLoading(loading) {
    btn.disabled = loading;
    btn.textContent = loading ? '제출 중...' : '제출하기';
  }

  function showMsg(text, ok = true) {
    msg.textContent = text;
    msg.style.display = 'block';
    msg.style.color = ok ? 'inherit' : '#c00';
    msg.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 기본 유효성 검사
    if (!form.name.value.trim() ||
        !form.attendance.value ||
        !form.meal.value ||
        !form.bus.value) {
      showMsg('필수 항목을 모두 선택/입력해주세요.', false);
      return;
    }
    // 허니팟 체크
    if (form._hp.value) {
      // 봇 의심 → 성공인 척 종료
      showMsg('제출이 완료되었습니다! 감사합니다 :)', true);
      form.reset();
      return;
    }

    const payload = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      attendance: form.attendance.value,
      meal: form.meal.value,
      bus: form.bus.value,
      guests: form.guests.value || '0',
      memo: form.memo.value.trim(),
      _token: token
    };

    try {
      setLoading(true);

      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Apps Script는 우리가 응답 헤더로 CORS 허용을 넣었음
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        showMsg('제출이 완료되었습니다! 참여해주셔서 감사합니다 :)', true);
        form.reset();
        // 같은 탭에서 재제출 방지(원하면 주석 처리)
        sessionStorage.setItem('rsvpSubmitted', '1');
      } else {
        const err = data?.error || `(${res.status}) 제출에 실패했습니다.`;
        showMsg('제출 중 문제가 발생했습니다: ' + err, false);
      }
    } catch (err) {
      showMsg('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', false);
    } finally {
      setLoading(false);
    }
  });

  // 이미 제출한 탭이면 메시지 노출 (선택 사항)
  if (sessionStorage.getItem('rsvpSubmitted') === '1') {
    msg.style.display = 'block';
    msg.textContent = '이미 제출해주셨습니다. 수정이 필요하면 연락 부탁드려요 :)';
  }
});
