// --- EPIC TECH AI: PHASE 2 OPERATIONAL ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
let chaosMode = false;

const audioUpload = document.getElementById('audio-upload');
const dropZone = document.getElementById('drop-zone');
const enterBtn = document.getElementById('enter-btn');
const chaosBtn = document.getElementById('chaos-btn');

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
const light2 = new THREE.PointLight(0xff00ff, 1.5, 50);
light2.position.set(-5, -5, 2);
scene.add(light2);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
camera.position.z = 5;

// --- CHAOS MODE TOGGLE ---
chaosBtn.addEventListener('click', () => {
    chaosMode = !chaosMode;
    chaosBtn.innerText = chaosMode ? "Chaos: ON" : "Chaos: OFF";
    chaosBtn.classList.toggle('btn-chaos-on');
    document.body.classList.toggle('chaos-active');
    
    // Visual Handshake
    if(chaosMode) {
        material.emissive.setHex(0x330033);
        document.getElementById('active-lyric').innerText = "SYSTEM_OVERLOAD: CHAOS_MODE_ACTIVE";
        setTimeout(() => { if(chaosMode) document.getElementById('active-lyric').innerText = ""; }, 2000);
    } else {
        material.emissive.setHex(0x001111);
        camera.position.set(0, 0, 5);
    }
});

// --- FILE INTERCEPTION ---
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
    }});
});

// --- RENDER & CHAOS LOGIC ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying && analyzer) {
        analyzer.getByteFrequencyData(dataArray);
        
        const bass = dataArray[2]; 
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const time = Date.now() * 0.001;

        // Geometric Chaos Morphing Logic
        const positions = geometry.attributes.position.array;
        const multiplier = chaosMode ? 4.5 : 1.2; // Chaos mode makes the spikes 4x bigger

        for (let i = 0; i < positions.length; i += 3) {
            const x = originalPositions[i];
            const y = originalPositions[i + 1];
            const z = originalPositions[i + 2];
            
            // Chaos Math: Combining sine waves for organic distortion
            const noise = Math.sin(x * multiplier + time) * Math.cos(y * multiplier + time) * (bass / 50);
            
            positions[i] = x + (x * noise);
            positions[i+1] = y + (y * noise);
            positions[i+2] = z + (z * noise);
        }
        geometry.attributes.position.needsUpdate = true;

        // Camera Shake if Chaos is Active
        if (chaosMode && bass > 150) {
            camera.position.x = (Math.random() - 0.5) * 0.1;
            camera.position.y = (Math.random() - 0.5) * 0.1;
        }

        // Visual Feedback
        blob.rotation.y += 0.005 + (avg / 1000);
        light1.intensity = 1 + (bass / 50);
        document.getElementById('freq-telemetry').innerText = `HZ: ${Math.round(avg * 4.32)} | CHAOS: ${chaosMode ? 'CRITICAL' : 'STABLE'}`;

        // Glitch Trigger
        if (bass > 210) {
            document.body.classList.add('glitch-active');
        } else {
            document.body.classList.remove('glitch-active');
        }
    } else {
        blob.rotation.y += 0.001;
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
