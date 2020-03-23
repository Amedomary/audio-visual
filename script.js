function startAudioVisual() {
  let audio = document.getElementById("audio");

  let files = this.files;
  // audio.src = URL.createObjectURL(files[0]);
  audio.load();
  audio.play();
  let context = new AudioContext();
  let src = context.createMediaElementSource(audio);
  let analyser = context.createAnalyser();

  // main canvas
  const canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth - 100;
  canvas.height = window.innerHeight - 400;
  const ctx = canvas.getContext("2d");

  // red canvas
  const canvasTopRed = document.getElementById("top-red-canvas");
  canvasTopRed.width = window.innerWidth - 100;
  canvasTopRed.height = window.innerHeight - 400;
  const ctxTopRed = canvasTopRed.getContext("2d");
  ctxTopRed.fillStyle = "rgb(255, 0, 0)";

  // bg canvas
  const canvasBg = document.getElementById("bg-canvas");
  canvasBg.width = window.innerWidth - 100;
  canvasBg.height = window.innerHeight - 400;
  const ctxBg = canvasBg.getContext("2d");
  ctxBg.fillStyle = "rgb(90, 40, 108)";

  src.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 2 ** 7;

  let bufferLength = analyser.frequencyBinCount;

  let dataArray = new Uint8Array(bufferLength);

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  const barWidth = Math.floor(WIDTH / bufferLength - 1);
  const heightCountSection = 17;

  function drawHzBar(count, currentHeight) {
    const leftDelta = (barWidth + 1) * count;
    const levels = Math.trunc(currentHeight / heightCountSection);
    let rgb = "0,0,0";

    for (let l = 0; l < levels; l++) {
      if (l < 2) {
        rgb = "201,243,251";
      } else if (l < 4) {
        rgb = "159,202,245";
      } else if (l < 6) {
        rgb = "143,142,231";
      } else if (l < 8) {
        rgb = "221,140,217";
      } else if (l < 10) {
        rgb = "231,120,217";
      } else if (l < 12) {
        rgb = "245,109,214";
      } else if (l < 13) {
        rgb = "255,89,212";
      } else if (l <= 16) {
        rgb = "255,239,48";
      } else {
        rgb = "243, 55, 13";
      }

      ctx.fillStyle = `rgb(${rgb})`;
      ctx.fillRect(
        leftDelta,
        HEIGHT - heightCountSection * l + l,
        barWidth,
        heightCountSection - 2
      );

      if (l === levels - 1)
        ctxTopRed.fillRect(
          leftDelta,
          HEIGHT - heightCountSection * l + l - 1,
          barWidth,
          1
        );
    }
  }

  let tempValue = new Array();
  let countDown = new Array();

  function drawBgBar(count, currentHeight) {
    const leftDelta = (barWidth + 1) * count;

    // старт
    if (!tempValue[count]) {
      tempValue[count] = currentHeight;
    }
    if (!countDown[count]) {
      countDown[count] = 10;
    }

    // если больше чем текущее
    if (tempValue[count] <= currentHeight) {
      tempValue[count] = currentHeight;
      countDown[count] = 10;
    } else {
      countDown[count] = countDown[count] - 1;
    }

    if (countDown[count] <= 0) {
      tempValue[count] = tempValue[count] - 10;
    }

    ctxBg.fillRect(
      leftDelta,
      HEIGHT - tempValue[count] + 17,
      barWidth,
      tempValue[count]
    );
    ctxTopRed.fillRect(leftDelta, HEIGHT - tempValue[count] + 17, barWidth, 2);
  }

  function renderFrame() {
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctxTopRed.clearRect(0, 0, WIDTH, HEIGHT);
    ctxBg.clearRect(0, 0, WIDTH, HEIGHT);

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * HEIGHT;

      drawHzBar(i, barHeight);
      drawBgBar(i, barHeight);
    }
    requestAnimationFrame(renderFrame);
  }

  requestAnimationFrame(renderFrame);
}

window.addEventListener("click", startAudioVisual);
