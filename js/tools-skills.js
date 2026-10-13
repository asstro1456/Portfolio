const depth = document.getElementById('layer-depth');
const stage = document.getElementById('layer-stage');
const depthValue = document.getElementById('layer-depth-value');
depth.addEventListener('input', () => {
  stage.style.setProperty('--separation', depth.valueAsNumber / 100);
  depthValue.value = `${depth.value}%`;
});

const play = document.getElementById('sprite-play');
const animation = document.getElementById('sprite-animation');
const still = document.getElementById('sprite-still');
play.addEventListener('click', () => {
  const playing = play.getAttribute('aria-pressed') !== 'true';
  animation.hidden = !playing;
  still.hidden = playing;
  play.setAttribute('aria-pressed', String(playing));
  play.textContent = playing ? '동작 멈추기' : 'GIF 재생';
});
