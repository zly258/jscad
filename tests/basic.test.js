import assert from 'node:assert/strict';
import {
  rectangle,
  circle,
  extrude,
  box,
  union,
  Scene2D,
  Scene3D
} from '../src/index.js';

const rect = rectangle(10, 20).translate(5, -5);
const circleShape = circle(5).scale(2);
const solid = extrude(rect, 8);
const cube = box(2, 2, 2).translate(0, 0, 1);

const assembly = union(solid, cube);

assert.equal(rect.toPath().length, 4);
assert.ok(circleShape.toPath(12).length >= 12);

const mesh = solid.toMesh();
assert.ok(mesh.vertices.length > 0);
assert.ok(mesh.faces.length > 0);

assert.equal(assembly.toJSON().operation, 'union');

const scene2d = new Scene2D().add(rect, circleShape);
assert.equal(scene2d.toJSON().items.length, 2);

const scene3d = new Scene3D().add(solid, cube);
const step = scene3d.exportStep({ name: 'scene-test' });
assert.ok(step.includes('ISO-10303-21'));

console.log('basic tests passed');
