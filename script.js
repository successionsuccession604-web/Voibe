// VOIBE LIGHTWEIGHT ENGINE
let recognition;
const subtitleLayer = document.getElementById('subtitle-layer');
const startBtn = document.getElementById('start-btn');
const langSelect = document.getElementById('language-select');

async function startVoibe() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = stream;
        
        startBtn.innerText = "System Live 🟢";
        subtitleLayer.innerText = "Listening to your talent...";

        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = langSelect.value;
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event) => {
            const transcript = event.results[event.resultIndex].transcript;
            subtitleLayer.innerText = transcript;

            if (event.results[event.resultIndex].isFinal) {
                // Instant Dubbing Strategy
                const synth = window.speechSynthesis;
                const utterance = new SpeechSynthesisUtterance(transcript);
                utterance.lang = 'en-US'; // Dubbing in English
                synth.speak(utterance);
            }
        };
        recognition.start();
    } catch (err) {
        subtitleLayer.innerText = "Mic/Camera error: " + err.message;
    }
}

startBtn.addEventListener('click', startVoibe);
