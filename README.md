# JS CAD 2D/3D Modeling Engine (Version 2)

这是一个轻量级的二三维 JS CAD 建模引擎雏形（版本 2），提供基础几何体、变换、场景管理以及 STP 导出能力。

## 功能特性

- 2D 形状：矩形、圆形、多边形
- 3D 形状：立方体、球体、圆柱体、2D 拉伸
- 变换：平移、旋转、缩放
- 组合：并集、差集、交集（以组合对象表达）
- 场景：Scene2D / Scene3D 管理二三维图形
- 导出：`toPath()`、`toMesh()`、`toJSON()`、`toStep()` / `exportStep()`

## 在线预览

### 本地快速预览

```bash
npx serve examples
```

打开浏览器访问命令输出的地址（例如 `http://localhost:3000/preview.html`）。

### 在线沙盒

可将 `examples/preview.html` 与 `examples/preview.js` 直接拖入 CodeSandbox 或 StackBlitz，
使用浏览器原生模块加载即可预览 2D/3D 线框渲染示例。

## 快速开始

```js
import {
  rectangle,
  circle,
  extrude,
  box,
  union,
  Scene3D
} from 'jscad';

const base = rectangle(40, 20).translate(10, 0);
const hole = circle(6).translate(-5, 0);
const plate = extrude(base, 4);
const bolt = box(4, 4, 10).translate(0, 0, 5);

const assembly = union(plate, bolt);
const scene = new Scene3D().add(plate, bolt);

console.log(assembly.toJSON());
console.log(scene.exportStep({ name: 'demo' }));
```

## 开发说明

- 形状默认以原点为中心生成。
- `toMesh()` 会生成简化的顶点与面数据，便于后续导出到更完整的渲染/切片流程。
- `toStep()` / `exportStep()` 使用 AP242 的网格表达方式生成 STP 文本。
