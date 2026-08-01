const BALLOON_MAX_COUNT = 45;
const BALLOON_SPAWN_INTERVAL_MS = 120;
const BALLOON_INITIAL_COUNT = 10;
const RESIZE_DEBOUNCE_MS = 150;

const DEL_APPEAR_DELAY_1 = 1500;
const DEL_APPEAR_DELAY_2 = 3500;
const DEL_APPEAR_DELAY_3 = 5000;

const VIEWER_UPDATE_INTERVAL_MS = 30000;
const CRINGE_UPDATE_INTERVAL_MS = 2000;
const CRINGE_MIN = 80;
const CRINGE_MAX = 200;

const CHAT_MAX_MESSAGES = 6;
const DRAG_SOUND_STOP_DELAY_MS = 120;
const WS_RECONNECT_DELAY_MS = 3000;

const sound = new Audio('sounds/video.mp3');
const yametaSound = new Audio('sounds/yameta.mp3');

const btn = document.getElementById('squareBtn');
const startContainer = document.getElementById('startContainer');
const dragImage = document.getElementById('dragImage');
const topInstruction = document.getElementById('topInstruction');

const linksContainer = document.getElementById('linksContainer');
const cringeMeter = document.getElementById('cringeMeter');
const onlineCounter = document.getElementById('onlineCounter');
const chatContainer = document.getElementById('chatContainer');

const del1 = document.getElementById('del1');
const del2 = document.getElementById('del2');
const del3 = document.getElementById('del3');
const del4 = document.getElementById('del4');

let isSequenceStarted = false;
let timeout1, timeout2, timeout3;

const canvas = document.getElementById('balloonsCanvas');
const ctx = canvas.getContext('2d');
const balloonsContainer = document.getElementById('balloonsContainer');

const balloonImg = new Image();
let isBalloonImgLoaded = false;
balloonImg.onload = () => {
    isBalloonImgLoaded = true;
};
balloonImg.src = 'images/shariki.png';

let particles = [];
let animationId;
let isBalloonsActive = false;
let spawnInterval = null;
let resizeTimer = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, RESIZE_DEBOUNCE_MS);
}

window.addEventListener('resize', onResize);
resizeCanvas();

