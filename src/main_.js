const gr = require('grimoirejs').default;

// const scale = 1;

// const count = 4;

// gr(() => {
//   for (let x = -count; x <= count; x++) {
//     for (let y = -count; y <= count; y++) {
//       gr('#canvas')('scene').append(`
//         <mesh
//           id="c${x + count}${y + count}"
//           position="${x * scale}, 0, ${y * scale}"
//           scale="0.4"
//           geometry="cube"
//           material="#main"
//           targetBuffer="default"
//         >
//           <mesh.components>
//             <Wave />
//           </mesh.components>
//         </mesh>`);
//       //gr('#canvas')(`#c${x + count}${y + count}`).setAttribute('material', '#main');
//     }
//   }
// });

const gf = require('grimoirejs-fundamental').default;
const {Vector3, AABB} = require('grimoirejs-math').default;
const GeometryFactory = gf.Geometry.GeometryFactory;
const GeometryBuilder = gf.Geometry.GeometryBuilder;
const GeometryUtility = gf.Geometry.GeometryUtility;
const GomlParser = gr.Node.GomlParser;

function* torusIndex(row, column) {
  for (let i = 0; i < row; i++) {
    for (let ii = 0; ii < column; ii++) {
      const r = (column + 1) * i + ii;
      yield* [r, r + column + 1, r + 1];
      yield* [r + column + 1, r + column + 2, r + 1];
    }
  }
}

function* torusPosition(row, column, irad, orad) {
  for (let i = 0; i <= row; i++) {
    const r = Math.PI * 2 / row * i;
    const rr = Math.cos(r);
    const ry = Math.sin(r);
    for (let ii = 0; ii <= column; ii++) {
      const tr = Math.PI * 2 / column * ii;
      const tx = (rr * irad + orad) * Math.cos(tr);
      const ty = ry * irad;
      const tz = (rr * irad + orad) * Math.sin(tr);
      yield* [tx, ty, tz];
    }
  }
}

function* torusNormal(row, column) {
  for (let i = 0; i <= row; i++) {
    const r = Math.PI * 2 / row * i;
    const rr = Math.cos(r);
    const ry = Math.sin(r);
    for (let ii = 0; ii <= column; ii++) {
      const tr = Math.PI * 2 / column * ii;
      var rx = rr * Math.cos(tr);
      var rz = rr * Math.sin(tr);
      yield* [rx, ry, rz];
    }
  }
}

function torusSize(row, column) {
  return (row + 1) * (column + 1);
}

function torusAABB(irad, orad) {
  return new AABB([new Vector3(orad * 1.4142, orad - irad, orad * 1.4142), new Vector3(-orad * 1.4142, irad - orad, -orad * 1.4142)]);
}

GeometryFactory.addType('torus', {
  row: {
    converter: 'Number',
    defaultValue: 32,
  },
  column: {
    converter: 'Number',
    defaultValue: 32,
  },
  irad: {
    converter: 'Number',
    defaultValue: 0.5,
  },
  orad: {
    converter: 'Number',
    defaultValue: 1.0,
  },
}, (gl, attrs) => {
  return GeometryBuilder.build(gl, {
    indicies: {
      default: {
        generator: function* () {
          yield* torusIndex(attrs.row, attrs.column);
        },
        topology: WebGLRenderingContext.TRIANGLES,
      },
      wireframe: {
        generator: function* () {
          yield* GeometryUtility.linesFromTriangles(torusIndex(attrs.row, attrs.column));
        },
        topology: WebGLRenderingContext.LINES,
      },
    },
    verticies: {
      main: {
        size: {
          position: 3,
          normal: 3,
          texCoord: 2,
        },
        count: torusSize(attrs.row, attrs.column),
        getGenerators: () => {
          return {
            position: function* () {
              yield* torusPosition(attrs.row, attrs.column, attrs.irad, attrs.orad);
            },
            normal: function* () {
              yield* torusNormal(attrs.row, attrs.column);
            },
            texCoord: function* () {
              while (true) {
                yield 1;
              }
            },
          };
        },
      },
    },
    aabb: torusAABB(attrs.irad, attrs.orad),
  });
});

gr.registerComponent('AABB', {
  attributes: {
    color: {
      defaultValue: 'black',
      converter: 'Color3',
    },
  },
  $mount() {
    const aabb = this.node.getComponent('MeshRenderer')._geometry.aabb;
    const newNode = GomlParser._createNode(document.createElement('mesh'));
    this.node.addChild(newNode);
    this.node.append(`<mesh
      position="${aabb.Center}"
      scale="${aabb.pointLBF.subtractWith(aabb.pointRTN).multiplyWith(0.5).rawElements.map((v) => Math.abs(v)).join(',')}"
      geometry="cube"
      color="${this.getValue('color').toString()}"
      targetBuffer="wireframe"
      />`);
  },
});

// gr(() => {
//   const aabb = torusAABB(0.5, 1.0);
//   gr('#canvas')('scene').append(`<mesh
//     position="${lbf.addWith(rtn).multiplyWith(0.5).toString()}"
//     scale="${lbf.subtractWith(rtn).rawElements.map((v) => Math.abs(v)).join(',')}"
//     geometry="cube"
//     color="black"
//     targetBuffer="wireframe"
//     />`);
//   console.log(gr("#canvas")("mesh")("MeshRenderer").first()._geometry);
// });
