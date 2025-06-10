let sentences = [];
let currentIndex = 0;
let speaking = false;
let notes = {};
let rate = 1.0;

const currentSentenceEl = document.getElementById('currentSentence');
const noteBox = document.getElementById('noteBox');
const progress = document.getElementById('progress');
const fullTextEl = document.getElementById('fullText');
const rateRange = document.getElementById('rateRange');
const rateLabel = document.getElementById('rateLabel');

//各種ボタン
const previousBtn = document.getElementById("previousBtn");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const nextBtn = document.getElementById("nextBtn");


// ファイル読み込み
document.getElementById('fileInput').add
EventListener('change', function (e) {

  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {

    const text = event.target.result;
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    sentences = Array.from(segmenter.segment(text), s => s.segment.trim()).filter(Boolean);
    currentIndex = 0;
    loadNotes();
    updateDisplay();

  };
  if (file) {
    reader.readAsText(file);
  }

});

function updateDisplay() {
  const current = sentences[currentIndex] || "文がありません";

  currentSentenceEl.textContent = current;
  progress.textContent = `文番号: ${currentIndex + 1} / ${sentences.length}`;
  renderFullText();
}

function renderFullText() {
  fullTextEl.innerHTML = sentences.map((s, i) => {

    const clean = s;
    return i === currentIndex
      ? `<span class="highlight" onclick="jumpTo(${i})">${clean}</span>`
      : `<span onclick="jumpTo(${i})">${clean}</span>`;
  }).join(' ');

}

function startSpeaking() {

  if (!sentences.length || speaking) return;

  speaking = true;
  loopSpeak();

}

function loopSpeak() {

  if (!speaking) return;
  const utter = new SpeechSynthesisUtterance(sentences[currentIndex]);
  utter.lang = 'en-US';
  utter.rate = rate;
  utter.onend = () => {
    if (speaking) {
      setTimeout(loopSpeak, 800);
    }
  };
  speechSynthesis.speak(utter);
}

function stopSpeaking() {
  speaking = false;
  speechSynthesis.cancel();
}

function nextSentence() {
  saveNote();
  if (currentIndex < sentences.length - 1) {
    currentIndex++;
    stopSpeaking();
    loadNote();
    updateDisplay();
  }
}

function prevSentence() {
  saveNote();
  if (currentIndex > 0) {
    currentIndex--;
    stopSpeaking();
    loadNote();
    updateDisplay();
  }
}

function jumpTo(index) {
  saveNote();
  currentIndex = index;
  stopSpeaking();
  loadNote();
  updateDisplay();
}

function saveNote() {
  notes[currentIndex] = noteBox.value;
  localStorage.setItem('sentenceNotes', JSON.stringify(notes));
}

function loadNote() {
  const saved = localStorage.getItem('sentenceNotes');
  if (saved) {
    notes = JSON.parse(saved);
    noteBox.value = notes[currentIndex] || "";
  } else {
    noteBox.value = "";
  }
}

function loadNotes() {
  const saved = localStorage.getItem('sentenceNotes');
  if (saved) {
    notes = JSON.parse(saved);
  } else {
    notes = {};
  }
  loadNote();
}
rateRange.addEventListener('input', function () {
  rate = parseFloat(this.value);
  rateLabel.textContent = rate.toFixed(1);
});

function downloadNotes() {
  saveNote();
  let content = '';
  sentences.forEach((s, i) => {
    content += `文 ${i + 1}: ${s}\nメモ: ${notes[i] || ''}\n\n`;
  });
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'notes.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// 単語ダブルクリックで辞書表示
currentSentenceEl.addEventListener('dblclick', function (e) {
  const selection = window.getSelection().toString().trim();
  if (selection) {
    const url = `https://ejje.weblio.jp/content/${encodeURIComponent(selection)}`;
    window.open(url, '_blank');
  }
})

startBtn.addEventListener("click", prevSentence)
stopBtn.addEventListener("click", startSpeaking)
previousBtn.addEventListener("click", stopSpeaking)
nextBtn.addEventListener("click", nextSentence)