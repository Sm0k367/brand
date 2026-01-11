// --- EPIC TECH AI: FLUID NEURAL ENGINE ---
let audioContext, analyzer, dataArray, source, audio;
let isPlaying = false;
let progress = 0;
let speed = 0.0002; 

// --- THREE.JS: THE TWISTY TUNNEL ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('tunnel-canvas'), 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create a complex Torus Knot path
const knot = new THREE.Curves.TorusKnotCurve(10, 3, 2, 3);
const tunnelGeom = new THREE.TubeGeometry(knot, 200, 2.5, 20, true);
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

// --- AUDIO UPLOAD HANDLING ---
const audioUpload = document.getElementById('audio-upload');
const statusText = document.getElementById('upload-status');
const enterBtn = document.getElementById('enter-btn');

audioUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        audio = new Audio(URL.createObjectURL(file));
        statusText.innerText = "SIGNAL SYNCED: " + file.name.substring(0, 15) + "...";
        statusText.classList.add('text-[#00f2ff]', 'font-bold');
        enterBtn.classList.remove('hidden');
    }
});

enterBtn.addEventListener('click', () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audio);
    analyzer = audioContext.createAnalyser();
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

// --- THE RENDER LOOP: SEAMLESS FLOW ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying) {
        analyzer.getByteFrequencyData(dataArray);
        const bass = dataArray[2];

        // Glide progress along the knot
        progress += speed + (bass / 25000);
        if (progress > 1) progress = 0;

        const pos = knot.getPointAt(progress);
        const lookAtPos = knot.getPointAt((progress + 0.01) % 1);

        // Smoothly move camera and light
        camera.position.lerp(pos, 0.05);
        camera.lookAt(lookAtPos);
        light.position.copy(camera.position);

        // Cycle Colors seamlessly using HSL
        const hue = (Date.now() * 0.00004) % 1;
        tunnelMat.color.setHSL(hue, 0.7, 0.5);
        light.color.setHSL(hue, 0.9, 0.6);

        // Tunnel dynamics
        tunnel.rotation.z += 0.001;
        tunnelMat.opacity = 0.1 + (bass / 600);
        
        document.getElementById('freq-telemetry').innerText = `HZ: ${(bass * 4.32).toFixed(1)}`;
    }

    renderer.render(scene, camera);
}

animate();
