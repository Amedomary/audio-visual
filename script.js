var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = "absolute";
stats.domElement.style.left = "0px";
stats.domElement.style.top = "0px";
document.body.appendChild(stats.domElement);

const width = window.innerWidth - 100;
const height = window.innerHeight - 400;

const geometry = {
  lampWidth: 32,
  lampHeight: 16,
  gap: 2,
  lampHeightCount: 17,
  stepForLampFromData: 255 / 17,
  vertCell: 16 + 2,
  horCell: 32 + 2,
  capHeight: 5,
};

const color = {
  gap: "rgb(6,21,65)",
  bgBar: "rgb(86,40,191)",
  cap: "rgb(255, 63, 99)",
};

// level 1 canvas
const canvasLevel1 = document.getElementById("level-1-canvas");
canvasLevel1.width = width;
canvasLevel1.height = height;
const ctxLevel1 = canvasLevel1.getContext("2d");
ctxLevel1.fillStyle = "rgb(90, 40, 108)";

// level 2 canvas
const canvasLevel2 = document.getElementById("canvas");
canvasLevel2.width = width;
canvasLevel2.height = height;
const ctxLevel2 = canvasLevel2.getContext("2d");

// level 3 canvas
const canvasLevel3 = document.getElementById("level-3-canvas");
canvasLevel3.width = width;
canvasLevel3.height = height;
const ctxLevel3 = canvasLevel3.getContext("2d");

// level 4 canvas
const canvasLevel4 = document.getElementById("level-4-canvas");
canvasLevel4.width = width;
canvasLevel4.height = height;
const ctxLevel4 = canvasLevel4.getContext("2d");
ctxLevel4.fillStyle = color.cap;


const gradientBottom1 = ctxLevel2.createLinearGradient(
  0,
  height,
  0,
  height - geometry.vertCell * geometry.lampHeightCount
);
gradientBottom1.addColorStop(0, "rgba(206,253,254)");
gradientBottom1.addColorStop(0.15, "rgba(188,218,252)");
gradientBottom1.addColorStop(0.3, "rgba(244,182,250)");
gradientBottom1.addColorStop(0.47, "rgba(207,132,247)");

gradientBottom1.addColorStop(0.4701, "rgba(252,255,155)");
gradientBottom1.addColorStop(0.6, "rgba(254,249,178)");
gradientBottom1.addColorStop(0.88235, "rgba(243,173,139)");

gradientBottom1.addColorStop(0.88236, "rgba(251,85,48)");
gradientBottom1.addColorStop(1, "rgba(251,85,48)");



function drawStatic() {
  ctxLevel3.fillStyle = color.gap;

  for (let i = 0; i < width; i = i + (geometry.gap + geometry.lampWidth)) {
    ctxLevel3.fillRect(i, 0, geometry.gap, height);
  }

  for (let i = 0; i < height; i = i + (geometry.gap + geometry.lampHeight)) {
    ctxLevel3.fillRect(0, height - i, width, -geometry.gap);
  }
}

class HzBar {
  constructor(data) {
    this.index = data.index;
    this.x =
      this.index * geometry.lampWidth +
      geometry.gap +
      geometry.gap * this.index;
    this.preHeightLampsCount = 0;
    this.heightLampsCount = 0;
    this.height = 0;
    this._bgHeight = 0;
    this._timeoutCountdown = 0;
  }

  drawBar() {
    if (this.heightLampsCount === 0) return;

    ctxLevel2.fillStyle = gradientBottom1;
    ctxLevel2.fillRect(this.x, height, geometry.lampWidth, -this.height);
    ctxLevel4.fillRect(this.x, height - this.height, geometry.lampWidth, geometry.capHeight / 2);
  }

  drawBgBar() {
    ctxLevel1.fillStyle = color.bgBar;

    if (this._bgHeight < this.height) {
      this._bgHeight = this.height;
    } else {
      this._timeoutCountdown -= 1;
    }

    if (this._timeoutCountdown <= 0) {
      this._bgHeight  = this._bgHeight  - geometry.vertCell;
      this.updateCountdown();
    }

    ctxLevel1.fillRect(this.x, height, geometry.lampWidth, -this._bgHeight);
    ctxLevel4.fillRect(this.x, height - this._bgHeight, geometry.lampWidth, geometry.capHeight);
  }

  updateCountdown() {
    this._timeoutCountdown = 20; // frames (tick)
  }

  updateData(newData) {
    const newCount = Math.trunc(newData / geometry.stepForLampFromData); //12

    if (newCount > this.preHeightLampsCount) {
      this.heightLampsCount += 1;
    } else if ( newCount < this.preHeightLampsCount ) {
      this.heightLampsCount -= 1;
    }

    this.height = this.heightLampsCount * geometry.vertCell;

    this.drawBar();
    this.drawBgBar();

    this.preHeightLampsCount = this.heightLampsCount;
  }
}

function startAudioVisual() {
  let audio = document.getElementById("audio");

  let files = this.files;
  // audio.src = URL.createObjectURL(files[0]);

  audio.load();
  audio.play();
  let context = new AudioContext();
  let src = context.createMediaElementSource(audio);
  let analyser = context.createAnalyser();

  src.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 2 ** 7;

  const bufferLength = analyser.frequencyBinCount;
  let dataArray = new Uint8Array(bufferLength);

  const hzBarsArray = [];
  dataArray.forEach((v, index) => {
    hzBarsArray.push(new HzBar({ index }));
  });

  function renderFrame() {
    stats.begin();

    analyser.getByteFrequencyData(dataArray);
    // очищаем холсты
    ctxLevel1.clearRect(0, 0, width, height);
    ctxLevel2.clearRect(0, 0, width, height);
    ctxLevel4.clearRect(0, 0, width, height);

    // Запускаем обновление списка классов
    hzBarsArray.forEach((item, index) => {
      item.updateData(dataArray[index]);
    });

    stats.end();
    requestAnimationFrame(renderFrame);
  }
  requestAnimationFrame(renderFrame);
}

drawStatic();
window.addEventListener("click", startAudioVisual);
