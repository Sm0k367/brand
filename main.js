// --- EPIC TECH AI: WORMHOLE ENGINE ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
let chaosMode = false;
let movementSpeed = 0.002;

const audioUpload = document.getElementById('audio-upload');
const dropZone = document.getElementById('drop-zone');
const enterBtn = document.getElementById('enter-btn');
const chaosBtn = document.getElementById('chaos-btn');

// --- THREE.JS: THE TUNNEL ARCHITECTURE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('tunnel-canvas'), 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 1. Create the Spiral Path
const points = [];
for (let i = 0; i < 100; i++) {
    points.push(new THREE.Vector3(
        Math.sin(i * 0.2) * 2, 
        Math.cos(i * 0.2) * 2, 
        i * 5
    ));
}
const path = new THREE.CatmullRomCurve3(points);

// 2. Create the Tunnel Mesh
const tunnelGeom = new THREE.TubeGeometry(path, 200, 1.5, 20, false);
const tunnelMat = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    side: THREE.BackSide, // Visible from the inside
    wireframe: true,
    transparent: true,
    opacity: 0.5
});
const tunnel = new THREE.Mesh(tunnelGeom, tunnelMat);
scene.add(tunnel);

// 3. Floating "Pictures" (Neural Portals)
const portals = [];
const portalCount = 15;
for(let i = 0; i < portalCount; i++) {
    const pGeom = new THREE.PlaneGeometry(1.5, 1);
    const pMat = new THREE.MeshBasicMaterial({ 
        color: 0xff00ff, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        wireframe: true // Visual placeholder for your "AI Art"
    });
    const portal = new THREE.Mesh(pGeom, pMat);
    
    // Position portals along the tunnel path
    const pos = path.getPoint(i / portalCount);
    portal.position.set(pos.x + (Math.random()-0.5), pos.y + (Math.random()-0.5), pos.z);
    portal.lookAt(0,0,0);
    scene.add(portal);
    portals.push(portal);
}

// Lighting
const pLight = new THREE.PointLight(0x00f2ff, 2, 20);
scene.add(pLight);
camera.position.z = 0;

// --- AUDIO INTERFACE ---
dropZone.addEventListener('click', () => audioUpload.click());
audioUpload.addEventListener('change', handleFile);

function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('enter-btn').classList.remove('hidden');
        dropZone.classList.add('hidden');
        audio = new Audio(URL.createObjectURL(file));
    }
}

enterBtn.addEventListener('click', () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audio);
    analyzer = audioContext.createAnalyser();
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    analyzer.fftSize = 256;
    dataArray = new Uint8Array(analyzer.frequencyBinCount);

    gsap.to("#portal", { opacity: 0, duration: 1.5, onComplete: () => {
        document.getElementById('portal').style.display = 'none';
        document.getElementById('app').style.opacity = '1';
        audio.play();
        isPlaying = true;
    }});
});

// Chaos Mode Toggle
chaosBtn.addEventListener('click', () => {
    chaosMode = !chaosMode;
    chaosBtn.innerText = chaosMode ? "Chaos: ON" : "Chaos: OFF";
    chaosBtn.classList.toggle('btn-chaos-on');
});

// --- RENDER LOOP (The Travel) ---
let progress = 0;
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying) {
        analyzer.getByteFrequencyData(dataArray);
        const bass = dataArray[2];
        const mid = dataArray[40];

        // 1. Move camera forward thru tunnel
        progress += (movementSpeed + (bass / 5000));
        if (progress > 1) progress = 0;
        
        const camPos = path.getPointAt(progress % 1);
        const lookAtPos = path.getPointAt((progress + 0.01) % 1);
        
        camera.position.copy(camPos);
        camera.lookAt(lookAtPos);
        pLight.position.copy(camPos);

        // 2. React Tunnel Walls to music
        tunnel.rotation.z += 0.01;
        tunnelMat.opacity = 0.2 + (bass / 512);
        
        // 3. Chaos Distortion
        if(chaosMode) {
            tunnel.scale.set(1 + Math.sin(Date.now()*0.01)*0.2, 1, 1);
            renderer.setClearColor(0x110011);
        } else {
            tunnel.scale.set(1,1,1);
            renderer.setClearColor(0x000000);
        }

        // 4. Glitch effects
        if (bass > 210) {
            document.body.classList.add('glitch-active');
        } else {
            document.body.classList.remove('glitch-active');
        }
    }

    renderer.render(scene, camera);
}

animate();
