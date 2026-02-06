import { Matrix4, Vector2 } from './math.js';

export class Shape2D {
  constructor(type, params) {
    this.type = type;
    this.params = params;
    this.transforms = [];
  }

  translate(x, y) {
    this.transforms.push(Matrix4.translation(x, y, 0));
    return this;
  }

  rotate(rad) {
    this.transforms.push(Matrix4.rotationZ(rad));
    return this;
  }

  scale(x, y = x) {
    this.transforms.push(Matrix4.scale(x, y, 1));
    return this;
  }

  toPath(segments = 32) {
    const points = [];
    if (this.type === 'rectangle') {
      const { width, height } = this.params;
      points.push(
        new Vector2(-width / 2, -height / 2),
        new Vector2(width / 2, -height / 2),
        new Vector2(width / 2, height / 2),
        new Vector2(-width / 2, height / 2)
      );
    } else if (this.type === 'circle') {
      const { radius } = this.params;
      for (let i = 0; i < segments; i += 1) {
        const theta = (Math.PI * 2 * i) / segments;
        points.push(new Vector2(Math.cos(theta) * radius, Math.sin(theta) * radius));
      }
    } else if (this.type === 'polygon') {
      for (const point of this.params.points) {
        points.push(new Vector2(point[0], point[1]));
      }
    }

    const transform = this.transforms.reduce((acc, next) => acc.multiply(next), Matrix4.identity());
    return points.map((point) => {
      const v3 = transform.transformVector3({ x: point.x, y: point.y, z: 0 });
      return new Vector2(v3.x, v3.y);
    });
  }

  toJSON() {
    return {
      type: this.type,
      params: this.params,
      transforms: this.transforms.map((t) => t.elements)
    };
  }
}

export class CompositeShape2D {
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

export const rectangle = (width, height) => new Shape2D('rectangle', { width, height });
export const circle = (radius) => new Shape2D('circle', { radius });
export const polygon = (points) => new Shape2D('polygon', { points });

export const union2d = (...shapes) => new CompositeShape2D('union', shapes);
export const subtract2d = (base, ...cuts) => new CompositeShape2D('subtract', [base, ...cuts]);
export const intersect2d = (...shapes) => new CompositeShape2D('intersect', shapes);
