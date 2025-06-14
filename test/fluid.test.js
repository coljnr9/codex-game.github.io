const assert = require('assert');
const { test } = require('node:test');
const { pathToFileURL } = require('url');

async function loadFluid() {
  const moduleUrl = pathToFileURL(require('path').join(__dirname, '..', 'fluid.mjs')).href;
  return await import(moduleUrl);
}

test('diffusion spreads density', async () => {
  const { Fluid } = await loadFluid();
  const f = new Fluid(4, 0.2, 0, 0.1);
  const idx = f.IX(2, 2);
  f.density[idx] = 10;
  f.diffuse(0, f.s, f.density, f.diff, f.dt);
  const maxBefore = 10;
  let maxAfter = 0;
  for (let i = 0; i < f.s.length; i++) maxAfter = Math.max(maxAfter, f.s[i]);
  assert(maxAfter < maxBefore, 'density should spread');
});

test('projection reduces divergence', async () => {
  const { Fluid } = await loadFluid();
  const f = new Fluid(4, 0, 0, 0.1);
  // random velocity field
  for (let i = 1; i <= f.N; i++) {
    for (let j = 1; j <= f.N; j++) {
      f.Vx[f.IX(i,j)] = Math.sin(i * j);
      f.Vy[f.IX(i,j)] = Math.cos(i + j);
    }
  }

  function divergence() {
    let maxDiv = 0;
    for (let i = 1; i <= f.N; i++) {
      for (let j = 1; j <= f.N; j++) {
        const dv = -0.5 * (
          f.Vx[f.IX(i + 1, j)] - f.Vx[f.IX(i - 1, j)] +
          f.Vy[f.IX(i, j + 1)] - f.Vy[f.IX(i, j - 1)]
        ) / f.N;
        maxDiv = Math.max(Math.abs(dv), maxDiv);
      }
    }
    return maxDiv;
  }

  const before = divergence();
  const div = new Float32Array(f.Vx.length);
  const p = new Float32Array(f.Vx.length);
  f.project(f.Vx, f.Vy, p, div);
  const after = divergence();
  assert(after < before, 'divergence should decrease after projection');
});
