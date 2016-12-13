const gr = require('grimoirejs').default;
const {Quaternion, Matrix, Vector3} = require('grimoirejs-math').default;

gr.registerComponent('Wave', {
  attributes: {
    center: {
      defaultValue: '0, 0, 0',
      converter: 'Vector3',
    },
    axis: {
      defaultValue: '0, 1, 0',
      converter: 'Vector3',
    },
    speed: {
      defaultValue: 0.03,
      converter: 'Number',
    },
    coefficient: {
      defaultValue: 1,
      converter: 'Number',
    },
    amplitude: {
      defaultValue: 1,
      converter: 'Number',
    },
  },
  $awake() {
    this._transform = this.node.getComponent('Transform');
  },
  $mount() {
    this.t = 0;
    const d = this.node.getAttribute('position').subtractWith(this.getValue('center'));
    this.distance = d.magnitude;
    this.basePosition = this._transform.localPosition;
  },
  $update() {
    this.t += this.getValue('speed');
    this._transform.localPosition = this.basePosition
      .addWith(new Vector3(0, this.getValue('amplitude') * Math.sin(this.t + this.distance * this.getValue('coefficient')), 0));
  },
});
