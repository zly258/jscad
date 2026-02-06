import { exportStep } from './exporters/step.js';
import { CompositeShape2D } from './shape2d.js';
import { CompositeShape } from './shape3d.js';

export class Scene2D {
  constructor() {
    this.items = [];
  }

  add(...shapes) {
    this.items.push(...shapes);
    return this;
  }

  union(...shapes) {
    return new CompositeShape2D('union', shapes);
  }

  subtract(base, ...cuts) {
    return new CompositeShape2D('subtract', [base, ...cuts]);
  }

  intersect(...shapes) {
    return new CompositeShape2D('intersect', shapes);
  }

  toJSON() {
    return {
      type: 'scene2d',
      items: this.items.map((item) => item.toJSON())
    };
  }
}

export class Scene3D {
  constructor() {
    this.items = [];
  }

  add(...shapes) {
    this.items.push(...shapes);
    return this;
  }

  union(...shapes) {
    return new CompositeShape('union', shapes);
  }

  subtract(base, ...cuts) {
    return new CompositeShape('subtract', [base, ...cuts]);
  }

  intersect(...shapes) {
    return new CompositeShape('intersect', shapes);
  }

  toMeshes() {
    return this.items.map((item) => {
      if (typeof item.toMesh !== 'function') {
        throw new Error('Scene3D item does not support mesh export');
      }
      return item.toMesh();
    });
  }

  exportStep(options = {}) {
    return exportStep(this.toMeshes(), options);
  }

  toJSON() {
    return {
      type: 'scene3d',
      items: this.items.map((item) => item.toJSON())
    };
  }
}
