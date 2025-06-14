const canvas = document.getElementById('gfx');
const unsupported = document.getElementById('unsupported');

async function init() {
  if (!navigator.gpu) {
    unsupported.style.display = 'block';
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu');
  const format = navigator.gpu.getPreferredCanvasFormat();

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    context.configure({ device, format, alphaMode: 'opaque',
      size: [canvas.width, canvas.height] });
  }
  window.addEventListener('resize', resize);
  resize();

  const uniformBufferSize = 16; // 4 bytes time + 8 bytes resolution + padding
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });

  const vertexModule = device.createShaderModule({ code: vertexShader });
  const fragmentModule = device.createShaderModule({ code: fragmentShader });

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: vertexModule,
      entryPoint: 'vs_main',
      buffers: [{
        arrayStride: 8,
        attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }]
      }]
    },
    fragment: {
      module: fragmentModule,
      entryPoint: 'fs_main',
      targets: [{ format }]
    },
    primitive: { topology: 'triangle-list' }
  });

  const vertexData = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]);

  const vertexBuffer = device.createBuffer({
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertexData);

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
  });

  let time = 0;
  function frame() {
    time += 0.016;
    const uniformData = new Float32Array([time, canvas.width, canvas.height, 0]);
    device.queue.writeBuffer(uniformBuffer, 0, uniformData.buffer);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1 }
      }]
    });
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6);
    pass.end();
    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const vertexShader = `
struct VertexOutput {
  @builtin(position) position : vec4<f32>;
};

@vertex
fn vs_main(@location(0) pos : vec2<f32>) -> VertexOutput {
  var out : VertexOutput;
  out.position = vec4<f32>(pos, 0.0, 1.0);
  return out;
}
`;

const fragmentShader = `
struct Uniforms {
  time : f32,
  resolution : vec2<f32>,
  pad : f32,
};
@group(0) @binding(0) var<uniform> uniforms : Uniforms;

@fragment
fn fs_main(@builtin(position) position : vec4<f32>) -> @location(0) vec4<f32> {
  let uv = position.xy / uniforms.resolution;
  let wave = sin((uv.x + uv.y + uniforms.time) * 10.0) * 0.1;
  let color = vec3<f32>(0.0, 0.4 + wave, 0.7);
  return vec4<f32>(color, 1.0);
}
`;

window.addEventListener('DOMContentLoaded', init);
