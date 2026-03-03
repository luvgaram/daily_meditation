const config = {
    sounds: {
        rain: './audio/rain.mp3',
        forest: './audio/forest.mp3',
        ocean: './audio/ocean.mp3',
    },
    affirmations: [
        "I am calm and at peace.",
        "I am grounded and centered.",
        "I inhale peace and exhale stress.",
        "I am present in this moment.",
        "I am grateful for this day.",
        "I am worthy of love and happiness.",
    ],
};

// --- THEME SWITCHER ---
const themeButtons = document.querySelectorAll('.theme-selector button');
const body = document.body;
const meditationTimer = document.querySelector('meditation-timer');

function activateTheme(theme) {
    console.log(`Activating theme: ${theme}`);
    body.dataset.theme = theme;
    themeButtons.forEach(btn => {
        const isPressed = btn.dataset.theme === theme;
        btn.classList.toggle('active', isPressed);
        btn.setAttribute('aria-pressed', isPressed);
    });
    const primaryColor = getComputedStyle(body).getPropertyValue('--primary-color').trim();
    console.log(`Computed primary color for ${theme}: ${primaryColor}`);
    meditationTimer.setAttribute('primary-color', primaryColor);
}

themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        activateTheme(button.dataset.theme);
        // Stop any currently playing audio when theme changes
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
    });
});

// Set initial theme
activateTheme(body.dataset.theme || 'forest');


// --- INTERACTIVE BREATHING CIRCLE ---
const breathingCircle = document.querySelector('.breathing-circle');
document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) - 0.5;
    const y = (clientY / innerHeight) - 0.5;
    
    breathingCircle.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
});

// --- AUDIO & VISUALIZER ---
let audioContext;
let analyser;
let audioElements = {};
let currentAudio = null;
let isAudioInitialized = false; // Flag to prevent re-initialization
const singingBowl = new Audio('./audio/singing_bowl.mp3');

function initAudio() {
    if (isAudioInitialized) {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        return;
    }
    console.log('Initializing AudioContext for the first time...');
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.connect(audioContext.destination);

    for (const sound in config.sounds) {
        const audio = new Audio(config.sounds[sound]);
        audio.loop = true;
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        audioElements[sound] = audio;
    }
    
    isAudioInitialized = true; // Set flag to true after setup
    console.log('AudioContext initialized.');
    drawVisualizer();
}

const audioButtons = document.querySelectorAll('.audio-controls button');

audioButtons.forEach(button => {
    button.addEventListener('click', () => {
        // This will create the context on the first click and do nothing on subsequent clicks
        initAudio(); 
        
        const sound = button.dataset.sound;
        const selectedAudio = audioElements[sound];

        if (currentAudio && currentAudio === selectedAudio && !currentAudio.paused) {
            // If clicking the button of the currently playing sound, pause it
            currentAudio.pause();
            currentAudio = null;
        } else {
            // If a different sound is playing, pause it
            if (currentAudio && !currentAudio.paused) {
                currentAudio.pause();
            }
            // Play the new sound
            selectedAudio.play().catch(e => console.error("Error playing audio:", e));
            currentAudio = selectedAudio;
        }
    });
});


const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');
const bufferLength = 128;
const dataArray = new Uint8Array(bufferLength);

function drawVisualizer() {
    if (!analyser) return;
    requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        canvasCtx.fillStyle = `rgba(255, 255, 255, ${barHeight / 255})`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}


