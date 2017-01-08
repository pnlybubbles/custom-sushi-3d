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
    width: 3,
    offset: 0,
    margin: 5,
    rotation: 20,
    activePicker: null,
    attrs: {},
    href: document.location.href,
    tipsVisibility: false,
  },
  created() {
    gr(() => {
      this.cvs = gr('#canvas');
      this.cvs('goml').on('asset-load-completed', this.applyHash.bind(this));
    });
    window.addEventListener('hashchange', () => {
      this.href = document.location.href;
    });
  },
  computed: {
    shareUrl() {
      const comp = {
        url: this.href,
        text: 'My Custom SUSHI 🍣',
      };
      return `https://twitter.com/share?${Object.keys(comp).map((k) => `${k}=${encodeURIComponent(comp[k])}`).join('&')}`;
    },
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
    },
    change(k, v) {
      if (['width', 'offset', 'margin', 'rotation'].includes(k)) {
        v = parseFloat(v);
      }
      this.attrs[k] = v;
      if (['width', 'offset', 'margin'].includes(k)) {
        v = v / 100;
      }
      this.cvs('.neta-material').setAttribute(k, v);
    },
    setHash() {
      document.location.hash = encodeURIComponent(Object.keys(this.attrs).map((k) => {
        return `${k}~${this.attrs[k].toString().replace(/\~/g, '')}`;
      }).join('~'));
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.tipsVisibility = true;
      this.timer = setTimeout(() => {
        this.tipsVisibility = false;
      }, 5000);
    },
    applyHash() {
      let obj = {};
      try {
        if (location.hash) {
          let k = null;
          const arr = decodeURIComponent(document.location.hash.substr(1)).split('~');
          for (let i = 0; i <= arr.length / 2 - 1; i++) {
            obj[arr[i * 2]] = arr[i * 2 + 1];
          }
        }
      } catch(e) {
        console.error(e);
      }
      console.log(obj);
      Object.keys(obj).forEach((k) => {
        if (['color', 'colorStripe'].includes(k)) {
          this[k] = {
            hex: obj[k],
            rgba: {
              r: parseInt(obj[k].slice(3, 5), 16),
              g: parseInt(obj[k].slice(5, 7), 16),
              b: parseInt(obj[k].slice(1, 3), 16),
              a: 1,
            },
            a: 1,
          };
        } else if (['width', 'offset', 'margin', 'rotation'].includes(k)) {
          this[k] = obj[k];
        } else {
          this.cvs('.neta-material').setAttribute(k, obj[k]); // nyan
        }
      });
    }
  },
  watch: {
    color(val) {
      this.change('color', val.hex);
    },
    colorStripe(val) {
      this.change('colorStripe', val.hex);
    },
    width(val) {
      this.change('width', val);
    },
    offset(val) {
      this.change('offset', val);
    },
    margin(val) {
      this.change('margin', val);
    },
    rotation(val) {
      this.change('rotation', val);
    },
  },
});
