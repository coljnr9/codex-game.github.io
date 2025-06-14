// Simple 2D fluid solver adapted from Jos Stam's "Stable Fluids"
class Fluid {
  constructor(N, diffusion = 0.0001, viscosity = 0.0001, dt = 0.1) {
    this.N = N;
    this.dt = dt;
    this.diff = diffusion;
    this.visc = viscosity;
    const size = (N + 2) * (N + 2);
    this.s = new Float32Array(size);
    this.density = new Float32Array(size);
    this.Vx = new Float32Array(size);
    this.Vy = new Float32Array(size);
    this.Vx0 = new Float32Array(size);
    this.Vy0 = new Float32Array(size);
  }

  IX(x, y) {
    return x + (this.N + 2) * y;
  }

  addDensity(x, y, amount) {
    this.density[this.IX(x, y)] += amount;
  }

  addVelocity(x, y, amountX, amountY) {
    const i = this.IX(x, y);
    this.Vx[i] += amountX;
    this.Vy[i] += amountY;
  }

  step() {
    const N = this.N;
    const visc = this.visc;
    const diff = this.diff;
    const dt = this.dt;
    let Vx = this.Vx, Vy = this.Vy, Vx0 = this.Vx0, Vy0 = this.Vy0;
    let s = this.s, density = this.density;

    this.diffuse(1, Vx0, Vx, visc, dt);
    this.diffuse(2, Vy0, Vy, visc, dt);

    this.project(Vx0, Vy0, Vx, Vy);

    this.advect(1, Vx, Vx0, Vx0, Vy0, dt);
    this.advect(2, Vy, Vy0, Vx0, Vy0, dt);

    this.project(Vx, Vy, Vx0, Vy0);

    this.diffuse(0, s, density, diff, dt);
    this.advect(0, density, s, Vx, Vy, dt);
  }

  diffuse(b, x, x0, diff, dt) {
    const a = dt * diff * this.N * this.N;
    this.linearSolve(b, x, x0, a, 1 + 4 * a);
  }

  advect(b, d, d0, Vx, Vy, dt) {
    const N = this.N;
    let i, j, i0, i1, j0, j1;
    let x, y, s0, t0, s1, t1, dt0;

    dt0 = dt * N;
    for (i = 1; i <= N; i++) {
      for (j = 1; j <= N; j++) {
        x = i - dt0 * Vx[this.IX(i, j)];
        y = j - dt0 * Vy[this.IX(i, j)];
        if (x < 0.5) x = 0.5;
        if (x > N + 0.5) x = N + 0.5;
        i0 = Math.floor(x);
        i1 = i0 + 1;
        if (y < 0.5) y = 0.5;
        if (y > N + 0.5) y = N + 0.5;
        j0 = Math.floor(y);
        j1 = j0 + 1;
        s1 = x - i0;
        s0 = 1 - s1;
        t1 = y - j0;
        t0 = 1 - t1;
        d[this.IX(i, j)] =
          s0 * (t0 * d0[this.IX(i0, j0)] + t1 * d0[this.IX(i0, j1)]) +
          s1 * (t0 * d0[this.IX(i1, j0)] + t1 * d0[this.IX(i1, j1)]);
      }
    }
    this.setBoundary(b, d);
  }

  project(velocX, velocY, p, div) {
    const N = this.N;
    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= N; j++) {
        div[this.IX(i, j)] = -0.5 * (
          velocX[this.IX(i + 1, j)] - velocX[this.IX(i - 1, j)] +
          velocY[this.IX(i, j + 1)] - velocY[this.IX(i, j - 1)]
        ) / N;
        p[this.IX(i, j)] = 0;
      }
    }
    this.setBoundary(0, div);
    this.setBoundary(0, p);
    this.linearSolve(0, p, div, 1, 4);
    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= N; j++) {
        velocX[this.IX(i, j)] -= 0.5 * (p[this.IX(i + 1, j)] - p[this.IX(i - 1, j)]) * N;
        velocY[this.IX(i, j)] -= 0.5 * (p[this.IX(i, j + 1)] - p[this.IX(i, j - 1)]) * N;
      }
    }
    this.setBoundary(1, velocX);
    this.setBoundary(2, velocY);
  }

  linearSolve(b, x, x0, a, c) {
    const iter = 4;
    for (let k = 0; k < iter; k++) {
      for (let i = 1; i <= this.N; i++) {
        for (let j = 1; j <= this.N; j++) {
          x[this.IX(i, j)] = (x0[this.IX(i, j)] + a * (
            x[this.IX(i - 1, j)] + x[this.IX(i + 1, j)] +
            x[this.IX(i, j - 1)] + x[this.IX(i, j + 1)]
          )) / c;
        }
      }
      this.setBoundary(b, x);
    }
  }

  setBoundary(b, x) {
    const N = this.N;
    for (let i = 1; i <= N; i++) {
      x[this.IX(0, i)] = b === 1 ? -x[this.IX(1, i)] : x[this.IX(1, i)];
      x[this.IX(N + 1, i)] = b === 1 ? -x[this.IX(N, i)] : x[this.IX(N, i)];
      x[this.IX(i, 0)] = b === 2 ? -x[this.IX(i, 1)] : x[this.IX(i, 1)];
      x[this.IX(i, N + 1)] = b === 2 ? -x[this.IX(i, N)] : x[this.IX(i, N)];
    }
    x[this.IX(0, 0)] = 0.5 * (x[this.IX(1, 0)] + x[this.IX(0, 1)]);
    x[this.IX(0, N + 1)] = 0.5 * (x[this.IX(1, N + 1)] + x[this.IX(0, N)]);
    x[this.IX(N + 1, 0)] = 0.5 * (x[this.IX(N, 0)] + x[this.IX(N + 1, 1)]);
    x[this.IX(N + 1, N + 1)] = 0.5 * (x[this.IX(N, N + 1)] + x[this.IX(N + 1, N)]);
  }
}

export { Fluid };
if (typeof module !== 'undefined') {
  module.exports = { Fluid };
}
