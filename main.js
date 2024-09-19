import { GUI } from 'dat.gui';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createCamera } from './src/components/camera';
import { createScene } from './src/components/scene';
import {
  createSunLight,
  createSunMesh,
  updateSunPosition,
} from './src/components/sun';

const scene = createScene();
const camera = createCamera();
const renderer = new THREE.WebGLRenderer();

const controls = new MapControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.maxDistance = 500;
controls.minDistance = 50;
controls.maxTargetRadius = 500;

const gltfLoader = new GLTFLoader();
const fontLoader = new FontLoader();

function animate() {
  controls.update();
  renderer.render(scene, camera);
}

function loadGrassland() {
  gltfLoader.load(
    'assets/models/grassland.glb',
    function (gltf) {
      let ground = gltf.scene;
      ground.scale.set(7.5, 7.5, 7.5);

      scene.add(ground);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function loadNavigation() {
  fontLoader.load('fonts/Roboto_Regular.json', function (font) {
    // Define the text geometries

    const size = 25;

    const geometries = {
      N: new TextGeometry('N', {
        font: font,
        size: size,
        depth: 5, // Optional: Adds depth to the text
        curveSegments: 12, // Optional: For smooth curves
        bevelEnabled: true, // Optional: Adds a bevel to the text
        bevelThickness: 2, // Optional: Bevel thickness
        bevelSize: 1, // Optional: Bevel size
        bevelOffset: 0, // Optional: Bevel offset
        bevelSegments: 5, // Optional: Bevel segments
      }),
      E: new TextGeometry('E', {
        font: font,
        size: size,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 5,
      }).rotateY(-Math.PI / 2),
      S: new TextGeometry('S', {
        font: font,
        size: size,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 5,
      }).rotateY(Math.PI),
      W: new TextGeometry('W', {
        font: font,
        size: size,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 5,
      }).rotateY(Math.PI / 2),
    };

    // Define a material
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

    // Create and position each text mesh
    const positions = {
      N: new THREE.Vector3(-size / 2, 50, -300),
      E: new THREE.Vector3(300, 50, -size / 2),
      S: new THREE.Vector3(size / 2, 50, 300),
      W: new THREE.Vector3(-300, 50, size / 2),
    };

    Object.keys(geometries).forEach((key) => {
      const textMesh = new THREE.Mesh(geometries[key], material);
      textMesh.position.copy(positions[key]);
      scene.add(textMesh);
    });
  });
}

function loadHouse() {
  gltfLoader.load(
    'assets/models/modern_house_low_poly.glb',
    function (gltf) {
      let model = gltf.scene;
      model.scale.set(15, 15, 15);
      model.rotateY(-Math.PI / 2);
      model.position.y += 1;
      scene.add(model);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  const sunLight = createSunLight();
  const sunMesh = createSunMesh();
  scene.add(sunLight);
  scene.add(sunMesh);

  loadGrassland();
  loadNavigation();
  loadHouse();

  const gui = new GUI();

  const sunFolder = gui.addFolder('Sun');
  const sunSettings = { timeOfDay: 0 };
  sunFolder
    .add(sunSettings, 'timeOfDay', 0, 1)
    .name('Time of Day')
    .onChange((value) => {
      updateSunPosition(sunLight, sunMesh, parseFloat(value));
    });

  updateSunPosition(sunLight, sunMesh, 0.5);

  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);
}

init();
