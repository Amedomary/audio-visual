function startAudioVisual() {
    let audio = document.getElementById("audio");

    let files = this.files;
    // audio.src = URL.createObjectURL(files[0]);
    audio.load();
    audio.play();
    let context = new AudioContext();
    let src = context.createMediaElementSource(audio);
    let analyser = context.createAnalyser();

    let canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 128;

    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    let WIDTH = canvas.width;
    let HEIGHT = canvas.height - 200;

    let barWidth = (WIDTH / bufferLength) * 2;

    let barHeight;

    function renderFrame() {
      let x = 0;
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        let r = barHeight;
        let g = 120;
        let b = 120;

        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
      requestAnimationFrame(renderFrame);
    }

    requestAnimationFrame(renderFrame);
};


window.addEventListener('click', startAudioVisual);