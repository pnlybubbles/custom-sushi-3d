const Vue = require('vue');

new Vue({
  el: '#twitter',
  data: {
    href: document.location.href,
  },
  created() {
    document.addEventListener('hashchange', () => {
      this.location = document.location.href;
    });
  },
  computed: {
    shareUrl() {
      const comp = {
        url: document.location.href,
        text: 'Sushi Pyon',
      };
      return `https://twitter.com/share?${Object.keys(comp).map((k) => `${k}=${encodeURIComponent(comp[k])}`).join('&')}`;
    }
  }
});
