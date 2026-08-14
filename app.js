// firebase.js는 외부 CDN을 불러오므로, 정적 import로 연결하면 네트워크 문제 시
// 게임 로직 전체가 실행되지 않는다. 필요한 시점에만 동적으로 불러와 격리한다.
const FIREBASE_TIMEOUT_MS = 8000;
let firebaseModulePromise = null;
function loadFirebase() {
  if (!firebaseModulePromise) {
    firebaseModulePromise = import("./firebase.js");
  }
  return withTimeout(firebaseModulePromise, FIREBASE_TIMEOUT_MS);
}

// CDN 응답이 없을 때(느린 네트워크, 광고 차단기 등) 화면이 무한 대기 상태에 빠지지 않도록 한다.
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

const screenEl = document.getElementById("screen");
const messageEl = document.getElementById("message");
const resultPanelEl = document.getElementById("result-panel");
const msDisplayEl = document.getElementById("ms-display");
const saveFormEl = document.getElementById("save-form");
const nicknameEl = document.getElementById("nickname");
const saveStatusEl = document.getElementById("save-status");
const retryBtnEl = document.getElementById("retry-btn");
const rankingListEl = document.getElementById("ranking-list");

const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 12000;
const TOP_N = 10;

// idle: 시작 대기 | waiting: 빨간색으로 바뀌길 기다리는 중 | ready: 빨간색, 클릭 대기 | result: 결과 화면
let state = "idle";
let timeoutId = null;
let readyAt = null;
let saveResultMs = null;

function setScreenColor(color) {
  screenEl.classList.remove("blue", "red", "green");
  screenEl.classList.add(color);
}

function showIdle() {
  state = "idle";
  clearTimeout(timeoutId);
  resultPanelEl.classList.add("hidden");
  messageEl.classList.remove("hidden");
  setScreenColor("blue");
  messageEl.textContent = "클릭하여 시작";
}

function startWaiting() {
  state = "waiting";
  setScreenColor("blue");
  messageEl.textContent = "빨간색으로 바뀔 때까지 기다리세요...";
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  timeoutId = setTimeout(() => {
    state = "ready";
    readyAt = performance.now();
    setScreenColor("red");
    messageEl.textContent = "지금 클릭!";
  }, delay);
}

function showFail() {
  clearTimeout(timeoutId);
  setScreenColor("blue");
  messageEl.textContent = "너무 빨랐습니다! 다시 클릭해서 시작하세요";
  state = "idle";
}

async function showResult(ms) {
  state = "result";
  setScreenColor("green");
  messageEl.classList.add("hidden");
  resultPanelEl.classList.remove("hidden");
  msDisplayEl.textContent = `${ms} ms`;
  saveStatusEl.textContent = "";
  nicknameEl.value = "";
  saveFormEl.classList.remove("hidden");

  saveResultMs = ms;
  await refreshRanking();
}

async function refreshRanking() {
  rankingListEl.innerHTML = "<li>불러오는 중...</li>";
  try {
    const { getTop } = await loadFirebase();
    const top = await withTimeout(getTop(TOP_N), FIREBASE_TIMEOUT_MS);
    rankingListEl.innerHTML = "";
    if (top.length === 0) {
      rankingListEl.innerHTML = "<li>기록이 아직 없습니다</li>";
      return;
    }
    for (const record of top) {
      const li = document.createElement("li");
      li.textContent = `${record.nickname} - ${record.ms} ms`;
      rankingListEl.appendChild(li);
    }
  } catch (err) {
    rankingListEl.innerHTML = "<li>기록을 불러오지 못했습니다</li>";
    console.error(err);
  }
}

screenEl.addEventListener("click", () => {
  if (state === "idle") {
    startWaiting();
  } else if (state === "waiting") {
    showFail();
  } else if (state === "ready") {
    const ms = Math.round(performance.now() - readyAt);
    showResult(ms);
  }
  // result 상태에서는 화면 클릭을 무시하고 폼/버튼으로만 조작한다.
});

saveFormEl.addEventListener("click", (e) => {
  e.stopPropagation();
});

saveFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nickname = nicknameEl.value.trim();
  if (!nickname) return;

  saveStatusEl.textContent = "저장 중...";
  try {
    const { saveScore } = await loadFirebase();
    await withTimeout(saveScore(saveResultMs, nickname), FIREBASE_TIMEOUT_MS);
    saveStatusEl.textContent = "저장되었습니다!";
    saveFormEl.classList.add("hidden");
    await refreshRanking();
  } catch (err) {
    saveStatusEl.textContent = "저장에 실패했습니다";
    console.error(err);
  }
});

retryBtnEl.addEventListener("click", (e) => {
  e.stopPropagation();
  showIdle();
});

showIdle();
