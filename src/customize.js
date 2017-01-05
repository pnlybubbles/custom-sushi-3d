const Vue = require('vue');
const {Chrome} = require('vue-color');
const gr = require('grimoirejs').default;

const defaultColor = {
  hex: "#DD2222",
  rgba: {
    r: 221,
    g: 34,
    b: 34,
    a: 1
  },
  a: 1,
};

const defaultColorStripe = {
  hex: "#DD5555",
  rgba: {
    r: 221,
    g: 85,
    b: 85,
    a: 1
  },
  a: 1,
};

new Vue({
  el: '#customize',
  components: {
    'chrome-picker': Chrome,
  },
  data: {
    color: defaultColor,
    colorStripe: defaultColorStripe,
    width: 0.01,
    offset: 0,
    margin: 0.05,
    rotation: 20,
    activePicker: null,
  },
  created() {
    gr(() => {
      this.cvs = gr('#canvas');
    });
  },
  methods: {
    onChangeColor(val) {
      this.color = val;
    },
    onChangeColorStripe(val) {
      this.colorStripe = val;
    },
    picker(tag, e) {
      if (e && e.path.some((elm) => {
        return Array.from(this.$el.querySelectorAll('.picker-wrap')).includes(elm);
      })) {
        return;
      }
      if (this.activePicker === tag) {
        this.activePicker = null;
      } else {
        this.activePicker = tag;
      }
    }
  },
  watch: {
    color(val) {
      this.cvs('.neta-material').setAttribute('color', val.hex);
    },
    colorStripe(val) {
      this.cvs('.neta-material').setAttribute('colorStripe', val.hex);
    },
    width(val) {
      this.cvs('.neta-material').setAttribute('width', val);
    },
    offset(val) {
      this.cvs('.neta-material').setAttribute('offset', val);
    },
    margin(val) {
      this.cvs('.neta-material').setAttribute('margin', val);
    },
    rotation(val) {
      this.cvs('.neta-material').setAttribute('rotation', val);
    },
  },
});
