let myPeer = null;
let localStream = null;
let currentMode = 'video';
const subtitleLayer = document.getElementById('subtitle-layer');
const statusBtn = document.getElementById('status-bar');

// 1. SMART INITIALIZATION
window.onload = () => {
    try {
        myPeer = new Peer();
        
        myPeer.on('open', (id) => {
            statusBtn.innerText = "Your ID: " + id;
            statusBtn.style.color = "#38bdf8";
        });

        myPeer.on('call', (call) => {
            if (!localStream) {
                alert("Please click 'Start Live' first to enable your Mic/Camera!");
                return;
            }
            call.answer(localStream);
            setupCommunication(call);
        });

        myPeer.on('error', (err) => {
            console.error("Peer Error:", err);
            statusBtn.innerText = "Connection Weak. Retrying...";
        });
    } catch (e) {
        statusBtn.innerText = "System Error. Please Refresh.";
    }
};

// 2. GLOBAL BUTTON FUNCTIONS
window.setMode = (mode) => {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + mode)?.classList.add('active');
    subtitleLayer.innerText = mode.toUpperCase() + " Mode Selected";
};

window.initMedia = async () => {
    try {
        subtitleLayer.innerText = "Requesting Permissions...";
        localStream = await navigator.mediaDevices.getUserMedia({
            video: currentMode !== 'audio',
            audio: true
        });
        document.getElementById('localVideo').srcObject = localStream;
        subtitleLayer.innerText = "System Ready. Share your ID or paste partner's ID.";
    } catch (e) {
        subtitleLayer.innerText = "Permission Denied. Please allow Mic/Camera in browser settings.";
    }
};

// 3. SECURE CONNECTION LOGIC
document.getElementById('call-btn').onclick = () => {
    const rId = document.getElementById('remote-id').value;
    if (!rId || !myPeer) return alert("System not ready or ID missing!");
    
    const call = myPeer.call(rId, localStream);
    const conn = myPeer.connect(rId);
    setupCommunication(call, conn);
};

function setupCommunication(call, conn) {
    call?.on('stream', (rStream) => {
        const rVideo = document.getElementById('remoteVideo');
        if (rVideo) rVideo.srcObject = rStream;
    });

    // Smart Dubbing Sync
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = document.getElementById('my-lang').value;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        const text = event.results[event.resultIndex].transcript;
        subtitleLayer.innerText = text;
        if (event.results[event.resultIndex].isFinal && conn) {
            conn.send(text);
        }
    };

    // Jab data aaye tabhi bolna shuru karein (No Undefined Error)
    conn?.on('data', (data) => {
        if (data) {
            const synth = window.speechSynthesis;
            const utter = new SpeechSynthesisUtterance(data);
            utter.lang = document.getElementById('my-lang').value;
            synth.speak(utter);
        }
    });

    recognition.start();
}
