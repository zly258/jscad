const formatStepEntity = (id, value) => `#${id}=${value};`;

const triangulateFaces = (faces) => {
  const triangles = [];
  for (const face of faces) {
    if (face.length === 3) {
      triangles.push(face);
    } else if (face.length > 3) {
      for (let i = 1; i < face.length - 1; i += 1) {
        triangles.push([face[0], face[i], face[i + 1]]);
      }
    }
  }
  return triangles;
};

export const exportStep = (meshes, options = {}) => {
  const name = options.name ?? 'jscad-model';
  const meshList = Array.isArray(meshes) ? meshes : [meshes];
  let id = 1;
  const entities = [];

  const add = (value) => {
    const current = id;
    entities.push(formatStepEntity(current, value));
    id += 1;
    return current;
  };

  const productId = add(`PRODUCT('${name}','', '', ())`);
  const contextId = add(`APPLICATION_CONTEXT('design')`);
  const prodDefContextId = add(`PRODUCT_DEFINITION_CONTEXT('part definition',#${contextId},'design')`);
  const prodDefId = add(`PRODUCT_DEFINITION('','',#${productId},#${prodDefContextId})`);

  const unitId = add(`(LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.))`);
  const uncertaintyId = add(`UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-6),#${unitId},'','')`);
  const geomContextId = add(`GEOMETRIC_REPRESENTATION_CONTEXT(3)`);
  add(`GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#${uncertaintyId}),#${geomContextId})`);

  const shellIds = [];
  for (const mesh of meshList) {
    const vertexIds = mesh.vertices.map((vertex) => {
      return add(`CARTESIAN_POINT('',(${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}))`);
    });

    const triangles = triangulateFaces(mesh.faces);
    const faceIds = triangles.map((face) => {
      const points = face.map((index) => `#${vertexIds[index]}`).join(',');
      return add(`TRIANGULATED_FACE('',(${points}),.T.)`);
    });

    shellIds.push(add(`TESSELLATED_SHELL('',(${faceIds.map((faceId) => `#${faceId}`).join(',')}))`));
  }

  const shapeRepId = add(
    `TESSELLATED_SHAPE_REPRESENTATION('${name}',(${shellIds.map((shellId) => `#${shellId}`).join(',')}),#${geomContextId})`
  );
  add(`SHAPE_DEFINITION_REPRESENTATION(#${prodDefId},#${shapeRepId})`);

  const header = [
    'ISO-10303-21;',
    'HEADER;',
    "FILE_DESCRIPTION(('AP242'),'1');",
    `FILE_NAME('${name}.stp','${new Date().toISOString()}',('jscad'),(''), 'jscad','', '');`,
    "FILE_SCHEMA(('AP242'));",
    'ENDSEC;',
    'DATA;'
  ];

  const footer = ['ENDSEC;', 'END-ISO-10303-21;'];

  return [...header, ...entities, ...footer].join('\n');
};
