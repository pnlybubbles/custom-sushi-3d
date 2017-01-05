const Vue = require('vue');
const {Chrome} = require('vue-color');

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

const defaultColorLR = {
  hex: "#DD2222",
  rgba: {
    r: 221,
    g: 34,
    b: 34,
    a: 1
  },
  a: 1,
};

const defaultColorFB = {
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
  hex: "#DD2222",
  rgba: {
    r: 221,
    g: 34,
    b: 34,
    a: 1
  },
  a: 1,
};

const defaultColorLRStripe = {
  hex: "#DD2222",
  rgba: {
    r: 221,
    g: 34,
    b: 34,
    a: 1
  },
  a: 1,
};

const defaultColorFBStripe = {
  hex: "#DD2222",
  rgba: {
    r: 221,
    g: 34,
    b: 34,
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
    colorLR: defaultColorLR,
    colorFB: defaultColorFB,
    colorStripe: defaultColorStripe,
    colorLRStripe: defaultColorLRStripe,
    colorFBStripe: defaultColorFBStripe,
    width: 0.05,
    offset: 0,
    margin: 0.07,
    rotation: 0,
    activePicker: null,
  },
  methods: {
    onChangeColor(val) {
      this.color = val;
    },
    onChangeColorLR(val) {
      this.colorLR = val;
    },
    onChangeColorFB(val) {
      this.colorFB = val;
    },
    onChangeColorStripe(val) {
      this.colorStripe = val;
    },
    onChangeColorLRStripe(val) {
      this.colorLRStripe = val;
    },
    onChangeColorFBStripe(val) {
      this.colorFBStripe = val;
    },
    picker(tag) {
      if (this.activePicker === tag) {
        this.activePicker = null;
      } else {
        this.activePicker = tag;
      }
    }
  }
});
