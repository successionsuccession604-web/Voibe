let myPeer;
let localStream;
let currentMode = 'video';
const subtitleLayer = document.getElementById('subtitle-layer');
const statusBtn = document.getElementById('status-bar');

// 1. Initialize PeerJS (Error erase karne ke liye)
function initPeer() {
    myPeer = new Peer();
    myPeer.on('open', (id) => {
        statusBtn.innerText = "Your ID: " + id;
        statusBtn.style.color = "#38bdf8";
    });
    myPeer.on('error', () => {
        statusBtn.innerText = "Server Error. Refreshing...";
    });
}

// 2. Global Functions (Buttons ke liye)
window.setMode = function(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    subtitleLayer.innerText = mode.toUpperCase() + " Mode Selected.";
};

window.initMedia = async function() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: currentMode !== 'audio',
            audio: true
        });
        document.getElementById('localVideo').srcObject = localStream;
        subtitleLayer.innerText = "System Ready! Paste ID and Connect.";
    } catch (e) {
        subtitleLayer.innerText = "Mic/Camera Permission Denied.";
    }
};

// 3. Connection & Two-Way Dubbing
document.getElementById('call-btn').onclick = () => {
    const rId = document.getElementById('remote-id').value;
    if(!rId) return alert("Partner's ID missing!");
    
    const call = myPeer.call(rId, localStream);
    const conn = myPeer.connect(rId);
    setupComm(call, conn);
};

myPeer.on('call', (call) => {
    call.answer(localStream);
    myPeer.on('connection', (conn) => setupComm(call, conn));
});

function setupComm(call, conn) {
    call.on('stream', rStream => {
        document.getElementById('remoteVideo').srcObject = rStream;
    });

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = document.getElementById('my-lang').value;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        const text = event.results[event.resultIndex].transcript;
        subtitleLayer.innerText = text;
        if(event.results[event.resultIndex].isFinal) conn.send(text);
    };

    conn.on('data', (data) => {
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(data);
        utter.lang = document.getElementById('my-lang').value; 
        synth.speak(utter);
    });

    recognition.start();
}

initPeer(); // Page load par ID generate karein
