let myPeer = null;
let localStream = null;
let currentMode = 'video';
const subtitleLayer = document.getElementById('subtitle-layer');
const statusBtn = document.getElementById('status-bar');

// 1. SMART INITIALIZATION (Errors को रोकने के लिए)
window.onload = () => {
    try {
        // PeerJS setup with debug mode to see issues
        myPeer = new Peer(undefined, { debug: 1 });

        myPeer.on('open', (id) => {
            if (statusBtn) {
                statusBtn.innerText = "Your Secure ID: " + id;
                statusBtn.style.color = "#38bdf8";
            }
            console.log("Global Connection Established. ID:", id);
        });

        myPeer.on('call', (call) => {
            if (!localStream) {
                alert("Please click 'Start Live' first to enable Mic/Camera!");
                return;
            }
            call.answer(localStream);
            setupSecureCommunication(call);
        });

        myPeer.on('error', (err) => {
            console.error("Connection Error:", err.type);
            if (statusBtn) statusBtn.innerText = "Connecting to Secure Bridge...";
        });
    } catch (e) {
        console.error("System Init Error:", e);
    }
};

// 2. GLOBAL BUTTON LOGIC (window. se define kiya hai taaki HTML pehchan sake)
window.setMode = (mode) => {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + mode)?.classList.add('active');
    if (subtitleLayer) subtitleLayer.innerText = mode.toUpperCase() + " Mode Active";
};

window.initMedia = async () => {
    try {
        if (subtitleLayer) subtitleLayer.innerText = "Connecting to Hardware...";
        localStream = await navigator.mediaDevices.getUserMedia({
            video: currentMode !== 'audio',
            audio: true
        });
        const localVideo = document.getElementById('localVideo');
        if (localVideo) localVideo.srcObject = localStream;
        if (subtitleLayer) subtitleLayer.innerText = "Hardware Ready. Connect to Partner.";
    } catch (e) {
        if (subtitleLayer) subtitleLayer.innerText = "Security Alert: Permission Denied.";
    }
};

// 3. SECURE TWO-WAY DUBBING
document.getElementById('call-btn').onclick = () => {
    const rId = document.getElementById('remote-id')?.value;
    if (!rId || !myPeer) return alert("System not ready or Partner ID missing!");
    
    const call = myPeer.call(rId, localStream);
    const conn = myPeer.connect(rId);
    setupSecureCommunication(call, conn);
};

function setupSecureCommunication(call, conn) {
    call?.on('stream', (remoteStream) => {
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) remoteVideo.srcObject = remoteStream;
    });

    // Smart Recognition Logic
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = document.getElementById('my-lang')?.value || 'hi-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex].transcript;
        if (subtitleLayer) subtitleLayer.innerText = transcript;
        
        // Data send karein jab sentence khatam ho
        if (event.results[event.resultIndex].isFinal && conn) {
            conn.send(transcript);
        }
    };

    // Jab Partner se data mile (Two-Way Bridge)
    conn?.on('data', (data) => {
        if (data) {
            const synth = window.speechSynthesis;
            const utter = new SpeechSynthesisUtterance(data);
            utter.lang = document.getElementById('my-lang')?.value || 'en-US';
            synth.speak(utter);
        }
    });

    recognition.start();
}
