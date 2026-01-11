// --- EPIC TECH AI: NEURAL FLOW ENGINE v3 ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
let chaosMode = false;
let progress = 0;
let baseSpeed = 0.0004; // Dampened for a "Floating" feel

// --- THREE.JS SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('tunnel-canvas'), 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 1. Create a Smooth Spiral Path (Spline)
const points = [];
for (let i = 0; i < 100; i++) {
    points.push(new THREE.Vector3(
        Math.sin(i * 0.15) * 3, 
        Math.cos(i * 0.15) * 3, 
        i * 8
    ));
}
const path = new THREE.CatmullRomCurve3(points);

// 2. Create the Liquid Tunnel
const tunnelGeom = new THREE.TubeGeometry(path, 300, 2.5, 32, false);
const tunnelMat = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    side: THREE.BackSide,
    wireframe: true,
    transparent: true,
    opacity: 0.2
});
const tunnel = new THREE.Mesh(tunnelGeom, tunnelMat);
scene.add(tunnel);

// 3. Floating Interactive Portals (The Art Gallery)
const portals = [];
const artImages = [
    'https://picsum.photos/id/10/600/400', 
    'https://picsum.photos/id/25/600/400',
    'https://picsum.photos/id/35/600/400'
];
const loader = new THREE.TextureLoader();

for (let i = 0; i < 12; i++) {
    const pGeom = new THREE.PlaneGeometry(2, 1.5);
    const pMat = new THREE.MeshBasicMaterial({ 
        map: loader.load(artImages[i % artImages.length]),
        transparent: true, 
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const portal = new THREE.Mesh(pGeom, pMat);
    
    // Position along the path with organic offset
    const p = path.getPoint(i / 12);
    portal.position.set(p.x + (Math.random()-0.5)*2, p.y + (Math.random()-0.5)*2, p.z);
    portal.lookAt(p.x, p.y, p.z + 10);
    
    scene.add(portal);
    portals.push(portal);
}

// Lighting: Soft Neural Glow
const light = new THREE.PointLight(0x00f2ff, 4, 30);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// --- INTERACTION: RAYCASTING ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousedown', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(portals);
    
    if (hits.length > 0) {
        // Pulse color on hit
        tunnelMat.color.setHSL(Math.random(), 0.8, 0.5);
        gsap.to(hits[0].object.scale, { x: 1.5, y: 1.5, duration: 0.4, yoyo: true, repeat: 1 });
    }
});

// --- AUDIO LOGIC ---
const audioUpload = document.getElementById('audio-upload');
const enterBtn = document.getElementById('enter-btn');

audioUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        audio = new Audio(URL.createObjectURL(file));
        enterBtn.classList.remove('hidden');
        document.getElementById('drop-zone').classList.add('hidden');
    }
});

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

// --- THE RENDER LOOP: SEAMLESS JOURNEY ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying) {
        analyzer.getByteFrequencyData(dataArray);
        const bass = dataArray[2];
        const mid = dataArray[40];

        // 1. Seamless Movement: Glide along the spline
        progress += (baseSpeed + (bass / 15000));
        if (progress > 0.95) progress = 0; // Seamless loop reset
        
        const camPos = path.getPointAt(progress);
        const lookAtPos = path.getPointAt((progress + 0.02) % 1);
        
        camera.position.copy(camPos);
        camera.lookAt(lookAtPos);
        light.position.copy(camPos);

        // 2. Liquid Color Cycle (HSL)
        const hue = (Date.now() * 0.00005) % 1;
        tunnelMat.color.setHSL(hue, 0.7, 0.5);
        light.color.setHSL(hue, 0.8, 0.5);

        // 3. Tunnel Rotation & Dynamics
        tunnel.rotation.z += 0.002 + (mid / 2000);
        tunnelMat.opacity = 0.1 + (bass / 400);

        // 4. Portal Floating Animation
        portals.forEach((p, idx) => {
            p.rotation.y += 0.005;
            p.position.y += Math.sin(Date.now() * 0.001 + idx) * 0.002;
        });

        // Telemetry Update
        document.getElementById('freq-telemetry').innerText = `HZ: ${(bass * 4.32).toFixed(2)}`;
        
        if (bass > 215) document.body.classList.add('glitch-active');
        else document.body.classList.remove('glitch-active');
    }

    renderer.render(scene, camera);
}

animate();
