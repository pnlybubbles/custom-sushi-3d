const {
  GeometryUtility,
  GeometryBuilder,
  GeometryFactory,
} = require('grimoirejs-fundamental').default.Geometry;
const {Vector3, AABB} = require('grimoirejs-math').default;

class SushiGeo {
  constructor(div) {
    this.div = div;
    this.offset = 0;
    this.topology = 3;
    this.position = [];
    this.index = [];
    this.normal = [];
    this.texCoord = [];
    this.count = 0;
    this.debug = false;
    this.texCoordMapping = [
      {
        dot: Vector3.YUnit,
        offset: [0.3333, 0.3333],
      }, {
        dot: Vector3.YUnit.negateThis(),
        offset: [0.3333, 0.3333],
      }, {
        dot: Vector3.XUnit,
        offset: [0.6666, 0.3333],
      }, {
        dot: Vector3.XUnit.negateThis(),
        offset: [0.0, 0.3333],
      }, {
        dot: Vector3.ZUnit,
        offset: [0.3333, 0.6666],
      }, {
        dot: Vector3.ZUnit.negateThis(),
        offset: [0.3333, 0.0],
      },
    ];
    this.texUnit = 0.3333;
  }

  debugInit() {
    this.index_ = [];
    this.position_ = [];
    this.texCoord_ = [];
    this.div_ = [];
  }

  generate(debug) {
    if (debug) {
      this.debug = true;
      this.debugInit();
    }
    this.cube();
    this.count = this.position.length / this.topology;
    if (this.debug) {
      this.validate();
      console.log(this.index_);
      console.log(this.position_);
      console.log(this.texCoord_);
    }
  }

  cube() {
    const center = Vector3.Zero;
    const up = Vector3.YUnit;
    const right = Vector3.XUnit;
    const forward = Vector3.ZUnit.negateThis();
    this.offset = 0;
    this.rect(center.subtractWith(forward), up, right, forward.negateThis()); // 手前
    this.rect(center.addWith(forward), up.negateThis(), right, forward); // 奥
    this.rect(center.addWith(up), forward, right, up); // 上
    this.rect(center.subtractWith(up), forward, right.negateThis(), up.negateThis()); // 下
    this.rect(center.addWith(right), forward, up.negateThis(), right); // 右
    this.rect(center.subtractWith(right), forward, up, right.negateThis()); // 左
  }

  rect(center, up, right, forward) {
    const xdiv = Math.abs(this.div.dotWith(right));
    const ydiv = Math.abs(this.div.dotWith(up));
    if (this.debug) { this.div_.push([xdiv,ydiv].toString()); }
    for (let x = 0; x <= xdiv; x++) {
      for (let y = 0; y <= ydiv; y++) {
        const p = center.addWith(right.multiplyWith(2 * x / xdiv - 1).addWith(up.multiplyWith(2 * y / ydiv - 1)));
        this.position = this.position.concat(Array.prototype.slice.call(p.rawElements));
        if (this.debug) { this.position_.push(Array.prototype.slice.call(p.rawElements).toString() + center.toString() + up.toString() + right.toString()); }
        this.normal = this.normal.concat(Array.prototype.slice.call(forward.rawElements));
        this.texCoordMapping.forEach((v) => {
          if (v.dot.dotWith(forward) === 1) {
            let uv;
            if (v.dot.equalWith(Vector3.YUnit.negateThis())) {
              uv = [v.offset[0] + this.texUnit - x * (this.texUnit / xdiv), v.offset[1] + this.texUnit - y * (this.texUnit / ydiv)];
            } else {
              uv = [v.offset[0] + x * (this.texUnit / xdiv), v.offset[1] + this.texUnit - y * (this.texUnit / ydiv)];
            }
            this.texCoord = this.texCoord.concat(uv);
            if (this.debug) {this.texCoord_.push(uv.toString() + forward.toString())}
          }
        });
        if (x !== 0 && y !== 0) {
          let poly = [];
          [[-1, -1], [0, -1], [-1, 0], [0, 0], [-1, 0], [0, -1]].forEach((dxdy, i) => {
            this.index.push(this.coordToIndex(this.offset, x + dxdy[0], y + dxdy[1], up));
            if (this.debug) {
              poly.push(this.coordToIndex(this.offset, x + dxdy[0], y + dxdy[1], up));
              if (poly.length === 3) {
                this.index_.push(poly.toString());
                poly = [];
              }
            }
          });
        }
      }
    }
    this.offset += (xdiv + 1) * (ydiv + 1);
  }

