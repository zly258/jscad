export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  sub(other) {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  scale(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  toArray() {
    return [this.x, this.y];
  }
}

export class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(other) {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  sub(other) {
    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  scale(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  toArray() {
    return [this.x, this.y, this.z];
  }
}

export class Matrix4 {
  constructor(elements) {
    this.elements = elements ?? Matrix4.identity().elements;
  }

  static identity() {
    return new Matrix4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  static translation(x, y, z) {
    return new Matrix4([
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1
    ]);
  }

  static scale(x, y, z) {
    return new Matrix4([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ]);
  }

  static rotationX(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Matrix4([
      1, 0, 0, 0,
      0, c, -s, 0,
      0, s, c, 0,
      0, 0, 0, 1
    ]);
  }

  static rotationY(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Matrix4([
      c, 0, s, 0,
      0, 1, 0, 0,
      -s, 0, c, 0,
      0, 0, 0, 1
    ]);
  }

  static rotationZ(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Matrix4([
      c, -s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  multiply(other) {
    const a = this.elements;
    const b = other.elements;
    const r = new Array(16).fill(0);
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        for (let i = 0; i < 4; i += 1) {
          r[row * 4 + col] += a[row * 4 + i] * b[i * 4 + col];
        }
      }
    }
    return new Matrix4(r);
  }

  transformVector3(vec) {
    const e = this.elements;
    const x = vec.x;
    const y = vec.y;
    const z = vec.z;
    const nx = e[0] * x + e[1] * y + e[2] * z + e[3];
    const ny = e[4] * x + e[5] * y + e[6] * z + e[7];
    const nz = e[8] * x + e[9] * y + e[10] * z + e[11];
    return new Vector3(nx, ny, nz);
  }
}
