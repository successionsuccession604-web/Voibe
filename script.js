import { FilesetResolver, LlmInference } from "https://jsdelivr.net";

let llmInference;
const subtitleLayer = document.getElementById('subtitle-layer');
const startBtn = document.getElementById('start-btn');
const langSelect = document.getElementById('language-select');

// 1. Initialize Gemma (On-Device)
async function initAI() {
    subtitleLayer.innerText = "Loading AI Brain... Please wait.";
    const genai = await FilesetResolver.forGenAiTasks("https://jsdelivr.net/wasm");
    
    llmInference = await LlmInference.createFromOptions(genai, {
        baseOptions: {
            // Aapko Kaggle se model download karke apne repo me 'gemma.bin' naam se dalna hoga
            modelAssetPath: './gemma.bin' 
        },
        maxTokens: 100,
        temperature: 0.2
    });
    subtitleLayer.innerText = "AI Ready. Click Start.";
}

// 2. Start Speech Recognition & Dubbing
function startLiveDubbing() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = langSelect.value;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = async (event) => {
        const transcript = event.results[event.resultIndex][0].transcript;
        subtitleLayer.innerText = transcript;

        if (event.results[event.resultIndex].isFinal) {
            // Gemma Translation
            const response = await llmInference.generateResponse(
                `Translate this to English naturally: "${transcript}"`
            );
            
            // Voice Dubbing Output
            const synth = window.speechSynthesis;
            const utter = new SpeechSynthesisUtterance(response);
            utter.lang = 'en-US'; 
            synth.speak(utter);
        }
    };

    recognition.start();
    startVideo();
}

async function startVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    document.getElementById('localVideo').srcObject = stream;
}

startBtn.addEventListener('click', startLiveDubbing);
initAI();
