// --- CORE CONFIGURATION ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
const audioUpload = document.getElementById('audio-upload');
const dropZone = document.getElementById('drop-zone');
const enterBtn = document.getElementById('enter-btn');

// --- THREE.JS ENGINE (K-LUME VISUALS) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('liquid-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Liquid Metal Geometry
const geometry = new THREE.IcosahedronGeometry(2, 64);
const material = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    metalness: 1,
    roughness: 0.1,
    emissive: 0x002222
});
const blob = new THREE.Mesh(geometry, material);
scene.add(blob);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040, 2));
camera.position.z = 5;

// --- UPLOAD LOGIC ---
dropZone.addEventListener('click', () => audioUpload.click());

audioUpload.addEventListener('change', handleFile);
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = "#00f2ff"; });
dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = "#374151"; });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFile({ target: { files: e.dataTransfer.files } });
});

function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('upload-status').innerText = `READY: ${file.name}`;
        document.getElementById('file-name').innerText = file.name;
        dropZone.classList.add('hidden');
        enterBtn.classList.remove('hidden');
        
        // Create Blob URL for the audio
        const url = URL.createObjectURL(file);
        audio = new Audio(url);
    }
}

// --- INITIALIZE NEURAL LINK ---
enterBtn.addEventListener('click', () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audio);
    analyzer = audioContext.createAnalyser();
    
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    analyzer.fftSize = 256;
    dataArray = new Uint8Array(analyzer.frequencyBinCount);

    gsap.to("#portal", { opacity: 0, duration: 1, onComplete: () => {
        document.getElementById('portal').style.display = 'none';
        document.getElementById('app').style.opacity = '1';
        audio.play();
        isPlaying = true;
    }});
});

// --- ANIMATION & FREQUENCY SYNC ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying && analyzer) {
        analyzer.getByteFrequencyData(dataArray);
        
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const bass = dataArray[2]; // Focus on the Moog frequency
        const mid = dataArray[40];

        // Kinetic Distortion
        const scale = 1 + (avg / 120);
        blob.scale.set(scale, scale, scale);
        blob.rotation.y += 0.01 + (avg / 500);
        
        // Telemetry Update
        document.getElementById('freq-telemetry').innerText = `HZ: ${Math.round(avg * 4.32)}`;

        // Chrome-Valve Color Shifting
        material.emissive.setHSL(0.5 + (mid / 512), 1, bass / 512);

        // Visual Pulse Glitch
        if (bass > 215) {
            document.body.classList.add('glitch-active');
        } else {
            document.body.classList.remove('glitch-active');
        }
    } else {
        blob.rotation.y += 0.002; // Idle drift
    }

    renderer.render(scene, camera);
}

// --- CONTROLS ---
document.getElementById('audio-toggle').addEventListener('click', () => {
    if (isPlaying) { audio.pause(); } else { audio.play(); }
    isPlaying = !isPlaying;
    document.getElementById('audio-toggle').innerText = isPlaying ? "Pause Signal" : "Resume Signal";
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
