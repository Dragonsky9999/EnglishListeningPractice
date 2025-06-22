    const video = document.getElementById("video");
    const loopStatus = document.getElementById("loopStatus");
    const subtitleDiv = document.getElementById("subtitles");

    let pointA = 0, pointB = 0, loopOn = false;
    let subtitles = [];

    document.getElementById("videoInput").addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        video.src = URL.createObjectURL(file);
      }
    });

    function setA() {
      pointA = video.currentTime;
      alert("A点を " + pointA.toFixed(2) + " 秒に設定");
    }

    function setB() {
      pointB = video.currentTime;
      alert("B点を " + pointB.toFixed(2) + " 秒に設定");
    }

    function toggleLoop() {
      loopOn = !loopOn;
      loopStatus.textContent = loopOn ? "ON" : "OFF";
    }

    setInterval(() => {
      if (loopOn && pointB > pointA && video.currentTime >= pointB) {
        video.currentTime = pointA;
      }
      highlightSubtitle(video.currentTime);
    }, 300);

    function loadSubtitles() {
      subtitles = [];
      subtitleDiv.innerHTML = "";
      const lines = document.getElementById("subtitleInput").value.split("\n");
      for (let line of lines) {
        const match = line.match(/^(\d+):(\d+)\s+(.+)$/);
        if (match) {
          const time = parseInt(match[1]) * 60 + parseInt(match[2]);
          const text = match[3];
          subtitles.push({ time, text });
        }
      }
      subtitles.sort((a, b) => a.time - b.time);
      renderSubtitles();
    }

    function renderSubtitles() {
      subtitleDiv.innerHTML = "";
      subtitles.forEach((sub, i) => {
        const p = document.createElement("p");
        p.className = "subtitle-line";
        p.textContent = sub.text;
        p.dataset.index = i;
        p.onclick = () => { video.currentTime = sub.time; };
        subtitleDiv.appendChild(p);
      });
    }

    function highlightSubtitle(currentTime) {
      for (let i = 0; i < subtitles.length; i++) {
        const now = subtitles[i];
        const next = subtitles[i + 1];
        const from = now.time;
        const to = next ? next.time : video.duration;
        const element = subtitleDiv.children[i];
        if (currentTime >= from && currentTime < to) {
          element.classList.add("highlight");
        } else {
          element.classList.remove("highlight");
        }
      }
    }