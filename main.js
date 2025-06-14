const canvas = document.getElementById('gfx');
const ctx = canvas.getContext('2d');

let groundY = 0;
let heights = new Float32Array(0);
let velocity = new Float32Array(0);

function initWater() {
  const count = Math.max(2, Math.floor(((canvas.width || 300) / 3)));
  heights = new Float32Array(count);
  velocity = new Float32Array(count);
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 300;
  const h = canvas.clientHeight || 150;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  groundY = canvas.height * 0.6;
  initWater();
}

window.addEventListener('resize', resize);

window.addEventListener('DOMContentLoaded', () => {
  resize();
  requestAnimationFrame(frame);
});

function updateWater() {
  const count = heights.length;
  for (let i = 1; i < count - 1; i++) {
    const accel = (heights[i - 1] + heights[i + 1] - 2 * heights[i]) * 0.02;
    velocity[i] += accel;
    velocity[i] *= 0.98;
  }
  for (let i = 0; i < count; i++) {
    heights[i] += velocity[i];
  }

  if (Math.random() < 0.3) {
    const idx = Math.floor(count * 0.72);
    velocity[idx] -= 1 + Math.random();
  }
}

function drawBackground() {
  ctx.fillStyle = '#87ceeb';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(canvas.width, groundY);
  ctx.lineTo(0, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#556b2f';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width * 0.25, groundY * 0.4);
  ctx.lineTo(canvas.width * 0.5, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.3, groundY);
  ctx.lineTo(canvas.width * 0.5, groundY * 0.3);
  ctx.lineTo(canvas.width * 0.7, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.6, groundY);
  ctx.lineTo(canvas.width * 0.85, groundY * 0.35);
  ctx.lineTo(canvas.width, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();

  const w = canvas.width * 0.05;
  const h = canvas.height * 0.2;
  const x = canvas.width * 0.72;
  const y = groundY - h;
  ctx.fillStyle = '#aaddff';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, groundY);
  ctx.lineTo(x, groundY);
  ctx.closePath();
  ctx.fill();
}

function drawWater() {
  const count = heights.length;
  ctx.fillStyle = '#3377ff';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * canvas.width;
    const y = groundY + heights[i];
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * canvas.width;
    const y = groundY + heights[i] * 0.5;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, groundY);
  ctx.closePath();
  ctx.fill();
}

function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateWater();
  drawBackground();
  drawWater();
  requestAnimationFrame(frame);
}

