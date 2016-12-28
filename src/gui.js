const gr = require('grimoirejs').default;

gr(() => {
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  gr('#canvas')('goml').first().getComponent('LoopManager').register((i) => {
    stats.begin();
  }, -100000000);
  gr('#canvas')('goml').first().getComponent('LoopManager').register((i) => {
    stats.end();
  }, 100000000);
  const gui = new dat.GUI();
  const vignetting = new Vignetting();
  const f1 = gui.addFolder('Vignetting');
  f1.add(vignetting, 'pass');
  f1.add(vignetting, 'spread', 0.01, 1.5);
  f1.add(vignetting, 'size', 0, 2);
  f1.add(vignetting, 'amp', 0, 3);
  f1.add(vignetting, 'speed', 0, 3);
  f1.open();
  const aberration = new Aberration();
  const f2 = gui.addFolder('Aberration');
  f2.add(aberration, 'pass');
  f2.add(aberration, 'power', 0, 5);
  f2.add(aberration, 'coef', 0, 20);
  f2.add(aberration, 'amp', 0, 3);
  f2.add(aberration, 'speed', 0, 3);
  f2.open();
  const fxaa = new Fxaa();
  const f3 = gui.addFolder('Fxaa');
  f3.add(fxaa, 'pass');
  f3.open();
  const hud = new Hud();
  const f4 = gui.addFolder('Hud');
  f4.add(hud, 'pass');
  f4.add(hud, 'size', 0, 2);
  f4.open();
});

class Vignetting {
  constructor() {
    this._spread = 0.9;
    this._size = 0.7;
    this._amp = 1.0;
    this._speed = 1.0;
    this._pass = false;
  }

  set pass(v) {
    gr('#canvas')('#vignetting').setAttribute('pass', v);
    this._pass = v;
  }

  get pass() {
    return this._pass;
  }

  set spread(v) {
    gr('#canvas')('#vignetting').setAttribute('spread', v);
    this._spread = v;
  }

  get spread() {
    return this._spread;
  }

  set size(v) {
    gr('#canvas')('#vignetting').setAttribute('size', v);
    this._size = v;
  }

  get size() {
    return this._size;
  }

  set amp(v) {
    gr('#canvas')('#vignetting').setAttribute('amp', v);
    this._amp = v;
  }

  get amp() {
    return this._amp;
  }

  set speed(v) {
    gr('#canvas')('#vignetting').setAttribute('speed', v);
    this._speed = v;
  }

  get speed() {
    return this._speed;
  }
}

class Aberration {
  constructor() {
    this._power = 2.0;
    this._coef = 3.4;
    this._amp = 1.0;
    this._speed = 1.0;
    this._pass = false;
  }

  set pass(v) {
    gr('#canvas')('#aberration').setAttribute('pass', v);
    this._pass = v;
  }

  get pass() {
    return this._pass;
  }

  set power(v) {
    gr('#canvas')('#aberration').setAttribute('power', v);
    this._power = v;
  }

  get power() {
    return this._power;
  }

  set coef(v) {
    gr('#canvas')('#aberration').setAttribute('coef', v);
    this._coef = v;
  }

  get coef() {
    return this._coef;
  }

  set amp(v) {
    gr('#canvas')('#aberration').setAttribute('amp', v);
    this._amp = v;
  }

  get amp() {
    return this._amp;
  }

  set speed(v) {
    gr('#canvas')('#aberration').setAttribute('speed', v);
    this._speed = v;
  }

  get speed() {
    return this._speed;
  }
}

class Hud {
  constructor() {
    this._pass = false;
    this._size = 1.0;
  }

  set pass(v) {
    gr('#canvas')('#hud').setAttribute('pass', v);
    this._pass = v;
  }

  get pass() {
    return this._pass;
  }

  set size(v) {
    gr('#canvas')('#hud').setAttribute('size', v);
    this._size = v;
  }

  get size() {
    return this._size;
  }
}

class Fxaa {
  constructor() {
    this._pass = false;
  }

  set pass(v) {
    gr('#canvas')('#fxaa').setAttribute('pass', v);
    this._pass = v;
  }

  get pass() {
    return this._pass;
  }
}