// --- MEDITATION TIMER ---
class MeditationTimer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.defaultDuration = 10 * 60;
        this.duration = this.defaultDuration;
        this.timer = null;
        this.isRunning = false;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --timer-primary-color: var(--primary-color, #4a6fa5);
                }
                #timer {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    color: inherit;
                }
                button {
                    background-color: transparent;
                    border: 1px solid currentColor;
                    color: inherit;
                    padding: 0.5rem 1rem;
                    margin: 0.25rem;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                button:hover {
                    background-color: var(--timer-primary-color);
                }
                #time-input {
                    width: 50px;
                    background-color: transparent;
                    border: 1px solid currentColor;
                    color: inherit;
                    padding: 0.5rem;
                    border-radius: 10px;
                    text-align: center;
                }
                label {
                    display: block;
                    margin-bottom: 0.5rem;
                }
            </style>
            <div id="timer">${this.formatTime(this.duration)}</div>
            <div>
                <button id="start">Start</button>
                <button id="pause">Pause</button>
                <button id="reset">Reset</button>
            </div>
            <div>
                <label for="time-input">Meditation Time:</label>
                <input type="number" id="time-input" min="1" value="10">
                <button id="set-time">Set Minutes</button>
            </div>
        `;

        this.timerEl = this.shadowRoot.querySelector('#timer');
        this.startBtn = this.shadowRoot.querySelector('#start');
        this.pauseBtn = this.shadowRoot.querySelector('#pause');
        this.resetBtn = this.shadowRoot.querySelector('#reset');
        this.timeInput = this.shadowRoot.querySelector('#time-input');
        this.setTimeBtn = this.shadowRoot.querySelector('#set-time');

        this.startBtn.addEventListener('click', this.start.bind(this));
        this.pauseBtn.addEventListener('click', this.pause.bind(this));
        this.resetBtn.addEventListener('click', this.reset.bind(this));
        this.setTimeBtn.addEventListener('click', this.setTime.bind(this));
    }

    static get observedAttributes() {
        return ['primary-color'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'primary-color') {
            this.style.setProperty('--timer-primary-color', newValue);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    start() {
        if (this.isRunning) return;
        singingBowl.play();
        this.isRunning = true;
        this.timer = setInterval(() => {
            this.duration--;
            this.timerEl.textContent = this.formatTime(this.duration);
            if (this.duration <= 0) {
                this.pause();
                this.onComplete();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timer);
    }

    reset() {
        this.pause();
        this.duration = this.defaultDuration;
        this.timerEl.textContent = this.formatTime(this.duration);
    }
    
    setTime() {
        const newTime = parseInt(this.timeInput.value, 10);
        if (isNaN(newTime) || newTime < 1) return;
        this.defaultDuration = newTime * 60;
        this.reset();
    }

    onComplete() {
        singingBowl.play();
        incrementSessionCount();
        showNotification();
    }
}

customElements.define('meditation-timer', MeditationTimer);

// --- NOTIFICATION ---
const notification = document.getElementById('notification');

function showNotification() {
    notification.setAttribute('aria-hidden', 'false');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
        notification.setAttribute('aria-hidden', 'true');
    }, 3000);
}


// --- PROGRESS TRACKER ---
const sessionCountEl = document.getElementById('session-count');
let sessionCount = 0;

function loadSessionCount() {
    if (typeof window !== 'undefined' && window.localStorage) {
        sessionCount = parseInt(localStorage.getItem('sessionCount') || '0', 10);
        sessionCountEl.textContent = sessionCount;
    }
}

function incrementSessionCount() {
    sessionCount++;
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sessionCount', sessionCount);
    }
    sessionCountEl.textContent = sessionCount;
}

loadSessionCount();


// --- AFFIRMATIONS ---
const affirmationEl = document.getElementById('affirmation');
const newAffirmationBtn = document.getElementById('new-affirmation');

function getNewAffirmation() {
    affirmationEl.textContent = config.affirmations[Math.floor(Math.random() * config.affirmations.length)];
}

newAffirmationBtn.addEventListener('click', getNewAffirmation);

getNewAffirmation();

// --- ZEN MODE ---
const zenModeBtn = document.getElementById('zen-mode');
zenModeBtn.addEventListener('click', () => {
    body.classList.toggle('zen');
    if (body.classList.contains('zen')) {
        zenModeBtn.textContent = 'Exit Zen Mode';
    } else {
        zenModeBtn.textContent = 'Zen Mode';
    }
});

// --- ABOUT SECTION ---
const aboutBtn = document.getElementById('about-btn');
const aboutSection = document.getElementById('about-section');
const closeAboutBtn = document.getElementById('close-about');

aboutBtn.addEventListener('click', () => {
    aboutSection.hidden = false;
    aboutSection.classList.add('show');
});

closeAboutBtn.addEventListener('click', () => {
    aboutSection.hidden = true;
    aboutSection.classList.remove('show');
});

aboutSection.addEventListener('click', (e) => {
    if (e.target === aboutSection) {
        aboutSection.hidden = true;
        aboutSection.classList.remove('show');
    }
});

// --- SPECIAL SESSION ---
const specialSessionBtn = document.getElementById('special-session-btn');

specialSessionBtn.addEventListener('click', async () => {
  try {
    // First, get the product ID from the local config
    const configResponse = await fetch('/config.json');
    if (!configResponse.ok) {
      throw new Error(`HTTP error! status: ${configResponse.status}`);
    }
    const localConfig = await configResponse.json();
    const { polarProductId } = localConfig;

    // Now, call our serverless function to create a checkout session
    const checkoutResponse = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: polarProductId }),
    });

    if (!checkoutResponse.ok) {
      const errorBody = await checkoutResponse.json();
      throw new Error(errorBody.error || 'Failed to create checkout session');
    }

    const { checkout_url } = await checkoutResponse.json();

    // Redirect the user to the Polar checkout page
    window.location.href = checkout_url;

  } catch (err) {
    console.error('Error during checkout:', err);
    alert(`Could not initiate payment. Please check the browser console for more details. Error: ${err.message}`);
  }
});

// --- PAYMENT SUCCESS NOTIFICATION ---
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('payment_success') && urlParams.get('payment_success') === 'true') {
    const notification = document.getElementById('payment-success-notification');
    notification.hidden = false;
    notification.classList.add('show');
  }
});

const closePaymentSuccessBtn = document.getElementById('close-payment-success');
if (closePaymentSuccessBtn) {
  closePaymentSuccessBtn.addEventListener('click', () => {
    const notification = document.getElementById('payment-success-notification');
    notification.hidden = true;
    notification.classList.remove('show');
    // Clean up the URL
    window.history.replaceState({}, document.title, window.location.pathname);
  });
}
