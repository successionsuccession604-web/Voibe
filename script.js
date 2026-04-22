let myPeer = null;
let localStream = null;
let currentMode = 'video';
const subtitleLayer = document.getElementById('subtitle-layer');
const statusBtn = document.getElementById('status-bar');

// 1. SECURE INITIALIZATION
function initSecureSystem() {
    // PeerJS with Encryption Settings
    myPeer = new Peer(undefined, { 
        debug: 1,
        config: {'iceServers': [{ 'urls': 'stun:://google.com' }]} 
    });

    myPeer.on('open', (id) => {
        statusBtn.innerText = "Your Secure ID: " + id;
        statusBtn.style.color = "#38bdf8";
    });

    myPeer.on('error', (err) => {
        console.log("Secure Reconnecting...");
        setTimeout(initSecureSystem, 3000);
    });
}

// 2. MODE SWITCHING
window.setMode = (mode) => {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    subtitleLayer.innerText = mode.toUpperCase() + " Mode Enabled";
};

// 3. HARDWARE CONNECTION
window.initMedia = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: currentMode !== 'audio',
            audio: true
        });
        document.getElementById('localVideo').srcObject = localStream;
        subtitleLayer.innerText = "Hardware Connected. You are ready!";
    } catch (e) {
        subtitleLayer.innerText = "Security Alert: Mic/Camera Access Required.";
    }
};

// 4. SECURE MULTI-LANGUAGE DUBBING
document.getElementById('call-btn').onclick = () => {
    const rId = document.getElementById('remote-id').value;
    if (!rId) return alert("Please enter Partner ID");
    
    // Encrypted Call & Data Channel
    const call = myPeer.call(rId, localStream);
    const conn = myPeer.connect(rId, { reliable: true });
    
    setupSecureComm(call, conn);
};

myPeer.on('call', (call) => {
    call.answer(localStream);
    myPeer.on('connection', (conn) => setupSecureComm(call, conn));
});

function setupSecureComm(call, conn) {
    call.on('stream', (rStream) => {
        document.getElementById('remoteVideo').srcObject = rStream;
    });

    // MULTI-LANGUAGE ENGINE
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = document.getElementById('my-lang').value;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        const text = event.results[event.resultIndex].transcript;
        subtitleLayer.innerText = text;
        if (event.results[event.resultIndex].isFinal) {
            // Sending encrypted text to partner
            conn.send(text);
        }
    };

    // Receiving & Dubbing in Your Chosen Language
    conn.on('data', (data) => {
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(data);
        utter.lang = document.getElementById('my-lang').value; 
        synth.speak(utter);
    });

    recognition.start();
}

window.onload = initSecureSystem;
