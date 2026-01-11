// --- EPIC TECH AI: NEURAL FLOW ENGINE (REPAIR VERSION) ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
let progress = 0;
let speed = 0.0003; 

// --- THREE.JS SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('tunnel-canvas'), 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 1. Geometry (Torus Knot Path)
const knotGeom = new THREE.TorusKnotGeometry(10, 3, 200, 20, 2, 3);
const tunnelGeom = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(knotGeom.attributes.position.array.slice(0, 300).map((v, i, a) => {
    if (i % 3 === 0) return new THREE.Vector3(a[i], a[i+1], a[i+2]);
}).filter(v => v)), 150, 2, 12, false);

const tunnelMat = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    side: THREE.BackSide,
    wireframe: true,
    transparent: true,
    opacity: 0.2
});
const tunnel = new THREE.Mesh(tunnelGeom, tunnelMat);
scene.add(tunnel);

const cameraPath = new THREE.CatmullRomCurve3(tunnelGeom.parameters.path.getPoints(200));
const pLight = new THREE.PointLight(0x00f2ff, 10, 20);
scene.add(pLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.1));

// --- CRITICAL REPAIR: AUDIO UPLOAD LOGIC ---
const audioUpload = document.getElementById('audio-upload');
const dropZone = document.getElementById('drop-zone');
const enterBtn = document.getElementById('enter-btn');

// ENSURE CLICKING THE BOX TRIGGERS THE INPUT
dropZone.addEventListener('click', () => {
    console.log("Portal Clicked: Opening File Explorer...");
    audioUpload.click();
});

// HANDLE FILE SELECTION
audioUpload.addEventListener('change', handleFile);

function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
        console.log("Signal Received: " + file.name);
        audio = new Audio(URL.createObjectURL(file));
        
        // UI Transition
        enterBtn.classList.remove('hidden');
        dropZone.innerHTML = `<p class="text-[10px] uppercase text-[#00f2ff]">SIGNAL LOADED: ${file.name.substring(0, 20)}...</p>`;
    }
}

// START THE JOURNEY
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

// --- RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);
    if (isPlaying) {
        analyzer.getByteFrequencyData(dataArray);
        const bass = dataArray[2];

        progress += speed + (bass / 20000);
        if (progress > 1) progress = 0;

        const pos = cameraPath.getPointAt(progress);
        const lookAtPos = cameraPath.getPointAt((progress + 0.01) % 1);

        camera.position.lerp(pos, 0.1);
        camera.lookAt(lookAtPos);
        pLight.position.copy(camera.position);

        const hue = (Date.now() * 0.00005) % 1;
        tunnelMat.color.setHSL(hue, 0.8, 0.5);
        pLight.color.setHSL(hue, 0.9, 0.6);

        tunnel.rotation.z += 0.001;
        tunnelMat.opacity = 0.1 + (bass / 500);

        document.getElementById('freq-telemetry').innerText = `HZ: ${(bass * 4.32).toFixed(1)}`;
    }
    renderer.render(scene, camera);
}
animate();
