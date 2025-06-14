const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { test } = require('node:test');
const { execSync } = require('child_process');
const { pathToFileURL } = require('url');

test('index.html includes game elements', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(html.includes('<canvas id="gfx"'));
  assert(html.includes('<script type="module" src="./main.js"'));
});

test('main.js syntax is valid', () => {
  execSync(`node --check ${path.join(__dirname, '..', 'main.js')}`);
});

  test('main.js initializes without DOM errors', async () => {
    const ctxStub = {
      setTransform() {},
      clearRect() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      closePath() {},
      fill() {},
      fillStyle: ''
    };

    const canvas = { getContext: () => ctxStub };
    global.document = {
      getElementById(id) {
        if (id === 'gfx') return canvas;
        return null;
      }
    };

    global.window = {
      addEventListener(event, handler) {
        if (event === 'DOMContentLoaded') handler();
      }
    };

    global.requestAnimationFrame = () => {};

    const moduleUrl = pathToFileURL(path.join(__dirname, '..', 'main.js')).href;
    await import(moduleUrl);
  });
