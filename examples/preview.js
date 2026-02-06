import {
  rectangle,
  circle,
  polygon,
  box,
  cylinder,
  extrude,
  Scene2D,
  Scene3D
} from '../src/index.js';

const canvas2d = document.querySelector('#canvas2d');
const ctx2d = canvas2d.getContext('2d');

const canvas3d = document.querySelector('#canvas3d');
const ctx3d = canvas3d.getContext('2d');

const drawPath = (path, offsetX, offsetY, color) => {
  if (path.length === 0) {
    return;
  }
  ctx2d.beginPath();
  ctx2d.strokeStyle = color;
  ctx2d.moveTo(path[0].x + offsetX, path[0].y + offsetY);
  for (let i = 1; i < path.length; i += 1) {
    ctx2d.lineTo(path[i].x + offsetX, path[i].y + offsetY);
  }
  ctx2d.closePath();
  ctx2d.stroke();
};

const shape2dA = rectangle(120, 60).translate(80, 80).rotate(Math.PI / 12);
const shape2dB = circle(30).translate(200, 120);
const shape2dC = polygon([
  [0, 0],
  [30, 10],
  [20, 40],
  [-10, 30]
]).translate(120, 160);

const scene2d = new Scene2D().add(shape2dA, shape2dB, shape2dC);

ctx2d.clearRect(0, 0, canvas2d.width, canvas2d.height);
ctx2d.lineWidth = 2;

const colors = ['#0b7285', '#6741d9', '#f76707'];
scene2d.toJSON();
[shape2dA, shape2dB, shape2dC].forEach((shape, index) => {
  drawPath(shape.toPath(48), 0, 0, colors[index]);
});

const project = (vertex, camera) => {
  const scale = camera.distance / (camera.distance + vertex.z);
  return {
    x: vertex.x * scale + camera.centerX,
    y: -vertex.y * scale + camera.centerY
  };
};

const drawMeshWireframe = (mesh, camera, strokeStyle) => {
  const projected = mesh.vertices.map((vertex) => project(vertex, camera));
  ctx3d.strokeStyle = strokeStyle;
  for (const face of mesh.faces) {
    ctx3d.beginPath();
    const start = projected[face[0]];
    ctx3d.moveTo(start.x, start.y);
    for (let i = 1; i < face.length; i += 1) {
      const point = projected[face[i]];
      ctx3d.lineTo(point.x, point.y);
    }
    ctx3d.closePath();
    ctx3d.stroke();
  }
};

const base2d = rectangle(80, 40).translate(0, 0);
const solid = extrude(base2d, 30).rotateX(Math.PI / 6).rotateZ(Math.PI / 8).translate(-40, -10, 0);
const tube = cylinder(12, 40).rotateX(Math.PI / 2).translate(40, 0, 0);
const cube = box(20, 20, 20).translate(0, 40, 0);

const scene3d = new Scene3D().add(solid, tube, cube);
const meshes = scene3d.toMeshes();

ctx3d.clearRect(0, 0, canvas3d.width, canvas3d.height);
ctx3d.lineWidth = 1.2;

const camera = {
  centerX: canvas3d.width / 2,
  centerY: canvas3d.height / 2,
  distance: 160
};

const meshColors = ['#5c940d', '#d9480f', '#1864ab'];
meshes.forEach((mesh, index) => {
  drawMeshWireframe(mesh, camera, meshColors[index]);
});
