// --- EPIC TECH AI: MASTER REPAIR & FLOW ENGINE ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
let progress = 0;
let speed = 0.0002; // Slower for cinematic feel

// --- THREE.JS: THE KNOT ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('tunnel-canvas'), 
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Geometric Architecture: TorusKnot for the "Twisty" feel
const knotGeom = new THREE.TorusKnotGeometry(12, 3, 250, 25, 3, 4);
const points = [];
const posAttr = knotGeom.attributes.position;
for (let i = 0; i < posAttr.count; i += 2) {
    points.push(new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)));
}
const cameraPath = new THREE.CatmullRomCurve3(points);

const tunnelGeom = new THREE.TubeGeometry(cameraPath, 200, 3, 16, false);
const tunnelMat = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    side: THREE.BackSide,
    wireframe: true,
    transparent: true,
    opacity: 0.15
});
const tunnel = new THREE.Mesh(tunnelGeom, tunnelMat);
scene.add(tunnel);

const pLight = new THREE.PointLight(0x00f2ff, 15, 30);
scene.add(pLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.1));

// --- THE CLICK REPAIR LOGIC ---
const audioUpload = document.getElementById('audio-upload');
const dropZone = document.getElementById('drop-zone');
const enterBtn = document.getElementById('enter-btn');

// Force-trigger the input
dropZone.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("Portal Activated");
    audioUpload.click(); 
});

audioUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        audio = new Audio(URL.createObjectURL(file));
        dropZone.innerHTML = `<p class="text-[10px] text-cyan-400 font-bold uppercase tracking-widest animate-pulse">Neural Signal Synced</p>`;
        enterBtn.classList.remove('hidden');
    }
});

// Initialize Experience
enterBtn.addEventListener('click', () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audio);
    analyzer = audioContext.createAnalyser();
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    dataArray = new Uint8Array(analyzer.frequencyBinCount);

    gsap.to("#portal", { opacity: 0, duration: 2, onComplete: () => {
        document.getElementById('portal').style.display = 'none';
        document.getElementById('app').style.opacity = '1';
        audio.play();
        isPlaying = true;
    }});
});

// --- RENDER & MOTION ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying) {
        analyzer.getByteFrequencyData(dataArray);
        const bass = dataArray[2];

        // Smooth camera gliding
        progress += speed + (bass / 30000);
        if (progress > 1) progress = 0;

        const pos = cameraPath.getPointAt(progress);
        const lookAtPos = cameraPath.getPointAt((progress + 0.01) % 1);

        camera.position.lerp(pos, 0.05); // Smooth leaning
        camera.lookAt(lookAtPos);
        pLight.position.copy(camera.position);

        // Dynamic Color Morphing
        const hue = (Date.now() * 0.00003) % 1;
        tunnelMat.color.setHSL(hue, 0.8, 0.5);
        pLight.color.setHSL(hue, 1, 0.6);

        tunnel.rotation.z += 0.0005;
        tunnelMat.opacity = 0.1 + (bass / 600);
        
        document.getElementById('freq-telemetry').innerText = `HZ: ${(bass * 4.32).toFixed(1)}`;
    }

    renderer.render(scene, camera);
}

animate();
