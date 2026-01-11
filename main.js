// --- CONFIGURATION ---
const AUDIO_URL = 'your-audio-file.mp3'; // Replace with your Suno v5 exported track
let audioContext, analyzer, dataArray, source;
let isPlaying = false;

// --- THREE.JS SETUP (The Liquid Metal) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('liquid-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Create the Liquid Metal Blob (Icosahedron)
const geometry = new THREE.IcosahedronGeometry(2, 64);
const material = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    wireframe: false,
    metalness: 1,
    roughness: 0.1,
    emissive: 0x002222
});
const blob = new THREE.Mesh(geometry, material);
scene.add(blob);

// Lighting for that "Chrome-Valve" look
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

camera.position.z = 5;

// --- AUDIO ANALYZER SETUP ---
const setupAudio = () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audio = new Audio(AUDIO_URL);
    audio.crossOrigin = "anonymous";
    source = audioContext.createMediaElementSource(audio);
    analyzer = audioContext.createAnalyser();
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    analyzer.fftSize = 256;
    dataArray = new Uint8Array(analyzer.frequencyBinCount);
    return audio;
};

const audio = setupAudio();

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying && analyzer) {
        analyzer.getByteFrequencyData(dataArray);
        
        // Get average frequency (Volume)
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const bass = dataArray[2]; // Focus on the low-end Moog bass

        // Distort the Liquid Metal based on audio
        const scale = 1 + (avg / 150);
        blob.scale.set(scale, scale, scale);
        blob.rotation.y += 0.01 + (avg / 1000);
        blob.rotation.x += 0.005;

        // Change color based on bass intensity
        material.emissive.setHSL(0.5, 1, bass / 512);

        // UI Glitch Trigger
        if (bass > 210) {
            document.body.classList.add('glitch-active');
        } else {
            document.body.classList.remove('glitch-active');
        }
    } else {
        // Idle motion
        blob.rotation.y += 0.002;
    }

    renderer.render(scene, camera);
}

// --- INTERACTION LOGIC ---
document.getElementById('enter-btn').addEventListener('click', () => {
    audioContext.resume().then(() => {
        gsap.to("#portal", { opacity: 0, duration: 1, onComplete: () => {
            document.getElementById('portal').style.display = 'none';
            document.getElementById('app').style.opacity = '1';
            audio.play();
            isPlaying = true;
            startLyricEngine();
        }});
    });
});

document.getElementById('audio-toggle').addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        document.getElementById('audio-toggle').innerText = "Resume Signal";
    } else {
        audio.play();
        document.getElementById('audio-toggle').innerText = "Pause Signal";
    }
    isPlaying = !isPlaying;
});

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- LYRIC ENGINE ---
const lyrics = [
    { time: 0, text: "System: Optimized." },
    { time: 4, text: "DJ SMOKE STREAM... ENGAGE." },
    { time: 10, text: "Welcome to the AI Lounge After Dark." },
    { time: 15, text: "432Hz Neural Link Established." }
];

function startLyricEngine() {
    setInterval(() => {
        const currentTime = audio.currentTime;
        const currentLyric = lyrics.findLast(l => l.time <= currentTime);
        if (currentLyric) {
            document.getElementById('active-lyric').innerText = currentLyric.text;
        }
    }, 100);
}

animate();
