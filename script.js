import { FilesetResolver, LlmInference } from "https://jsdelivr.net";

let llmInference;
const subtitleLayer = document.getElementById('subtitle-layer');
const startBtn = document.getElementById('start-btn');

async function initAI() {
    try {
        subtitleLayer.innerText = "Connecting... Please wait (1.5GB Model Loading)";
        
        // Versioin fix: 0.10.0 specify kiya hai reliability ke liye
        const genai = await FilesetResolver.forGenAiTasks("https://jsdelivr.net/wasm");
        
        llmInference = await LlmInference.createFromOptions(genai, {
            baseOptions: {
                modelAssetPath: 'https://googleapis.com'
            },
            maxTokens: 128,
            temperature: 0.3
        });

        subtitleLayer.innerText = "AI System Active. Press Start.";
        startBtn.disabled = false;
    } catch (error) {
        console.error("AI Error:", error);
        subtitleLayer.innerText = "Connection Failed. Please check internet and refresh.";
    }
}

// Baki ka purana logic (startLiveDubbing etc.) niche waisa hi rahega...
