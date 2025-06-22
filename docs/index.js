let sentences=[], currentIndex=0, speaking=false, notes={}, rate=1.0;

const curEl=document.getElementById('currentSentence'),
      noteBox=document.getElementById('noteBox'),
      progress=document.getElementById('progress'),
      fullEl=document.getElementById('fullText'),
      rateRange=document.getElementById('rateRange'),
      rateLabel=document.getElementById('rateLabel');

document.getElementById('fileInput').addEventListener('change',e=>{
  const f=e.target.files[0]; if(!f) return;
  const rd=new FileReader();
  rd.onload=ev=>{
    const seg=new Intl.Segmenter('en',{granularity:'sentence'});
    sentences=Array.from(seg.segment(ev.target.result),s=>s.segment.trim()).filter(Boolean);
    currentIndex=0; loadNotes(); updateDisplay();
  };
  rd.readAsText(f);
});

function updateDisplay(){
  curEl.textContent=sentences[currentIndex]||'文がありません';
  progress.textContent=`文番号: ${currentIndex+1} / ${sentences.length}`;
  fullEl.innerHTML=sentences.map((s,i)=>
    i===currentIndex?`<span class="highlight" onclick="jumpTo(${i})">${s}</span>`:
                      `<span onclick="jumpTo(${i})">${s}</span>`).join(' ');
}

function loopSpeak(){
  if(!speaking) return;
  const ut=new SpeechSynthesisUtterance(sentences[currentIndex]);
  ut.lang='en-US'; ut.rate=rate;
  ut.onend=()=>{ if(speaking) setTimeout(loopSpeak,800); };
  speechSynthesis.speak(ut);
}

function startSpeaking(){ if(!sentences.length||speaking) return; speaking=true; loopSpeak();}
function stopSpeaking(){ speaking=false; speechSynthesis.cancel();}
function togglePlay(){ speaking?stopSpeaking():startSpeaking();}
function restartSentence(){ stopSpeaking(); speaking=true; loopSpeak();}

function nextSentence(){ saveNote(); if(currentIndex<sentences.length-1){ currentIndex++; stopSpeaking(); loadNote(); updateDisplay(); }}
function prevSentence(){ saveNote(); if(currentIndex>0){ currentIndex--; stopSpeaking(); loadNote(); updateDisplay(); }}
function jumpTo(i){ saveNote(); currentIndex=i; stopSpeaking(); loadNote(); updateDisplay(); }

function saveNote(){ notes[currentIndex]=noteBox.value; localStorage.setItem('sentenceNotes',JSON.stringify(notes)); }
function loadNotes(){ const s=localStorage.getItem('sentenceNotes'); notes=s?JSON.parse(s):{}; loadNote();}
function loadNote(){ noteBox.value=notes[currentIndex]||''; }

rateRange.oninput=function(){ rate=parseFloat(this.value); rateLabel.textContent=rate.toFixed(1); };

// 🔑 キーボード操作
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='TEXTAREA') return;      // メモ入力中は無効化
  switch(e.key){
    case 'ArrowLeft': e.preventDefault(); prevSentence(); break;
    case 'ArrowRight': e.preventDefault(); nextSentence(); break;
    case ' ':          e.preventDefault(); togglePlay();  break;
    case 'r': case 'R':restartSentence(); break;
  }
});