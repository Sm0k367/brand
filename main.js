// --- EPIC TECH AI: AUDIO RESUME ENGINE ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
let progress = 0;
const speed = 0.00015;

// --- THREE.JS: THE ARCHITECTURE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('tunnel-canvas'), 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 1. Torus Knot Path (The "Twisty-Turny" Logic)
const knotCurve = new THREE.Curves.TorusKnotCurve(10, 3, 2, 3);
const tunnelGeom = new THREE.TubeGeometry(knotCurve, 250, 2.5, 20, true);
const tunnelMat = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    side: THREE.BackSide,
    wireframe: true,
    transparent: true,
    opacity: 0.2
});
const tunnel = new THREE.Mesh(tunnelGeom, tunnelMat);
scene.add(tunnel);

const light = new THREE.PointLight(0x00f2ff, 15, 40);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.1));

// --- AUDIO INTERFACE REPAIR ---
const audioUpload = document.getElementById('audio-upload');
const statusText = document.getElementById('upload-status');
const enterBtn = document.getElementById('enter-btn');

audioUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Create the audio element but don't play yet
        audio = new Audio(URL.createObjectURL(file));
        audio.crossOrigin = "anonymous"; 
        
        statusText.innerText = "SIGNAL SYNCED: " + file.name.substring(0, 15) + "...";
        statusText.style.color = "#00f2ff";
        enterBtn.classList.remove('hidden');
    }
});

enterBtn.addEventListener('click', async () => {
    // CRITICAL: Initialize AudioContext on user click
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume context (fixes Chrome/Safari silence)
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    if (!source) {
        source = audioContext.createMediaElementSource(audio);
        analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);
        analyzer.connect(audioContext.destination);
    }

    dataArray = new Uint8Array(analyzer.frequencyBinCount);

    gsap.to("#portal", { opacity: 0, duration: 2, onComplete: () => {
        document.getElementById('portal').style.display = 'none';
        document.getElementById('app').style.opacity = '1';
        document.getElementById('tunnel-canvas').style.pointerEvents = 'auto'; 
        
        // Play the audio
        audio.play();
        isPlaying = true;
    }});
});

// --- RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying && analyzer) {
        analyzer.getByteFrequencyData(dataArray);
        const bass = dataArray[2]; 
        const mid = dataArray[40];

        progress += speed + (bass / 30000);
        if (progress > 1) progress = 0;

        const pos = knotCurve.getPointAt(progress);
        const lookAtPos = knotCurve.getPointAt((progress + 0.01) % 1);

        camera.position.lerp(pos, 0.05);
        camera.lookAt(lookAtPos);
        light.position.copy(camera.position);

        const hue = (Date.now() * 0.00005) % 1;
        tunnelMat.color.setHSL(hue, 0.7, 0.5);
        light.color.setHSL(hue, 0.9, 0.6);

        tunnel.rotation.z += 0.001 + (mid / 5000);
        tunnelMat.opacity = 0.15 + (bass / 500);

        document.getElementById('freq-telemetry').innerText = `HZ: ${(bass * 4.32).toFixed(1)}`;
    }

    renderer.render(scene, camera);
}

animate();
