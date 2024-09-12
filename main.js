import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCamera } from './src/components/camera';
import { createScene } from './src/components/scene';

const scene = createScene();
const camera = createCamera();

const renderer = new THREE.WebGLRenderer();

const orbitControls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();

let solarPanelModel;
let worldup = new THREE.Vector3();

loader.load(
  'assets/post-apo_solar.glb',
  function (gltf) {
    solarPanelModel = gltf.scene;
    scene.add(solarPanelModel);

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

function animate() {
  // requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // solarPanelModel.getWorldDirection(worldup);
  // console.log('World direction:', worldup);
}

function createFloor() {
  const floorGeometry = new THREE.PlaneGeometry(50, 50); // Width and height of the plane
  const floorMaterial = new THREE.MeshPhongMaterial({
    color: 0x008000,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);

  // Rotate the floor to be horizontal (plane geometries are vertical by default)
  floor.rotation.x = Math.PI / 2;

  // Add shadow properties to the floor
  floor.receiveShadow = true;

  scene.add(floor);
}

function createSun() {
  const geometry = new THREE.SphereGeometry(5, 32, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(-30, 20, 0);

  // Create a PointLight that follows the sun
  const pointLight = new THREE.PointLight(0xffffff, 10000, 100); // Increased intensity
  pointLight.position.copy(sphere.position); // Set the position of the light to the sun sphere position
  pointLight.castShadow = true; // Enable shadows

  scene.add(pointLight);
  scene.add(sphere);
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

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  createFloor();
  createSun();
  createSolarPanel();

  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);
}

init();
