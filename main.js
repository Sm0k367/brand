// --- EPIC TECH AI: STABLE NEURAL FLOW ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
let progress = 0;
const speed = 0.0003; 

// --- THREE.JS: THE SMOOTH SPLINE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('tunnel-canvas'), 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 1. Generate a smooth, loopy 3D path
const points = [];
for (let i = 0; i <= 20; i++) {
    points.push(new THREE.Vector3(
        Math.sin(i * 0.8) * 8, 
        Math.cos(i * 0.5) * 8, 
        i * 15
    ));
}
const curve = new THREE.CatmullRomCurve3(points);
curve.closed = true;

// 2. Build the Tunnel around the path
const tunnelGeom = new THREE.TubeGeometry(curve, 100, 3, 16, true);
const tunnelMat = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    side: THREE.BackSide,
    wireframe: true,
    transparent: true,
    opacity: 0.2
});
const tunnel = new THREE.Mesh(tunnelGeom, tunnelMat);
scene.add(tunnel);

const light = new THREE.PointLight(0x00f2ff, 10, 40);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.1));

// --- AUDIO LOGIC ---
const audioUpload = document.getElementById('audio-upload');
const statusText = document.getElementById('status-text');
const enterBtn = document.getElementById('enter-btn');

audioUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        audio = new Audio(URL.createObjectURL(file));
        statusText.innerText = "SIGNAL DETECTED: " + file.name.substring(0, 15) + "...";
        statusText.style.color = "#00f2ff";
        enterBtn.classList.remove('hidden');
    }
});

enterBtn.addEventListener('click', async () => {
    // Force user-interaction resume
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();

    source = audioContext.createMediaElementSource(audio);
    analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    dataArray = new Uint8Array(analyzer.frequencyBinCount);

    gsap.to("#portal", { opacity: 0, duration: 1.5, onComplete: () => {
        document.getElementById('portal').style.display = 'none';
        document.getElementById('app').style.opacity = '1';
        audio.play();
        isPlaying = true;
    }});
});

// --- RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying) {
        analyzer.getByteFrequencyData(dataArray);
        const bass = dataArray[2];

        // 1. Glide movement
        progress += speed + (bass / 35000);
        if (progress > 1) progress = 0;

        const pos = curve.getPointAt(progress);
        const lookAtPos = curve.getPointAt((progress + 0.02) % 1);

        camera.position.copy(pos);
        camera.lookAt(lookAtPos);
        light.position.copy(pos);

        // 2. Visual Effects
        const hue = (Date.now() * 0.00005) % 1;
        tunnelMat.color.setHSL(hue, 0.8, 0.5);
        light.color.setHSL(hue, 0.9, 0.6);

        tunnelMat.opacity = 0.1 + (bass / 600);
        tunnel.rotation.z += 0.002;

        document.getElementById('freq-telemetry').innerText = `HZ: ${(bass * 4.32).toFixed(1)}`;
    }

    renderer.render(scene, camera);
}

animate();
