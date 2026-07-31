const sound = new Audio('sounds/video.mp3');
const yametaSound = new Audio('sounds/yameta.mp3');

const btn = document.getElementById('squareBtn');
const startContainer = document.getElementById('startContainer');
const dragImage = document.getElementById('dragImage');
const topInstruction = document.getElementById('topInstruction');

const del1 = document.getElementById('del1');
const del2 = document.getElementById('del2');
const del3 = document.getElementById('del3');
const del4 = document.getElementById('del4');

let isSequenceStarted = false;
let timeout1, timeout2, timeout3;

btn.addEventListener('click', () => {
  sound.currentTime = 0;
  sound.play().catch(err => {
    console.error("Ошибка воспроизведения первого звука:", err);
  });
});

sound.onended = () => {
  startContainer.classList.add('hidden');
  dragImage.classList.remove('hidden');
  topInstruction.classList.remove('hidden');
};

function startDelSequence() {
  if (isSequenceStarted) return;
  isSequenceStarted = true;

  del1.classList.add('show');

  timeout1 = setTimeout(() => {
    del2.classList.add('show');
  }, 2000);

  timeout2 = setTimeout(() => {
    del3.classList.add('show');
  }, 4000);

  timeout3 = setTimeout(() => {
    del4.classList.add('show');
  }, 6000);
}

let isDragging = false;
let offsetX, offsetY;
let stopTimer = null;
let isPlayingSound = false; // Флаг, чтобы понимать, играет ли звук прямо сейчас

dragImage.addEventListener('mousedown', (e) => {
  isDragging = true;

  const rect = dragImage.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  dragImage.style.transform = 'none';
  dragImage.style.left = rect.left + 'px';
  dragImage.style.top = rect.top + 'px';

  startDelSequence();
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  // 1. Двигаем картинку
  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;

  dragImage.style.left = x + 'px';
  dragImage.style.top = y + 'px';

  // 2. Если звук еще не играет — запускаем
  if (!isPlayingSound) {
    isPlayingSound = true;
    yametaSound.play().catch(err => console.error(err));
  }

  // 3. Каждый раз при движении сбрасываем таймер остановки
  clearTimeout(stopTimer);

  // 4. Если мышь остановилась больше чем на 120 миллисекунд — ставим на паузу (но позиция НЕ сбрасывается!)
  stopTimer = setTimeout(() => {
    if (isPlayingSound) {
      yametaSound.pause();
      isPlayingSound = false;
    }
  }, 120);
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    clearTimeout(stopTimer);
    
    // При отпускании мыши полностью глушим и сбрасываем звук
    yametaSound.pause();
    yametaSound.currentTime = 0;
    isPlayingSound = false;

    clearTimeout(timeout1);
    clearTimeout(timeout2);
    clearTimeout(timeout3);
    isSequenceStarted = false;

    del1.classList.remove('show');
    del2.classList.remove('show');
    del3.classList.remove('show');
    del4.classList.remove('show');
  }
});