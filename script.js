let myPeer;
let localStream;
let currentMode = 'video';
const subtitleLayer = document.getElementById('subtitle-layer');
const statusBtn = document.getElementById('status-bar');

// 1. Initialize PeerJS with Global ID
myPeer = new Peer();

myPeer.on('open', (id) => {
    statusBtn.innerText = "Share Your ID: " + id;
    statusBtn.style.color = "#38bdf8";
});

myPeer.on('error', (err) => {
    console.error(err);
    statusBtn.innerText = "Connection Error. Refresh Page.";
});

// 2. Global Mode Switching Logic
window.setMode = function(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    
    const localBox = document.getElementById('local-box');
    const remoteBox = document.getElementById('remote-box');

    if(mode === 'audio') {
        localBox.style.display = 'none';
        remoteBox.style.display = 'none';
        subtitleLayer.innerText = "Audio Mode Active 🎤";
    } else {
        localBox.style.display = 'block';
        remoteBox.style.display = 'block';
        subtitleLayer.innerText = mode.toUpperCase() + " Mode Active";
    }
};

// 3. Global Media Access
window.initMedia = async function() {
    try {
        subtitleLayer.innerText = "Accessing Camera/Mic...";
        localStream = await navigator.mediaDevices.getUserMedia({
            video: currentMode !== 'audio',
            audio: true
        });
        document.getElementById('localVideo').srcObject = localStream;
        subtitleLayer.innerText = "Ready to Connect!";
    } catch (e) {
        console.error(e);
        subtitleLayer.innerText = "Permission Denied: Please allow Camera/Mic.";
    }
};

// 4. Calling & Receiving
document.getElementById('call-btn').onclick = () => {
    const rId = document.getElementById('remote-id').value;
    if(!rId) return alert("Please paste partner's ID");
    
    const call = myPeer.call(rId, localStream);
    const conn = myPeer.connect(rId);
    setupCommunication(call, conn);
};

myPeer.on('call', (call) => {
    call.answer(localStream);
    myPeer.on('connection', (conn) => setupCommunication(call, conn));
});

function setupCommunication(call, conn) {
    call.on('stream', rStream => {
        document.getElementById('remoteVideo').srcObject = rStream;
    });
    
    setupSpeech(conn);
    conn.on('data', data => dubbingOutput(data));
}

// 5. Speech to Dubbing Logic
function setupSpeech(connection) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = document.getElementById('my-lang').value;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        const text = event.results[event.resultIndex].transcript;
        subtitleLayer.innerText = text;
        if(event.results[event.resultIndex].isFinal) connection.send(text);
    };
    recognition.start();
}

function dubbingOutput(text) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US'; 
    synth.speak(utter);
}
