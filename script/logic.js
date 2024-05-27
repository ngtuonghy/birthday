const btn = document.getElementById("btn");
const title = document.getElementById("title");

let audioContext;
let analyser;
let dataArray;
let microphoneStream;
let intervalId;
export let isRunning = false;

function blowCandles() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        microphoneStream = stream;
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 2048;

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        intervalId = setInterval(detectBlow, 100);
      })
      .catch(function (err) {
        console.error("Error requesting microphone access", err);
      });
  } else {
    console.log("browser not support getUserMedia.");
  }
}

function stopBlowCandles() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (microphoneStream) {
    microphoneStream.getTracks().forEach((track) => track.stop());
    microphoneStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

function detectBlow() {
  analyser.getByteFrequencyData(dataArray);
  const average =
    dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
  const threshold = 43;
  if (average > threshold) {
    // NOTE: gửi yêu cầu dập nến
    isRunning = true;
    console.log("Phát hiện thổi vào microphone");
    title.textContent = "Happy Birthday!";
    btn.innerText = "Thổi tiếp nào";
    btn.style.display = "block";
    stopBlowCandles();
  }
}

blowCandles();
btn.style.display = "none";
btn.addEventListener("click", function () {
  blowCandles();
  btn.style.display = "none";
  title.textContent = "Thổi vào đây!";
  isRunning = false;
});
