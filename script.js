let myPeer = null;
let localStream = null;

// 1. Peer Initializer with Retry (Smart Strategy)
function initPeer() {
    if (typeof Peer !== 'undefined') {
        myPeer = new Peer();
        
        myPeer.on('open', (id) => {
            document.getElementById('status-bar').innerText = "Your ID: " + id;
            document.getElementById('status-bar').style.color = "#38bdf8";
            console.log("System Online. ID:", id);
        });

        myPeer.on('error', (err) => {
            console.log("Connection Busy... Retrying.");
            setTimeout(initPeer, 3000);
        });
    } else {
        console.log("Library loading...");
        setTimeout(initPeer, 1000); // 1 second baad phir check karein
    }
}

// 2. Button Functions (Window Scope)
window.setMode = (mode) => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    document.getElementById('subtitle-layer').innerText = mode.toUpperCase() + " Mode On";
};

window.initMedia = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        document.getElementById('localVideo').srcObject = localStream;
        document.getElementById('subtitle-layer').innerText = "Hardware Active. Connect with Partner.";
    } catch (e) {
        alert("Please allow Camera/Mic access.");
    }
};

// 3. Call Connection
document.getElementById('call-btn').onclick = () => {
    const rId = document.getElementById('remote-id').value;
    if(!rId || !localStream) return alert("Please Start Live and Enter ID!");
    
    const call = myPeer.call(rId, localStream);
    const conn = myPeer.connect(rId);
    
    call.on('stream', (rStream) => {
        document.getElementById('remoteVideo').srcObject = rStream;
    });

    // Dubbing Start
    setupDubbing(conn);
};

myPeer?.on('call', (call) => {
    call.answer(localStream);
    myPeer.on('connection', (conn) => setupDubbing(conn));
});

function setupDubbing(conn) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = document.getElementById('my-lang').value;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        const text = event.results[event.resultIndex].transcript;
        document.getElementById('subtitle-layer').innerText = text;
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

// System Start
window.onload = initPeer;
