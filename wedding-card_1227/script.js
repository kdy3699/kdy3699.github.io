const modal = document.getElementById("surveyModal");
const form = document.getElementById("surveyForm");

// Google Apps Script URL (직접 발급받은 URL로 교체!)
const SCRIPT_URL = "https://docs.google.com/spreadsheets/d/1pPrwYNofEsIhnRjAMUqit_qFTqTmX1EHCywMMp3jdGU/edit?gid=0#gid=0";

function openSurvey() {
  modal.classList.remove("hidden");
}
function closeSurvey() {
  modal.classList.add("hidden");
}

form.addEventListener("submit", async function(e) {
  e.preventDefault();
  const formData = {
    name: this.name.value,
    attend: this.attend.value,
    bus: this.bus.value
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();
    alert(result.message);
    closeSurvey();
    this.reset();
  } catch (err) {
    alert("제출 중 오류가 발생했습니다.");
    console.error(err);
  }
});
