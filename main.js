// --- SYSTEM CONFIG ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
const audioUpload = document.getElementById('audio-upload');
const dropZone = document.getElementById('drop-zone');
const enterBtn = document.getElementById('enter-btn');

// --- THREE.JS ENGINE: THE K-LUME CORE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('liquid-canvas'), 
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Geometry: The Sovereign Blob
const geometry = new THREE.IcosahedronGeometry(2, 64);
const originalPositions = geometry.attributes.position.array.slice(); // Copy for chaos morphing
const material = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    metalness: 1,
    roughness: 0.05,
    emissive: 0x001111,
    envMapIntensity: 2
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

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
camera.position.z = 5;

// --- FILE INTERCEPTOR ---
dropZone.addEventListener('click', () => audioUpload.click());
audioUpload.addEventListener('change', handleFile);
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = "#00f2ff"; });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFile({ target: { files: e.dataTransfer.files } });
});

function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('upload-status').innerText = `SYSTEM ARMED: ${file.name}`;
        dropZone.classList.add('hidden');
        enterBtn.classList.remove('hidden');
        const url = URL.createObjectURL(file);
        audio = new Audio(url);
    }
}

// --- OVERRIDE INITIALIZATION ---
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

// --- THE CHAOS MORPHING LOGIC ---
function updateGeometry(bassIntensity) {
    const positions = geometry.attributes.position.array;
    const time = Date.now() * 0.001;

    for (let i = 0; i < positions.length; i += 3) {
        const x = originalPositions[i];
        const y = originalPositions[i + 1];
        const z = originalPositions[i + 2];
        
        // Simulating "Creative Chaos" via Simplex-style noise math
        const noise = Math.sin(x * 1.5 + time) * Math.cos(y * 1.5 + time) * (bassIntensity / 50);
        
        positions[i] = x + (x * noise);
        positions[i+1] = y + (y * noise);
        positions[i+2] = z + (z * noise);
    }
    geometry.attributes.position.needsUpdate = true;
}

// --- MAIN RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying && analyzer) {
        analyzer.getByteFrequencyData(dataArray);
        
        const bass = dataArray[2]; // G-Funk sub-frequency
        const treble = dataArray[100]; // High-end sine whines
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;

        // Visual Synchronization
        blob.rotation.y += 0.005 + (avg / 1000);
        blob.rotation.z += 0.002;
        
        updateGeometry(bass); // Trigger Chaos Morphing

        // Dynamic Lighting
        light1.intensity = 1 + (bass / 50);
        document.getElementById('freq-telemetry').innerText = `HZ: ${Math.round(avg * 4.32)} | CHAOS_LEVEL: ${Math.round(bass)}`;

        // Glitch Trigger for Heavy Hits
        if (bass > 220) {
            document.body.classList.add('glitch-active');
            material.color.setHex(0xff00ff); // Shift to Magenta on drops
        } else {
            document.body.classList.remove('glitch-active');
            material.color.setHex(0x00f2ff); // Return to Cyan
        }
    } else {
        blob.rotation.y += 0.001; // Chilling mode
    }

    renderer.render(scene, camera);
}

// --- GLOBAL CONTROLS ---
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
