const gr = require('grimoirejs').default;
const Tweenable = require('shifty');

gr(() => {
  gr('#canvas')('goml').on('asset-load-completed', () => {
    const body = document.querySelector('body');
    body.style.visibility = 'visible';
    (new Tweenable()).tween({
      from: {
        opacity: 0,
      },
      to: {
        opacity: 1,
      },
      duration: 2000,
      easing: 'easeInOutQuad',
      step(state) {
        body.style.opacity = state.opacity;
      },
    });
  });
});
