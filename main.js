// Main 3D demo
async function init() {
  if (typeof document === 'undefined' || !document.createElement) return;
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js');
  const { Scene, PerspectiveCamera, WebGLRenderer, Color, DirectionalLight,
          PlaneGeometry, ConeGeometry, MeshLambertMaterial,
          MeshPhongMaterial, Mesh } = THREE;

  const canvas = document.getElementById('gfx');
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  const scene = new Scene();
  scene.background = new Color(0x87ceeb);

  const camera = new PerspectiveCamera(60, 2, 0.1, 100);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  const light = new DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7);
  scene.add(light);

  const groundMat = new MeshLambertMaterial({ color: 0x228B22 });
  const groundGeo = new PlaneGeometry(20, 20);
  const ground = new Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  function makeMountain(x, z, height) {
    const geo = new ConeGeometry(2, height, 4);
    const mat = new MeshLambertMaterial({ color: 0x556b2f });
    const m = new Mesh(geo, mat);
    m.position.set(x, height / 2, z);
    return m;
  }
  scene.add(makeMountain(-5, -2, 5));
  scene.add(makeMountain(0, -4, 6));
  scene.add(makeMountain(5, -3, 4));

  const waterGeo = new PlaneGeometry(20, 5, 60, 10);
  const waterMat = new MeshPhongMaterial({
    color: 0x3377ff,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });
  const water = new Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.z = 2;
  scene.add(water);

  function resize() {
    const width = canvas.clientWidth || 300;
    const height = canvas.clientHeight || 150;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  function animate(time) {
    requestAnimationFrame(animate);
    const pos = water.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = Math.sin(x * 0.5 + time * 0.001) * 0.1;
      pos.setZ(i, y);
    }
    pos.needsUpdate = true;
    renderer.render(scene, camera);
  }

  animate(0);
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('DOMContentLoaded', init);
}
