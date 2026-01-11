// --- EPIC TECH AI: CORE SYSTEM ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
const audioUpload = document.getElementById('audio-upload');
const dropZone = document.getElementById('drop-zone');
const enterBtn = document.getElementById('enter-btn');

// --- THREE.JS: THE K-LUME MORPH ENGINE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('liquid-canvas'), 
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// The Sovereign Geometry
const geometry = new THREE.IcosahedronGeometry(2, 64);
const originalPositions = geometry.attributes.position.array.slice();
const material = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    metalness: 1,
    roughness: 0.05,
    emissive: 0x001111
});
const blob = new THREE.Mesh(geometry, material);
scene.add(blob);

// Lighting: Cinematic Saturation
const light1 = new THREE.PointLight(0x00f2ff, 2, 50);
light1.position.set(5, 5, 5);
scene.add(light1);
const light2 = new THREE.PointLight(0xff00ff, 1, 50);
light2.position.set(-5, -5, 2);
scene.add(light2);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
camera.position.z = 5;

// --- FILE INTERCEPTION & INJECTION ---
dropZone.addEventListener('click', () => audioUpload.click());
audioUpload.addEventListener('change', handleFile);

function handleFile(e) {
    const file = e.target.files[0] || e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
        document.getElementById('upload-status').innerText = `SYSTEM ARMED: ${file.name.toUpperCase()}`;
        dropZone.classList.add('hidden');
        enterBtn.classList.remove('hidden');
        const url = URL.createObjectURL(file);
        audio = new Audio(url);
    }
}

// --- INITIALIZE OVERRIDE ---
enterBtn.addEventListener('click', () => {
    console.log("%c EPIC TECH AI // COMMUNITY ID: 1763463136298807762 ", "background: #00f2ff; color: #000; font-weight: bold;");
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audio);
    analyzer = audioContext.createAnalyser();
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    analyzer.fftSize = 512;
    dataArray = new Uint8Array(analyzer.frequencyBinCount);

    gsap.to("#portal", { opacity: 0, duration: 1.5, onComplete: () => {
        document.getElementById('portal').style.display = 'none';
        document.getElementById('app').style.opacity = '1';
        audio.play();
        isPlaying = true;
        
        // Initial Lyric Sync
        document.getElementById('active-lyric').innerText = "EPIC TECH OVERRIDE: ACTIVE";
        setTimeout(() => { document.getElementById('active-lyric').innerText = ""; }, 3000);
    }});
});

// --- RENDER & CHAOS LOGIC ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying && analyzer) {
        analyzer.getByteFrequencyData(dataArray);
        
        const bass = dataArray[2]; 
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;

        // Geometric Chaos Morphing
        const positions = geometry.attributes.position.array;
        const time = Date.now() * 0.001;
        for (let i = 0; i < positions.length; i += 3) {
            const x = originalPositions[i];
            const y = originalPositions[i + 1];
            const z = originalPositions[i + 2];
            const noise = Math.sin(x * 1.2 + time) * Math.cos(y * 1.2 + time) * (bass / 45);
            positions[i] = x + (x * noise);
            positions[i+1] = y + (y * noise);
            positions[i+2] = z + (z * noise);
        }
        geometry.attributes.position.needsUpdate = true;

        // Visual Feedback
        blob.rotation.y += 0.005 + (avg / 1000);
        light1.intensity = 1 + (bass / 60);
        document.getElementById('freq-telemetry').innerText = `HZ: ${Math.round(avg * 4.32)} | FEED: X.COM/SM0KEN420`;

        if (bass > 225) {
            document.body.classList.add('glitch-active');
            material.emissive.setHex(0xff00ff);
        } else {
            document.body.classList.remove('glitch-active');
            material.emissive.setHex(0x001111);
        }
    } else {
        blob.rotation.y += 0.001; // Idle Chill
    }

    renderer.render(scene, camera);
}

// --- WINDOW LOGIC ---
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
