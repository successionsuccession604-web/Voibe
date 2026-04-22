// VOIBE SMART ENGINE
let recognition;
const subtitleLayer = document.getElementById('subtitle-layer');
const startBtn = document.getElementById('start-btn');
const langSelect = document.getElementById('language-select');

// Step 1: Start Microphone & Camera
async function startVoibe() {
    try {
        startBtn.innerText = "System Live 🟢";
        startBtn.disabled = true;

        // Camera Setup
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = stream;

        // Speech Recognition Setup
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = langSelect.value;
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event) => {
            const transcript = event.results[event.resultIndex][0].transcript;
            subtitleLayer.innerText = transcript;

            if (event.results[event.resultIndex].isFinal) {
                translateAndSpeak(transcript);
            }
        };

        recognition.start();
    } catch (err) {
        subtitleLayer.innerText = "Mic/Camera Access Denied!";
    }
}

// Step 2: Smart Translation (No heavy download)
async function translateAndSpeak(text) {
    subtitleLayer.innerText = "Translating Talent...";
    
    // Yahan hum browser ka natural translation use kar rahe hain
    // Real-world deployment me yahan Gemini API call jayegi
    const targetLang = "en-US"; 
    
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text); // Basic test ke liye
    utterance.lang = targetLang;
    
    // Dubbing Logic
    utterance.pitch = 1.1;
    utterance.rate = 1.0;
    
    synth.speak(utterance);
}

startBtn.addEventListener('click', startVoibe);
