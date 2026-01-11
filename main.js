// --- EPIC TECH AI: TORUS KNOT JOURNEY ENGINE ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
let progress = 0;
let speed = 0.0003; // Ultra-smooth base speed

// --- THREE.JS: THE KNOT ARCHITECTURE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('tunnel-canvas'), 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 1. The Twisty Geometry: TorusKnot creates the " pretzel" path
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

// 2. The Path for the Camera
const cameraPath = new THREE.CatmullRomCurve3(
    tunnelGeom.parameters.path.getPoints(200)
);

// 3. Floating Art Portals (Seamlessly Blending)
const portals = [];
const textureLoader = new THREE.TextureLoader();
const images = [
    'https://picsum.photos/id/10/600/400',
    'https://picsum.photos/id/28/600/400',
    'https://picsum.photos/id/50/600/400'
];

for(let i = 0; i < 15; i++) {
    const pGeom = new THREE.PlaneGeometry(2, 1.2);
    const pMat = new THREE.MeshBasicMaterial({ 
        map: textureLoader.load(images[i % images.length]),
        transparent: true,
        opacity: 0, // Starts invisible, fades in later
        side: THREE.DoubleSide
    });
    const portal = new THREE.Mesh(pGeom, pMat);
    const pos = cameraPath.getPoint(i / 15);
    portal.position.set(pos.x + (Math.random()-0.5)*3, pos.y + (Math.random()-0.5)*3, pos.z);
    portal.lookAt(pos);
    scene.add(portal);
    portals.push(portal);
}

// Lighting: Glowing Path
const pLight = new THREE.PointLight(0x00f2ff, 10, 20);
scene.add(pLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.1));

// --- ENGINE LOGIC ---
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

// --- THE RENDER LOOP: SMOOTH JOURNEY ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying) {
        analyzer.getByteFrequencyData(dataArray);
        const bass = dataArray[2];

        // 1. Smooth Glide: Movement along the Knot
        progress += speed + (bass / 20000);
        if (progress > 1) progress = 0;

        const pos = cameraPath.getPointAt(progress);
        const lookAtPos = cameraPath.getPointAt((progress + 0.01) % 1);

        camera.position.lerp(pos, 0.1); // Smooth "leaning" into the turn
        camera.lookAt(lookAtPos);
        pLight.position.copy(camera.position);

        // 2. Liquid Colors: Ever-changing HSL hues
        const hue = (Date.now() * 0.00005) % 1;
        tunnelMat.color.setHSL(hue, 0.8, 0.5);
        pLight.color.setHSL(hue, 0.9, 0.6);

        // 3. Wall Reactions
        tunnel.rotation.z += 0.001;
        tunnelMat.opacity = 0.1 + (bass / 500);

        // 4. Portal Fade-In/Out
        portals.forEach(p => {
            const dist = p.position.distanceTo(camera.position);
            p.material.opacity = THREE.MathUtils.smoothstep(dist, 15, 5); // Fades in as you get close
            p.rotation.y += 0.005;
        });

        document.getElementById('freq-telemetry').innerText = `HZ: ${(bass * 4.32).toFixed(1)}`;
    }

    renderer.render(scene, camera);
}

animate();
