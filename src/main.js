const {Vector3, Quaternion} = require('grimoirejs-math').default;
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

function sleep(t) {
  return function() {
    return new Promise(function(resolve, reject) {
      setTimeout(resolve, t);
    });
  };
}

const EPS = Math.pow(10, -5);

gr(() => {
  const $ = gr('#canvas');
  const _cScale = $('.come').getAttribute('scale');
  const _cPosition = $('.come').getAttribute('position');
  const _nPosition = $('.neta').getAttribute('position');
  const _rotation = [];
  $('.sushi').forEach((n) => {
    _rotation.push(n.getAttribute('rotation'));
  });
  const _phi = -1/6;
  const _groupRotation = $('#sushi-group').getAttribute('rotation');
  let theta = 0;
  const cScale = {
    x: 0.3,
    y: -0.5,
    z: 0.3,
  };
  const alpha = {
    from: 0.9,
    to: 0.5,
  }
  const radius = {
    from: 0.35,
    to: 0.8,
  }

  function setRadius(phi) {
    let r = 1 / Math.sin(phi * Math.PI);
    if (r > 1 / EPS) { r = 1 / EPS } else if (r < -1 / EPS) { r = -1 / EPS }
    $('.neta-material').setAttribute('radius', r);
  }

  function setRotation(rotation, deg) {
    rotation.forEach((v, i) => {
      const q = Quaternion.multiply(v, Quaternion.angleAxis(deg * Math.PI / 180, new Vector3(0, 0, 1)));
      $('.sushi').get(i).setAttribute('rotation', q);
    });
  }

  setRadius(_phi);

  function move() {
    $('.come').setAttribute('scale', _cScale);
    $('.come').setAttribute('position', _cPosition);
    $('.neta').setAttribute('position', _nPosition);
    $('.sushi').setAttribute('rotation', _rotation);
    Promise.resolve().then(tw({
      from: {
        phi: _phi,
        cScaleX: _cScale.X,
        cScaleY: _cScale.Y,
        cScaleZ: _cScale.Z,
        rotation: 0,
      },
      to: {
        phi: 1/5,
        cScaleX: _cScale.X + cScale.x,
        cScaleY: _cScale.Y + cScale.y,
        cScaleZ: _cScale.Z + cScale.z,
        rotation: -20,
      },
      duration: 100,
      easing: 'easeOutExpo',
      step(state) {
        setRadius(state.phi);
        $('.come').setAttribute('scale', new Vector3(state.cScaleX, state.cScaleY, state.cScaleZ));
        $('.neta').setAttribute('position', new Vector3(_nPosition.X, _nPosition.Y - (_cScale.Y - state.cScaleY), _nPosition.Z));
        setRotation(_rotation, state.rotation);
      },
    })).then(() => {
      const cPosition = $('.come').getAttribute('position');
      const nPosition = $('.neta').getAttribute('position');
      const rotation = [];
      $('.sushi').forEach((n) => {
        rotation.push(n.getAttribute('rotation'));
      });
      const maxy = 3;
      let scaled = false;
      tw({
        from: {
          theta: 0,
        },
        to: {
          theta: 40,
        },
        duration: 800,
        easing: 'easeOutQuint',
        step(state) {
          const q = Quaternion.multiply(_groupRotation, Quaternion.angleAxis((theta + state.theta) * Math.PI / 180, new Vector3(0, 1, 0)));
          $('#sushi-group').setAttribute('rotation', q);
          $('#yuka-material').setAttribute('rot', -(theta + state.theta));
        },
      })().then(() => {
        theta += 40;
      });
      tw({
        from: {
          rotation: 0,
        },
        to: {
          rotation: 35,
        },
        duration: 800,
        easing: 'easeOutExpo',
        step(state) {
          setRotation(rotation, state.rotation);
        },
      })();
      return Promise.all([tw({
        from: {
          y: 0,
        },
        to: {
          y: 3,
        },
        duration: 600,
        easing: 'easeOutExpo',
        step(state) {
          if (state.y < (-cScale.y)) {
            const t = state.y / (-cScale.y);
            $('.come').setAttribute('scale', new Vector3(_cScale.X + cScale.x + t * (-cScale.x), _cScale.Y + cScale.y + state.y, _cScale.Z + cScale.z + t * (-cScale.z)));
          } else if (!scaled) {
            $('.come').setAttribute('scale', new Vector3(_cScale.X, _cScale.Y, _cScale.Z));
            scaled = true;
          }
          if (scaled) {
            $('.come').setAttribute('position', new Vector3(_cPosition.X, cPosition.Y + state.y - (-cScale.y), _cPosition.Z));
          }
          $('.neta').setAttribute('position', new Vector3(_nPosition.X, nPosition.Y + state.y, _nPosition.Z));
          $('#yuka-material').setAttribute('radius', radius.from + (radius.to - radius.from) * (state.y / 3));
          $('#yuka-material').setAttribute('alpha', alpha.from + (alpha.to - alpha.from) * (state.y / 3));
        },
      }), tw({
        from: {
          phi: 1/4,
        },
        to: {
          phi: -1/2,
        },
        duration: 300,
        easing: 'easeOutCubic',
        step(state) {
          setRadius(state.phi);
        },
      })].map(v => v()));
    }).then(() => {
      const cPosition = $('.come').getAttribute('position');
      const nPosition = $('.neta').getAttribute('position');
      return tw({
        from: {
          ny: nPosition.Y,
          cy: cPosition.Y,
          phi: -1/2,
        },
        to: {
          ny: _nPosition.Y,
          cy: _cPosition.Y,
          phi: _phi,
        },
        duration: 200,
        easing: 'easeInExpo',
        step(state) {
          setRadius(state.phi);
          $('#yuka-material').setAttribute('radius', radius.from + (radius.to - radius.from) * (-state.ny / (_nPosition.Y - nPosition.Y)));
          $('#yuka-material').setAttribute('alpha', alpha.from + (alpha.to - alpha.from) * (-state.ny / (_nPosition.Y - nPosition.Y)));
          $('.come').setAttribute('position', new Vector3(cPosition.X, state.cy, cPosition.Z));
          $('.neta').setAttribute('position', new Vector3(nPosition.X, state.ny, nPosition.Z));
        },
      })();
    }).then(() => {
      const rotation = [];
      $('.sushi').forEach((n) => {
        rotation.push(n.getAttribute('rotation'));
      });
      tw({
        from: {
          rotation: 0,
        },
        to: {
          rotation: -15,
        },
        duration: 150,
        easing: 'easeOutCirc',
        step(state) {
          setRotation(rotation, state.rotation);
        },
      })();
      return tw({
        from: {
          phi: _phi,
          cScaleX: _cScale.X,
          cScaleY: _cScale.Y,
          cScaleZ: _cScale.Z,
        },
        to: {
          phi: -1/8,
          cScaleX: _cScale.X + cScale.x / 2,
          cScaleY: _cScale.Y + cScale.y / 2,
          cScaleZ: _cScale.Z + cScale.z / 2,
        },
        duration: 100,
        easing: 'linear',
        step(state) {
          setRadius(state.phi);
          $('.come').setAttribute('scale', new Vector3(state.cScaleX, state.cScaleY, state.cScaleZ));
          $('.neta').setAttribute('position', new Vector3(_nPosition.X, _nPosition.Y - (_cScale.Y - state.cScaleY), _nPosition.Z));
        },
      })();
    }).then(() => {
      return tw({
        from: {
          phi: -1/8,
          cScaleX: _cScale.X + cScale.x / 2,
          cScaleY: _cScale.Y + cScale.y / 2,
          cScaleZ: _cScale.Z + cScale.z / 2,
        },
        to: {
          phi: _phi,
          cScaleX: _cScale.X,
          cScaleY: _cScale.Y,
          cScaleZ: _cScale.Z,
        },
        duration: 50,
        easing: 'linear',
        step(state) {
          setRadius(state.phi);
          $('.come').setAttribute('scale', new Vector3(state.cScaleX, state.cScaleY, state.cScaleZ));
          $('.neta').setAttribute('position', new Vector3(_nPosition.X, _nPosition.Y - (_cScale.Y - state.cScaleY), _nPosition.Z));
        },
      })();
    }).then(sleep(400)).then(() => {
      move();
    }).catch((e) => {
      console.error(e);
    });
  }

  setTimeout(move, 1500);
});