  coordToIndex(offset, x, y, up) {
    return offset + x * (Math.abs(this.div.dotWith(up)) + 1) + y;
  }

  validate() {
    if (this.position.length % 3 !== 0) {
      console.error(`position length(${this.position.length}) is not a multiple of 3.`);
    }
    if (this.normal.length % 3 !== 0) {
      console.error(`normal length(${this.normal.length}) is not a multiple of 3.`);
    }
    if (this.index.length % this.topology !== 0) {
      console.error(`index length(${this.index.length}) is not a multiple of topology(${this.topology}).`);
    }
    if (this.texCoord.length % 2 !== 0) {
      console.error(`texCoord length(${this.texCoord.length}) is not a multiple of 2.`);
    }
    if (this.position.length !== this.normal.length) {
      console.error(`normal length is not match to position length. normal: ${this.normal.length}, position: ${this.position.length}`);
    }
    if (this.position.length / 3 !== this.texCoord.length / 2) {
      console.error(`texCoord pair length is not match to position pair length. texCoord: ${this.texCoord.length / 2}, position: ${this.position.length / 3}`);
    }
    this.index.forEach((v, idx) => {
      if (isNaN(parseInt(v)) || parseInt(v) !== v) {
        console.error(`index(${v}) is not a integer. in: index[${idx}] (${Math.ceil(idx / this.topology)})`);
      }
      if (v > this.position.length / 3) {
        console.error(`index(${v}) is out of range. in: index[${idx}] (${Math.ceil(idx / this.topology)})`);
      }
    });
    this.position.forEach((v, idx) => {
      if (isNaN(parseFloat(v))) {
        console.error(`position(${v}) is not a number. in: position[${idx}] (${Math.ceil(idx / 3)})`);
      }
      if (v > 1.0 || v < -1.0) {
        console.warn(`position(${v}) is out of unit space(-1 < q < 1). in: position[${idx}] (${Math.ceil(idx / 3)})`);
      }
    });
    Array.from({length: this.normal.length / 3}, (v, i) => {
      return this.normal.slice(i * 3, i * 3 + 3);
    }).forEach((v, idx) => {
      const n = new Vector3(v);
      if (Math.abs(n.magnitude - 1) > 0.001) {
        console.warn(`normal(${v.toString()}) is not normalized(${n.magnitude}). in: normal[${idx * 3}..${idx * 3 + 3}] (${idx})`);
      }
    });
    this.texCoord.forEach((v, idx) => {
      if (isNaN(parseFloat(v))) {
        console.error(`texCoord(${v}) is not a number. in: texCoord[${idx}] (${Math.ceil(idx / 2)})`);
      }
      if (v > 1.0 || v < 0) {
        console.warn(`texCoord(${v}) is out of unit space(0 < q < 1). in: texCoord[${idx}] (${Math.ceil(idx / 2)})`);
      }
    });
  }
}

const unitBox = new AABB([new Vector3(-1, -1, -1), new Vector3(1, 1, 1)]);

GeometryFactory.addType("sushi", {
  div: {
    converter: 'Vector3',
    defaultValue: '2,2,2',
  },
}, (gl, attrs) => {
  const sg = new SushiGeo(attrs.div);
  sg.generate(false);
  return GeometryBuilder.build(gl, {
    indices: {
      default: {
        generator: function* () {
          yield* sg.index;
        },
        topology: WebGLRenderingContext.TRIANGLES
      },
      wireframe: {
        generator: function* () {
          yield* GeometryUtility.linesFromTriangles(sg.index);
        },
        topology: WebGLRenderingContext.LINES
      }
    },
    vertices: {
      main: {
        size: {
          position: 3,
          normal: 3,
          texCoord: 2
        },
        count: sg.count,
        getGenerators: () => {
          return {
            position: function* () {
              yield* sg.position;
            },
            normal: function* () {
              yield* sg.normal;
            },
            texCoord: function* () {
              yield* sg.texCoord;
            }
          };
        }
      }
    },
    aabb: unitBox
  });
});
