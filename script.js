const myPeer = new Peer(); 
let localStream;
let currentConn;

const subtitleLayer = document.getElementById('subtitle-layer');
const statusBtn = document.getElementById('status-bar');

// 1. Initialize Global ID
myPeer.on('open', (id) => {
    statusBtn.innerText = "Your Global ID: " + id;
    statusBtn.classList.add('ready');
});

// 2. Mic & Camera Access
navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
    localStream = stream;
    document.getElementById('localVideo').srcObject = stream;
}).catch(err => subtitleLayer.innerText = "Mic/Camera error: " + err.message);

// 3. Making a Global Call
document.getElementById('call-btn').onclick = () => {
    const remoteId = document.getElementById('remote-id').value;
    if(!remoteId) return alert("Please enter a valid ID");
    
    const call = myPeer.call(remoteId, localStream);
    const conn = myPeer.connect(remoteId);
    handleCommunication(call, conn);
};

// 4. Receiving a Global Call
myPeer.on('call', (call) => {
    call.answer(localStream);
    myPeer.on('connection', (conn) => {
        handleCommunication(call, conn);
    });
});

function handleCommunication(call, conn) {
    call.on('stream', (remoteStream) => {
        document.getElementById('remoteVideo').srcObject = remoteStream;
    });

    currentConn = conn;
    setupSpeechToDubbing(conn);
}

// 5. Live Dubbing Engine
function setupSpeechToDubbing(connection) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = document.getElementById('my-lang').value;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex].transcript;
        subtitleLayer.innerText = transcript;

        if (event.results[event.resultIndex].isFinal) {
            // Send original text to partner
            connection.send(transcript);
        }
    };

    // Jab partner se text aaye (Data Channel)
    connection.on('data', (data) => {
        dubbingOutput(data);
    });

    recognition.start();
}

// 6. Dubbing Voice Output
function dubbingOutput(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Yahan hum partner ki language detect karke usme bolenge
    utterance.lang = 'en-US'; // Default dubbing to English
    utterance.pitch = 1.1;
    utterance.rate = 1.0;

    synth.speak(utterance);
}

document.getElementById('start-btn').onclick = () => {
    subtitleLayer.innerText = "System Live. Start Speaking.";
};
