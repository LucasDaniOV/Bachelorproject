import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCamera } from './src/components/camera';
import { createScene } from './src/components/scene';
import { PI } from 'three/webgpu';

const scene = createScene();
const camera = createCamera();

const renderer = new THREE.WebGLRenderer();

const orbitControls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();

let solarPanelModel;
let worldup = new THREE.Vector3();

loader.load(
  'assets/Solar battery.glb',
  function (gltf) {
    solarPanelModel = gltf.scene;
    scene.add(solarPanelModel);

    solarPanelModel.position.set(0, 2, 0);
    solarPanelModel.scale.set(0.01, 0.01, 0.01);

    console.log(solarPanelModel);

    const transformControls = new TransformControls(
      camera,
      renderer.domElement
    );
    transformControls.attach(solarPanelModel);
    transformControls.setMode('rotate');
    scene.add(transformControls);

    // Prevent OrbitControls from interfering with TransformControls
    transformControls.addEventListener('dragging-changed', function (event) {
      orbitControls.enabled = !event.value;
    });

    // Create a new Box3 instance
    const boundingBox = new THREE.Box3().setFromObject(solarPanelModel);

    // Get the size of the bounding box
    const size = new THREE.Vector3();
    boundingBox.getSize(size); // size now contains the width, height, depth

    // Get the center of the bounding box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center); // center now contains the coordinates of the center

    // Log the results
    // console.log('Bounding Box Min:', boundingBox.min);
    // console.log('Bounding Box Max:', boundingBox.max);
    // console.log('Model Size (Width, Height, Depth):', size);
    // console.log('Model Center:', center);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// // Step 2: Create the Cylinder (Bone)
// const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 5, 16); // radiusTop, radiusBottom, height, radialSegments
// const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
// const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
// cylinder.position.set(0, 2.5, 0);
// scene.add(cylinder);

// const textureLoader = new THREE.TextureLoader();
// const texture = textureLoader.load('assets/SolarPanel003_1K-JPG_Color.jpg');
// const rectangleGeometry = new THREE.PlaneGeometry(4, 4); // width, height
// const rectangleMaterial = new THREE.MeshStandardMaterial({
//   map: texture,
//   side: THREE.DoubleSide,
// });
// const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);

// rectangle.position.y = 2.6; // Move rectangle to the top of the cylinder
// rectangle.receiveShadow = true;
// rectangle.rotateX(Math.PI / 2);
// cylinder.add(rectangle); // Attach rectangle tocylinder

// const transformControls = new TransformControls(camera, renderer.domElement);
// transformControls.attach(rectangle);
// transformControls.setMode('rotate');
// scene.add(transformControls);

// // Prevent OrbitControls from interfering with TransformControls
// transformControls.addEventListener('dragging-changed', function (event) {
//   orbitControls.enabled = !event.value;
// });

function animate() {
  // requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function createFloor() {
  const floorGeometry = new THREE.PlaneGeometry(50, 50);

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('assets/Grass001_1K-JPG_Color.jpg');

  const floorMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);

  // Rotate the floor to be horizontal (plane geometries are vertical by default)
  floor.rotation.x = Math.PI / 2;

  // Add shadow properties to the floor
  floor.receiveShadow = true;

  scene.add(floor);
}

const sunLight = new THREE.DirectionalLight(0xffffff, 1); // white light
sunLight.position.set(0, 30, 0); // initial position above the panels
scene.add(sunLight);

const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd44 }); // bright sun color
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

function updateSunPosition(timeOfDay) {
  const radius = 30; // distance of the sun from the center
  const angle = Math.PI * timeOfDay; // calculate angle based on time of day (0 - 2)

  // Update sun position in the sky (circular arc)
  const sunX = radius * Math.cos(angle); // x-axis (left to right movement)
  const sunY = radius * Math.sin(angle); // y-axis (up and down movement)

  // Set the position of the sun (light and visual)
  sunLight.position.set(sunX, sunY, 0);
  sunMesh.position.set(sunX, sunY, 0);

  // Update sunlight intensity based on the sun's height (sunY)
  // High in the sky (noon) = high intensity, low in the sky (morning/evening) = low intensity
  const intensity = Math.max(0.1, sunY / radius); // max intensity at noon, 0.1 at lowest
  sunLight.intensity = intensity;

  console.log(sunLight.intensity);
}

function createSolarPanel() {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('assets/SolarPanel003_1K-JPG_Color.jpg');
  const geometry = new THREE.BoxGeometry(10, 10, 10);

  // Assign names for each side (6 faces)
  const materials = [
    new THREE.MeshBasicMaterial({ color: 0x00ff00, name: 'front' }), // Back
    new THREE.MeshStandardMaterial({ map: texture, name: 'back' }), // Front
    new THREE.MeshBasicMaterial({ color: 0x0000ff, name: 'left' }), // Left
    new THREE.MeshBasicMaterial({ color: 0xffff00, name: 'right' }), // Right
    new THREE.MeshBasicMaterial({ color: 0xff00ff, name: 'top' }), // Top
    new THREE.MeshBasicMaterial({ color: 0x00ffff, name: 'bottom' }), // Bottom
  ];

  const materialWithTexture = new THREE.MeshStandardMaterial({ map: texture });

  // Create mesh with different materials for each side
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
  cube.position.set(0, 5, 10);
}

const timeSlider = document.getElementById('timeSlider');

timeSlider.addEventListener('input', () => {
  let timeOfDay = parseFloat(timeSlider.value);
  updateSunPosition(timeOfDay); // Update the sun's position based on slider value
});

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  createFloor();
  updateSunPosition(0);

  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);
}

init();
