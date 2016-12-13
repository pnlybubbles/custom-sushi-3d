const gr = require('grimoirejs').default;
const {Quaternion, Matrix, Vector3} = require('grimoirejs-math').default;

gr.registerComponent('StareAt', {
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
  },
  $awake() {
    this._transform = this.node.getComponent('Transform');
  },
  $mount() {
    this.phi = 0;
    const d = this.node.getAttribute('position').subtractWith(this.getValue('center'));
    this.direction = d.normalized;
    this.distance = d.magnitude;
    this.baseRotation = this._transform.localRotation;
  },
  $update() {
    this.phi += 0.02;
    const rotateQuaternion = Quaternion.angleAxis(this.phi, this.getValue('axis'));
    const rotateMatrix = Matrix.rotationQuaternion(rotateQuaternion);
    const rotatedDirection = Matrix.transformNormal(rotateMatrix, this.direction);
    this._transform.localPosition = this.getValue('center').addWith(rotatedDirection.multiplyWith(this.distance));
    this._transform.localRotation = Quaternion.multiply(rotateQuaternion, this.baseRotation);
  },
});
