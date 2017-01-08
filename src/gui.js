const gr = require('grimoirejs').default;

function toggleDebug(t) {
  if (t) {
    document.querySelector('body > .dg').style.display = 'block';
    document.querySelector('body > .st').style.display = 'block';
  } else {
    document.querySelector('body > .dg').style.display = 'none';
    document.querySelector('body > .st').style.display = 'none';
  }
}

let debug = false;
document.querySelector('#debug').addEventListener('click', () => {
  debug = !debug;
  toggleDebug(debug);
});

let $ = null;

gr(() => {
  $ = gr('#canvas');
  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.setAttribute('class', 'st');
  document.body.appendChild(stats.dom);
  $('goml').first().getComponent('LoopManager').register((i) => {
    stats.begin();
  }, -100000000);
  $('goml').first().getComponent('LoopManager').register((i) => {
    stats.end();
  }, 100000000);
  const gui = new dat.GUI();
  const general = new General();
  gui.add(general, 'mouse');
  gui.add(general, 'axis');
  gui.add(general, 'wireframe');
  gui.add(general, 'capture');
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
  f4.add(hud, 'size', 0, 4);
  f4.open();
  toggleDebug(debug);
});

class General {
  constructor() {
    this._mouse = false;
    this._axis = false;
    this._wireframe = false;
  }

  set mouse(v) {
    this._mouse = v;
    if (this._mouse) {
      $('camera').setAttribute('rotation', '0,0,0');
      $('camera').setAttribute('position', '0,0,30');
      $('camera').single().addComponent('MouseCameraControl', {
        distance: '30',
      });
    } else {
      $('camera').setAttribute('rotation', '-10,0,0');
      $('camera').setAttribute('position', '0,10,30');
      $('camera').single().removeComponent($('camera').single().getComponent("MouseCameraControl"));
    }
  }

  get mouse() {
    return this._mouse;
  }

  set axis(v) {
    this._axis = v;
    $('#axis').setAttribute('scale', this._axis ? 1 : 0);
  }

  get axis() {
    return this._axis;
  }

  set wireframe(v) {
    this._wireframe = v;
    $('.neta').setAttribute('targetBuffer', this._wireframe ? 'wireframe' : 'default');
    $('.come > mesh').setAttribute('targetBuffer', this._wireframe ? 'wireframe' : 'default');
  }

  get wireframe() {
    return this._wireframe;
  }

  capture() {
    const dataUrl = document.querySelector('#app canvas').toDataURL();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.style.display = 'none';
    a.setAttribute('download', `sushi_${+new Date()}.png`)
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

class Vignetting {
  constructor() {
    this._spread = 0.9;
    this._size = 0.7;
    this._amp = 1.0;
    this._speed = 1.0;
    this._pass = true;
  }

  set pass(v) {
    $('#vignetting').setAttribute('pass', v);
    this._pass = v;
  }

  get pass() {
    return this._pass;
  }

  set spread(v) {
    $('#vignetting').setAttribute('spread', v);
    this._spread = v;
  }

  get spread() {
    return this._spread;
  }

  set size(v) {
    $('#vignetting').setAttribute('size', v);
    this._size = v;
  }

  get size() {
    return this._size;
  }

  set amp(v) {
    $('#vignetting').setAttribute('amp', v);
    this._amp = v;
  }

  get amp() {
    return this._amp;
  }

  set speed(v) {
    $('#vignetting').setAttribute('speed', v);
    this._speed = v;
  }

  get speed() {
    return this._speed;
  }
}

class Aberration {
  constructor() {
    this._power = 2.4;
    this._coef = 2.7;
    this._amp = 1.0;
    this._speed = 1.0;
    this._pass = false;
    // disable aberration shader expect for Macintosh.
    // abberation shader is not working under: iphone, windows
    if (!window.navigator.userAgent.match(/macintosh/i)) {
      this.pass = true;
    }
  }

  set pass(v) {
    $('#aberration').setAttribute('pass', v);
    this._pass = v;
  }

  get pass() {
    return this._pass;
  }

  set power(v) {
    $('#aberration').setAttribute('power', v);
    this._power = v;
  }

  get power() {
    return this._power;
  }

  set coef(v) {
    $('#aberration').setAttribute('coef', v);
    this._coef = v;
  }

  get coef() {
    return this._coef;
  }

  set amp(v) {
    $('#aberration').setAttribute('amp', v);
    this._amp = v;
  }

  get amp() {
    return this._amp;
  }

  set speed(v) {
    $('#aberration').setAttribute('speed', v);
    this._speed = v;
  }

  get speed() {
    return this._speed;
  }
}

class Hud {
  constructor() {
    this._pass = false;
    this._size = 2.0;
  }

  set pass(v) {
    $('#hud').setAttribute('pass', v);
    this._pass = v;
  }

  get pass() {
    return this._pass;
  }

  set size(v) {
    $('#hud').setAttribute('size', v);
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
    $('#fxaa').setAttribute('pass', v);
    this._pass = v;
  }

  get pass() {
    return this._pass;
  }
}
