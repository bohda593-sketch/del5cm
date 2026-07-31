const audioPath = "video.mp3";
const secondAudioPath = "yameta.mp3";

const btn = document.getElementById('squareBtn');
const dragImage = document.getElementById('dragImage');
const startText = document.getElementById('startText');
const topInstruction = document.getElementById('topInstruction');

const del1 = document.getElementById('del1');
const del2 = document.getElementById('del2');
const del3 = document.getElementById('del3');
const del4 = document.getElementById('del4');

const audio = new Audio(audioPath);
const secondAudio = new Audio(secondAudioPath);

let isSequenceStarted = false;
let timeout1, timeout2, timeout3;

// 1. Клик по первой кнопке
btn.addEventListener('click', () => {
  audio.currentTime = 0;
  audio.play().catch(err => {
    console.error("Ошибка воспроизведения первого звука:", err);
  });
});

// 2. Конец первого звука
audio.onended = () => {
  btn.classList.add('hidden');
  startText.classList.add('hidden');

  dragImage.classList.remove('hidden');
  topInstruction.classList.remove('hidden');
};

// Функция последовательного показа 4 картинок с интервалом в 2 секунды
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

// --- ЛОГИКА ПЕРЕТАСКИВАНИЯ И ЗАПУСКА ПОСЛЕДОВАТЕЛЬНОСТИ ---
let isDragging = false;
let offsetX, offsetY;

dragImage.addEventListener('mousedown', (e) => {
  isDragging = true;

  const rect = dragImage.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  dragImage.style.transform = 'none';
  dragImage.style.left = rect.left + 'px';
  dragImage.style.top = rect.top + 'px';

  // Запуск второго звука
  secondAudio.currentTime = 0;
  secondAudio.play().catch(err => {
    console.error("Ошибка воспроизведения второго звука:", err);
  });

  // Запуск цепочки появления картинок
  startDelSequence();

  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;

  dragImage.style.left = x + 'px';
  dragImage.style.top = y + 'px';
});

// Остановка звука и сброс последовательности при отпускании мыши
document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    secondAudio.pause();
    secondAudio.currentTime = 0;

    // Сбрасываем таймеры появления
    clearTimeout(timeout1);
    clearTimeout(timeout2);
    clearTimeout(timeout3);
    isSequenceStarted = false;

    // Скрываем фоновые картинки обратно
    del1.classList.remove('show');
    del2.classList.remove('show');
    del3.classList.remove('show');
    del4.classList.remove('show');
  }
});
