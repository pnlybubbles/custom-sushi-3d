const fs = require('fs');
const {MaterialFactory} = require('grimoirejs-fundamental').default.Material;

const fxaa = fs.readFileSync(__dirname + '/fxaa.sort').toString();
MaterialFactory.addSORTMaterial("fxaa", fxaa);
gr.registerNode("render-fxaa", [], {
  material: "new(fxaa)"
}, "render-quad");

const vignetting = fs.readFileSync(__dirname + '/vignetting.sort').toString();
MaterialFactory.addSORTMaterial("vignetting", vignetting);
gr.registerNode("render-vignetting", [], {
  material: "new(vignetting)"
}, "render-quad");

const aberration = fs.readFileSync(__dirname + '/aberration.sort').toString();
MaterialFactory.addSORTMaterial("aberration", aberration);
gr.registerNode("render-aberration", [], {
  material: "new(aberration)"
}, "render-quad");

const hud = fs.readFileSync(__dirname + '/hud.sort').toString();
MaterialFactory.addSORTMaterial("hud", hud);
gr.registerNode("render-hud", [], {
  material: "new(hud)"
}, "render-quad");

const {
  GeometryUtility,
  GeometryBuilder,
  GeometryFactory,
} = require('grimoirejs-fundamental').default.Geometry;
const {Vector3, AABB} = require('grimoirejs-math').default;

class DivCube {
  constructor(div) {
    this.div = div;
    this.offset = 0;
    this.topology = 3;
    this.position = [];
    this.index = [];
    this.normal = [];
    this.count = 0;
    this.debug = false;
  }

  debugInit() {
    this.index_ = [];
    this.position_ = [];
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
    }
  }

  cube() {
    const center = Vector3.Zero;
    const up = Vector3.YUnit;
    const right = Vector3.XUnit;
    const forward = Vector3.ZUnit.negateThis();
    this.offset = 0;
    this.rect(center.subtractWith(forward), up, right, forward.negateThis()); // 手前
    this.rect(center.addWith(forward), up, right.negateThis(), forward); // 奥
    this.rect(center.addWith(up), forward, right, up); // 上
    this.rect(center.addWith(right), forward, up.negateThis(), right); // 右
    this.rect(center.subtractWith(up), forward, right.negateThis(), up.negateThis()); // 下
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
        // console.log(x, y, this.position.length, this.normal.length);
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
    if (this.position.length !== this.normal.length) {
      console.error(`normal length is not match to position length. normal: ${this.normal.length}, position: ${this.position.length}`);
    }
  }
}

// const d = new DivCube();
// const dv = new Vector3(1, 2, 1);
// d.generate(dv);
// console.log(2 * (3 * 2 * dv.X * dv.Y) + 2 * (3 * 2 * dv.Y * dv.Z) + 2 * (3 * 2 * dv.Z * dv.X));
// console.log((dv.X + 1) * (dv.Y + 1) * 2 * 3 + (dv.Y + 1) * (dv.Z + 1) * 2 * 3 + (dv.Z + 1) * (dv.X + 1) * 2 * 3);
// console.log((dv.X + 1) * (dv.Y + 1) * 2 * 3 + (dv.Y + 1) * (dv.Z + 1) * 2 * 3 + (dv.Z + 1) * (dv.X + 1) * 2 * 3);
// d.validate();

// const divCube = new DivCube();

const unitBox = new AABB([new Vector3(-1, -1, -1), new Vector3(1, 1, 1)]);

GeometryFactory.addType("div-cube", {
  div: {
    converter: 'Vector3',
    defaultValue: '2,2,2',
  },
}, (gl, attrs) => {
  const dc = new DivCube(attrs.div);
  dc.generate();
  return GeometryBuilder.build(gl, {
    indices: {
      default: {
        generator: function* () {
          yield* dc.index;
        },
        topology: WebGLRenderingContext.TRIANGLES
      },
      wireframe: {
        generator: function* () {
          yield* GeometryUtility.linesFromTriangles(dc.index);
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
        count: dc.count,
        getGenerators: () => {
          return {
            position: function* () {
              yield* dc.position;
            },
            normal: function* () {
              yield* dc.normal;
            },
            texCoord: function* () {
              while (true) {
                yield 1;
              }
            }
          };
        }
      }
    },
    aabb: unitBox
  });
});

const Tweenable = require('shifty');

function tw(opt) {
  return function() {
    return new Promise(function(resolve, reject) {
      try {
        opt.finish = resolve;
        (new Tweenable()).tween(opt);
      } catch (e) {
        reject(e);
      }
    });
  };
}

const EPS = Math.pow(10, -5);

gr(() => {
  const $ = gr('#canvas');
  const _cScale = $('#come').getAttribute('scale');
  const _cPosition = $('#come').getAttribute('position');
  const _nPosition = $('#neta').getAttribute('position');

  function move() {
    $('#come').setAttribute('scale', _cScale);
    $('#come').setAttribute('position', _cPosition);
    $('#neta').setAttribute('position', _nPosition);
    cScaleY = {
      from: 1.0,
      to: 0.4,
    };
    Promise.resolve().then(tw({
      from: {
        phi: 0,
        cScaleY: cScaleY.from,
      },
      to: {
        phi: 1/5,
        cScaleY: cScaleY.to,
      },
      duration: 500,
      easing: 'easeOutExpo',
      step(state) {
        let r = 1 / Math.sin(state.phi * Math.PI);
        if (r > 1 / EPS) { r = 1 / EPS } else if (r < -1 / EPS) { r = -1 / EPS }
        $('#neta-material').setAttribute('radius', r);
        $('#come').setAttribute('scale', new Vector3(_cScale.X, state.cScaleY, _cScale.Z));
        $('#neta').setAttribute('position', new Vector3(_nPosition.X, _nPosition.Y - (cScaleY.from - state.cScaleY), _nPosition.Z));
      },
    })).then(() => {
      const cPosition = $('#come').getAttribute('position');
      const nPosition = $('#neta').getAttribute('position');
      let scaled = false;
      return Promise.all([tw({
        from: {
          y: 0,
        },
        to: {
          y: 3,
        },
        duration: 1000,
        easing: 'easeOutExpo',
        step(state) {
          if (state.y < (cScaleY.from - cScaleY.to)) {
            $('#come').setAttribute('scale', new Vector3(_cScale.X, cScaleY.to + state.y, _cScale.Z));
          } else if (!scaled) {
            $('#come').setAttribute('scale', new Vector3(_cScale.X, cScaleY.from, _cScale.Z));
            scaled = true;
          }
          if (scaled) {
            $('#come').setAttribute('position', new Vector3(cPosition.X, cPosition.Y + state.y - (cScaleY.from - cScaleY.to), cPosition.Z));
          }
          $('#neta').setAttribute('position', new Vector3(nPosition.X, nPosition.Y + state.y, nPosition.Z));
        },
      }), tw({
        from: {
          phi: 1/4,
        },
        to: {
          phi: -1/2,
        },
        duration: 500,
        easing: 'easeOutExpo',
        step(state) {
          let r = 1 / Math.sin(state.phi * Math.PI);
          if (r > 1 / EPS) { r = 1 / EPS } else if (r < -1 / EPS) { r = -1 / EPS }
          $('#neta-material').setAttribute('radius', r);
        },
      })].map(v => v()));
    }).then(() => {
      move();
    }).catch((e) => {
      console.error(e);
    });
  }

  move();
});
