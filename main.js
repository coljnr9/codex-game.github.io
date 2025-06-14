const canvas = document.getElementById('gfx');
const ctx = canvas.getContext('2d');

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resize);
resize();

let time = 0;

function drawWave(offset, amplitude, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = 0; x <= canvas.width; x++) {
    const y = canvas.height / 2 + Math.sin(x * 0.02 + time + offset) * amplitude;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill();
}

function frame() {
  time += 0.03;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawWave(0, 20, '#77ccff');
  drawWave(Math.PI, 15, '#aaddff');
  drawWave(Math.PI / 2, 10, '#99ddff');

  requestAnimationFrame(frame);
}

window.addEventListener('DOMContentLoaded', () => requestAnimationFrame(frame));