class Particle {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 50 + Math.random() * 100;
        this.size = Math.random() * 80 + 50;
        this.speedY = Math.random() * 2.5 + 2;
        this.speedX = Math.random() * 1.5 - 0.75;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
    }

    isDead() {
        return this.y < -this.size * 2;
    }

    draw() {
        if (!isBalloonImgLoaded) return;
        ctx.drawImage(balloonImg, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
}

function spawnParticle() {
    if (particles.length < BALLOON_MAX_COUNT) {
        particles.push(new Particle());
    }
}

function startBalloons() {
    if (isBalloonsActive) return;
    isBalloonsActive = true;
    balloonsContainer.classList.add('show');

    particles = [];

    for (let i = 0; i < BALLOON_INITIAL_COUNT; i++) {
        particles.push(new Particle());
    }

    spawnInterval = setInterval(spawnParticle, BALLOON_SPAWN_INTERVAL_MS);

    animateBalloons();
}

function animateBalloons() {
    if (!isBalloonsActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();

        if (p.isDead()) {
            particles.splice(i, 1);
            continue;
        }

        p.draw();
    }

    animationId = requestAnimationFrame(animateBalloons);
}

function stopBalloons() {
    isBalloonsActive = false;
    cancelAnimationFrame(animationId);
    clearInterval(spawnInterval);
    balloonsContainer.classList.remove('show');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const channelName = "del1ght";
const chatTicker = document.getElementById("chatTicker");
const viewerCountSpan = document.getElementById("viewerCount");

let ws = null;
let wsReconnectTimer = null;

function connectChatSocket() {
    ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    ws.onopen = () => {
        ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
        ws.send("NICK justinfan12345");
        ws.send("JOIN #" + channelName);
    };

    ws.onmessage = (event) => {
        const data = event.data;

        if (data.startsWith("PING")) {
            ws.send("PONG :tmi.twitch.tv");
            return;
        }

        if (data.includes("PRIVMSG")) {
            const userMatch = data.match(/:([^!]+)!/);
            const username = userMatch ? userMatch[1] : "Аноним";
            const parts = data.split(" :");
            if (parts.length >= 3) {
                const messageText = parts.slice(2).join(" :").trim();
                if (chatTicker) chatTicker.style.display = 'none';
                addMessageToChat(username, messageText);
            }
        }
    };

    ws.onclose = () => {
        scheduleReconnect();
    };

    ws.onerror = () => {
        ws.close();
    };
}

function scheduleReconnect() {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = setTimeout(connectChatSocket, WS_RECONNECT_DELAY_MS);
}

connectChatSocket();

function addMessageToChat(username, text) {
    const messageElement = document.createElement("div");
    messageElement.className = "chat-message";

    const strong = document.createElement("strong");
    strong.textContent = username + ":";

    messageElement.appendChild(strong);
    messageElement.appendChild(document.createTextNode(" " + text));

    chatContainer.appendChild(messageElement);
    if (chatContainer.children.length > CHAT_MAX_MESSAGES) {
        chatContainer.removeChild(chatContainer.firstChild);
    }
}

function updateViewers() {
    fetch(`https://decapi.me/twitch/viewercount/${channelName}`)
        .then(response => response.text())
        .then(text => {
            if (!viewerCountSpan) return;

            const trimmed = text.trim();
            const count = parseInt(trimmed, 10);

            if (!isNaN(count)) {
                viewerCountSpan.textContent = count;
            } else {
                viewerCountSpan.textContent = "Стрим офлайн 😴";
            }
        })
        .catch(() => {
            viewerCountSpan.textContent = "🔴 Прямой эфир";
        });
}

updateViewers();
setInterval(updateViewers, VIEWER_UPDATE_INTERVAL_MS);

const cringeValue = document.getElementById("cringeValue");
const meterFill = document.getElementById("meterFill");

setInterval(() => {
    const randomCringe = Math.floor(Math.random() * (CRINGE_MAX - CRINGE_MIN + 1)) + CRINGE_MIN;
    if (cringeValue && meterFill) {
        cringeValue.textContent = randomCringe;
        const fillPercent = Math.min(randomCringe, 100);
        meterFill.style.width = fillPercent + "%";
    }
}, CRINGE_UPDATE_INTERVAL_MS);

btn.addEventListener('click', () => {
    sound.currentTime = 0;
    sound.play().catch(err => console.error(err));
    startBalloons();
});

sound.onended = () => {
    startContainer.classList.add('hidden');
    dragImage.classList.remove('hidden');
    topInstruction.classList.remove('hidden');
    stopBalloons();
};

function startDelSequence() {
    if (isSequenceStarted) return;
    isSequenceStarted = true;

    if (linksContainer) linksContainer.classList.add('hidden');
    if (cringeMeter) cringeMeter.classList.add('hidden');
    if (onlineCounter) onlineCounter.classList.add('hidden');
    if (chatContainer) chatContainer.classList.add('hidden');

    del1.classList.add('show');

    timeout1 = setTimeout(() => {
        del2.classList.add('show');
    }, DEL_APPEAR_DELAY_1);

    timeout2 = setTimeout(() => {
        del3.classList.add('show');
    }, DEL_APPEAR_DELAY_2);

    timeout3 = setTimeout(() => {
        del4.classList.add('show');
    }, DEL_APPEAR_DELAY_3);
}

let isDragging = false;
let offsetX, offsetY;
let stopTimer = null;
let isPlayingSound = false;

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

    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    dragImage.style.left = x + 'px';
    dragImage.style.top = y + 'px';

    if (!isPlayingSound) {
        isPlayingSound = true;
        yametaSound.play().catch(err => console.error(err));
    }

    clearTimeout(stopTimer);

    stopTimer = setTimeout(() => {
        if (isPlayingSound) {
            yametaSound.pause();
            isPlayingSound = false;
        }
    }, DRAG_SOUND_STOP_DELAY_MS);
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        clearTimeout(stopTimer);

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

        if (linksContainer) linksContainer.classList.remove('hidden');
        if (cringeMeter) cringeMeter.classList.remove('hidden');
        if (onlineCounter) onlineCounter.classList.remove('hidden');
        if (chatContainer) chatContainer.classList.remove('hidden');
    }
});