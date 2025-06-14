// Main 3D demo
async function init() {
  if (typeof document === 'undefined' || !document.createElement) return;
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js');
  const { Scene, PerspectiveCamera, WebGLRenderer, Color, DirectionalLight,
          PlaneGeometry, BoxGeometry, ConeGeometry, MeshLambertMaterial,
          MeshPhongMaterial, Mesh, Group, CubeCamera,
          WebGLCubeRenderTarget, LineSegments, EdgesGeometry,
          LineBasicMaterial } = THREE;
  const { Fluid } = await import('./fluid.mjs');

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

  const gridSize = 50;
  const waterDepth = 0.1;
  const waterGroup = new Group();
  waterGroup.position.z = 2;
  scene.add(waterGroup);

  const waterVolumeGeo = new BoxGeometry(20, waterDepth, 20);
  const waterVolumeMat = new MeshPhongMaterial({
    color: 0x3377ff,
    transparent: true,
    opacity: 0.5,
  });
  const waterVolume = new Mesh(waterVolumeGeo, waterVolumeMat);
  waterVolume.position.y = waterDepth / 2;
  waterGroup.add(waterVolume);

  const cubeRT = new WebGLCubeRenderTarget(128);
  const cubeCamera = new CubeCamera(0.1, 100, cubeRT);
  cubeCamera.position.y = waterDepth + 0.01;
  waterGroup.add(cubeCamera);

  const waterGeo = new PlaneGeometry(20, 20, gridSize, gridSize);
  const waterMat = new MeshPhongMaterial({
    color: 0x3377ff,
    transparent: true,
    opacity: 0.8,
    shininess: 100,
    side: THREE.DoubleSide,
    envMap: cubeRT.texture,
    reflectivity: 0.6,
  });
  const water = new Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = waterDepth;
  waterGroup.add(water);

  const foamPlane = new PlaneGeometry(20, 20, 1, 1);
  const foamEdges = new EdgesGeometry(foamPlane);
  const foamMat = new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  const foam = new LineSegments(foamEdges, foamMat);
  foam.rotation.x = -Math.PI / 2;
  foam.position.y = waterDepth + 0.01;
  waterGroup.add(foam);

  const fluid = new Fluid(gridSize);

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
    const center = Math.floor(gridSize / 2);
    fluid.addDensity(center, center, Math.sin(time * 0.002) * 0.05);
    fluid.step();

    const pos = water.geometry.attributes.position;
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const idx = j * (gridSize + 1) + i;
        const h = fluid.density[fluid.IX(i, j)];
        pos.setZ(idx, h);
      }
    }
    pos.needsUpdate = true;

    // match foam corners to water surface
    const foamPos = foamPlane.attributes.position;
    const topLeft = pos.getZ((gridSize + 1) * gridSize);
    const topRight = pos.getZ((gridSize + 1) * gridSize + gridSize);
    const bottomLeft = pos.getZ(0);
    const bottomRight = pos.getZ(gridSize);
    foamPos.setZ(0, bottomLeft);
    foamPos.setZ(1, bottomRight);
    foamPos.setZ(2, topLeft);
    foamPos.setZ(3, topRight);
    foamPos.needsUpdate = true;
    foam.geometry.dispose();
    foam.geometry = new EdgesGeometry(foamPlane);

    water.visible = false;
    cubeCamera.update(renderer, scene);
    water.visible = true;

    renderer.render(scene, camera);
  }

  animate(0);
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('DOMContentLoaded', init);
}
