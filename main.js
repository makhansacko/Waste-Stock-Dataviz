import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('scene-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 300, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xFFFFFF);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = 0; 
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const models = [];
const modelPaths = [
'https://storage.googleapis.com/waste_stock_3d_models/public/July%2011%20AM.glb',
'/July 11 PM.glb', 
'/July 12 AM.glb', 
'/July 12 PM.glb', 
'/July 13.glb', 
'/July 14 AM.glb', 
'/July 14 PM.glb', 
'/July 15 AM.glb', 
'/July 15 PM.glb', 
'/August 5.glb', 
'/August 12.glb', 
'/August 26.glb', 
'/September 2.glb',
'/September 9.glb', 
'/September 16.glb', 
'/September 23.glb', 
'/October 1.glb', 
'/October 7.glb',
'/October 14.glb', 
'/October 21.glb', 
'/October 29.glb',
'/November 4.glb',
'/November 11.glb',
'/November 18.glb',
'/November 25.glb',
'/December 2.glb'
]
const loader = new GLTFLoader();

modelPaths.forEach((path, index) => {
    loadModel(path, index);
  });

  function loadModel(path, index) {
    loader.load(path, function (gltf) {
        const model = gltf.scene;
        model.position.set(0, 4.125, 0);
        model.scale.set(1, 1, 1);
        model.visible = (index === 0);

        model.traverse(function (child) {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
                //child.material.metalness = 0.5;
                //child.material.roughness = 1;
            }
        });

        scene.add(model);
        models[index] = model;

        if (index === 0) {
            updateCameraPosition(model);
        }
    }, undefined, function (error) {
        console.error("Error loading model:", error);
    });
}

function updateCameraPosition(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    camera.lookAt(center);
    controls.target.copy(center);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov / 2));
    cameraZ += 100;
    camera.position.set(camera.position.x, camera.position.y, cameraZ);
    controls.target.copy(center);
    controls.update();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

//Chart data
const modelData = [
    {date: "July 11 AM", volume: 128343},
    {date: "July 11 PM", volume: 118693},
    {date: "July 12 AM", volume: 120086},  
    {date: "July 12 PM", volume: 120619},
    {date: "July 13", volume: 124218},
    {date: "July 14 AM", volume: 115725},
    {date: "July 14 PM", volume: 126522},
    {date: "July 15 AM", volume: 124730},
    {date: "July 15 PM", volume: 133997},
   {date: "August 5", volume: 115472},
   {date: "August 12", volume: 131477},
    {date: "August 26", volume: 112450},
    {date: "September 2", volume: 120110},
    {date: "September 9", volume: 131272},
    {date: "September 16", volume: 136480},
    {date: "September 23", volume : 127305},
    {date: "October 1", volume: 130845},
    {date: "October 7", volume: 122054},
    {date: "October 14", volume: 128246},
   {date: "October 21", volume: 126774},
   {date: "October 29", volume: 129045},
    {date: "November 4", volume: 135275},
    {date: "November 11", volume: 131033},
    {date: "November 18", volume: 125458},
    {date: "November 25", volume: 124147},
    {date: "December 2", volume: 113982}
];

// Initialize the chart
const ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: modelData.map(data => data.date),
        datasets: [{
            label: 'Waste Volume',
            data: modelData.map(data => data.volume),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    },
    options: {
            responsive: true,
            maintainAspectRatio: false,
            
            scales: {
            y: {
                beginAtZero: true
        }
    }

    }
});

// Slider event listener
const slider = document.getElementById('modelSlider');
slider.addEventListener('input', function(e) {
    const index = parseInt(e.target.value, 10);
    switchModel(parseInt(this.value, 10) - 1);
    updateChartData(index);
});

function switchModel(index) {
    models.forEach((model, idx) => {
        model.visible = idx === index;
    });
    updateCameraPosition(models[index]);
    updateChartData(index);
}

function updateChartData(index) {
    const modelVolumes = modelData.map(data => data.volume);
    myChart.data.datasets[0].data = modelVolumes.slice(0, index + 1);
    myChart.update();
}
updateChartData(0);

// Window resize event listener
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    controls.update();
}

// WebGL compatibility check
import WebGL from 'three/addons/capabilities/WebGL.js';
if ( WebGL.isWebGLAvailable() ) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('scene-container').appendChild(warning);
}

//Slider play button

let playing = false;
let playInterval;

document.getElementById('playButton').addEventListener('click', function() {
    playing = !playing;
    if (playing) {
        this.textContent = 'Pause';
        playModels();
    } else {
        this.textContent = 'Play';
        clearInterval(playInterval);
    }
});

function playModels() {
    const maxIndex = models.length;
    let currentIndex = parseInt(document.getElementById('modelSlider').value, 10);

    playInterval = setInterval(() => {
        currentIndex++;
        if (currentIndex > maxIndex) {
            currentIndex = 1;
        }
        document.getElementById('modelSlider').value = currentIndex;
        switchModel(currentIndex - 1);
        updateChartData(currentIndex - 1);
    }, 300);
}
