import { FilesetResolver, LlmInference } from "https://jsdelivr.net";

let llmInference;
let recognition;
const subtitleLayer = document.getElementById('subtitle-layer');
const startBtn = document.getElementById('start-btn');
const langSelect = document.getElementById('language-select');

// 1. SMART AI INITIALIZATION (Bina kisi API key ke)
async function initAI() {
    try {
        subtitleLayer.innerText = "Connecting to Global Brain... (Loading AI Model 1.5GB)";
        
        const genai = await FilesetResolver.forGenAiTasks("https://jsdelivr.net/wasm");
        
        // Strategy: Direct URL loading from Google Storage (Smart Hack)
        llmInference = await LlmInference.createFromOptions(genai, {
            baseOptions: {
                modelAssetPath: 'https://googleapis.com'
            },
            maxTokens: 128,
            temperature: 0.3 // Natural conversion ke liye balance
        });

        subtitleLayer.innerText = "AI System Active. Press Start to Dub.";
        startBtn.disabled = false;
    } catch (error) {
        console.error(error);
        subtitleLayer.innerText = "Error loading AI. Please check internet and refresh.";
    }
}

// 2. LIVE DUBBING LOGIC (Zero Latency Strategy)
function startLiveDubbing() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = langSelect.value; // User ki Mother Tongue
    recognition.interimResults = true;  // Bolte hi text dikhane ke liye
    recognition.continuous = true;

    recognition.onresult = async (event) => {
        const transcript = event.results[event.resultIndex].transcript;
        
        // UI Pe Real-time subtitles dikhayein
        subtitleLayer.innerText = transcript;

        // Jaise hi sentence pura ho, Gemma se translate karwayein
        if (event.results[event.resultIndex].isFinal) {
            processAndDub(transcript);
        }
    };

    recognition.start();
    startCamera();
    startBtn.innerText = "System Live 🟢";
}

// 3. HUMAN TOUCH TRANSLATION & VOICE OVERLAY
async function processAndDub(text) {
    // Gemma Prompt Strategy: Sirf word nahi, emotion translate karein
    const prompt = `Act as a live conversational translator. Translate this ${langSelect.value} speech to natural English for a talent showcase: "${text}". Keep it friendly and concise.`;
    
    const response = await llmInference.generateResponse(prompt);
    
    // Voice Synthesis (Dubbing Effect)
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(response);
    
    // Voices settings for Human-like feel
    utterance.lang = 'en-US';
    utterance.rate = 1.0; 
    utterance.pitch = 1.1; 

    // Strategy: Original volume kam karke AI voice ko upar rakhna (Ducking)
    synth.speak(utterance);
}

// 4. CAMERA ACCESS
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    document.getElementById('localVideo').srcObject = stream;
}

// Event Listeners
startBtn.addEventListener('click', startLiveDubbing);

// Website load hote hi AI engine start karein
window.onload = initAI;
