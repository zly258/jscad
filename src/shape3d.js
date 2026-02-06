import { exportStep } from './exporters/step.js';
import { Matrix4, Vector3 } from './math.js';

export class Shape3D {
  constructor(type, params) {
    this.type = type;
    this.params = params;
    this.transforms = [];
  }

  translate(x, y, z) {
    this.transforms.push(Matrix4.translation(x, y, z));
    return this;
  }

  rotateX(rad) {
    this.transforms.push(Matrix4.rotationX(rad));
    return this;
  }

  rotateY(rad) {
    this.transforms.push(Matrix4.rotationY(rad));
    return this;
  }

  rotateZ(rad) {
    this.transforms.push(Matrix4.rotationZ(rad));
    return this;
  }

  scale(x, y = x, z = x) {
    this.transforms.push(Matrix4.scale(x, y, z));
    return this;
  }

  toMesh(segments = 16) {
    let mesh = { vertices: [], faces: [] };
    if (this.type === 'box') {
      const { width, height, depth } = this.params;
      const hx = width / 2;
      const hy = height / 2;
      const hz = depth / 2;
      mesh.vertices = [
        new Vector3(-hx, -hy, -hz),
        new Vector3(hx, -hy, -hz),
        new Vector3(hx, hy, -hz),
        new Vector3(-hx, hy, -hz),
        new Vector3(-hx, -hy, hz),
        new Vector3(hx, -hy, hz),
        new Vector3(hx, hy, hz),
        new Vector3(-hx, hy, hz)
      ];
      mesh.faces = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [0, 1, 5, 4],
        [2, 3, 7, 6],
        [1, 2, 6, 5],
        [0, 3, 7, 4]
      ];
    } else if (this.type === 'sphere') {
      const { radius } = this.params;
      for (let lat = 0; lat <= segments; lat += 1) {
        const theta = (lat * Math.PI) / segments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        for (let lon = 0; lon <= segments; lon += 1) {
          const phi = (lon * 2 * Math.PI) / segments;
          const sinPhi = Math.sin(phi);
          const cosPhi = Math.cos(phi);
          mesh.vertices.push(
            new Vector3(radius * cosPhi * sinTheta, radius * sinPhi * sinTheta, radius * cosTheta)
          );
        }
      }
      const ring = segments + 1;
      for (let lat = 0; lat < segments; lat += 1) {
        for (let lon = 0; lon < segments; lon += 1) {
          const first = lat * ring + lon;
          const second = first + ring;
          mesh.faces.push([first, second, second + 1, first + 1]);
        }
      }
    } else if (this.type === 'cylinder') {
      const { radius, height } = this.params;
      const half = height / 2;
      for (let i = 0; i < segments; i += 1) {
        const theta = (2 * Math.PI * i) / segments;
        mesh.vertices.push(new Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, -half));
        mesh.vertices.push(new Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, half));
      }
      const topCenter = mesh.vertices.length;
      mesh.vertices.push(new Vector3(0, 0, half));
      const bottomCenter = mesh.vertices.length;
      mesh.vertices.push(new Vector3(0, 0, -half));
      for (let i = 0; i < segments; i += 1) {
        const next = (i + 1) % segments;
        mesh.faces.push([i * 2, next * 2, next * 2 + 1, i * 2 + 1]);
        mesh.faces.push([topCenter, i * 2 + 1, next * 2 + 1]);
        mesh.faces.push([bottomCenter, next * 2, i * 2]);
      }
    } else if (this.type === 'cone') {
      const { radius, height } = this.params;
      const half = height / 2;
      for (let i = 0; i < segments; i += 1) {
        const theta = (2 * Math.PI * i) / segments;
        mesh.vertices.push(new Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, -half));
      }
      const apexIndex = mesh.vertices.length;
      mesh.vertices.push(new Vector3(0, 0, half));
      const baseCenter = mesh.vertices.length;
      mesh.vertices.push(new Vector3(0, 0, -half));
      for (let i = 0; i < segments; i += 1) {
        const next = (i + 1) % segments;
        mesh.faces.push([i, next, apexIndex]);
        mesh.faces.push([baseCenter, next, i]);
      }
    } else if (this.type === 'extrude') {
      const { shape, height } = this.params;
      const path = shape.toPath(segments);
      const half = height / 2;
      const baseIndex = mesh.vertices.length;
      for (const point of path) {
        mesh.vertices.push(new Vector3(point.x, point.y, -half));
      }
      for (const point of path) {
        mesh.vertices.push(new Vector3(point.x, point.y, half));
      }
      const count = path.length;
      for (let i = 0; i < count; i += 1) {
        const next = (i + 1) % count;
        mesh.faces.push([baseIndex + i, baseIndex + next, baseIndex + count + next, baseIndex + count + i]);
      }
    }

    const transform = this.transforms.reduce((acc, next) => acc.multiply(next), Matrix4.identity());
    const vertices = mesh.vertices.map((vertex) => transform.transformVector3(vertex));
    return { vertices, faces: mesh.faces };
  }

  toStep(options = {}) {
    return exportStep(this.toMesh(), options);
  }

  toJSON() {
    return {
      type: this.type,
      params: this.params,
      transforms: this.transforms.map((t) => t.elements)
    };
  }
}

export class CompositeShape {
  constructor(operation, shapes) {
    this.operation = operation;
    this.shapes = shapes;
  }

  toJSON() {
    return {
      operation: this.operation,
      shapes: this.shapes.map((shape) => shape.toJSON())
    };
  }
}

export const box = (width, height, depth) => new Shape3D('box', { width, height, depth });
export const sphere = (radius) => new Shape3D('sphere', { radius });
export const cylinder = (radius, height) => new Shape3D('cylinder', { radius, height });
export const cone = (radius, height) => new Shape3D('cone', { radius, height });
export const extrude = (shape, height) => new Shape3D('extrude', { shape, height });

export const union = (...shapes) => new CompositeShape('union', shapes);
export const subtract = (base, ...cuts) => new CompositeShape('subtract', [base, ...cuts]);
export const intersect = (...shapes) => new CompositeShape('intersect', shapes);
