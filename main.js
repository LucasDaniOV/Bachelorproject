import { GUI } from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { createCamera } from './src/components/camera';
import { createGround } from './src/components/ground';
import { createScene } from './src/components/scene';
import {
  createSunLight,
  createSunMesh,
  updateSunPosition,
} from './src/components/sun';
import { createSolarPanel } from './src/components/solarPanel';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

const scene = createScene();
const camera = createCamera();
const renderer = new THREE.WebGLRenderer();

const controls = new MapControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.maxDistance = 500;
controls.minDistance = 50;
controls.maxTargetRadius = 500;

function animate() {
  controls.update();
  renderer.render(scene, camera);
}

const gltfLoader = new GLTFLoader();

gltfLoader.load(
  'assets/grassland.glb',
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

const fontLoader = new FontLoader();

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

let info = {
  currentOutput: 0,
  totalOutput: 0,
};

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ground = createGround();
  scene.add(ground);

  const sunLight = createSunLight();
  const sunMesh = createSunMesh();
  scene.add(sunLight);
  scene.add(sunMesh);

  // const solarPanel = createSolarPanel();
  // scene.add(solarPanel);

  const gui = new GUI();

  gui.add(info, 'currentOutput').name('Producing').listen();

  const sunFolder = gui.addFolder('Sun');
  const sunSettings = { timeOfDay: 0 };
  sunFolder
    .add(sunSettings, 'timeOfDay', 0, 1)
    .name('Time of Day')
    .onChange((value) => {
      updateSunPosition(sunLight, sunMesh, parseFloat(value));
    });

  let solarPanelModel;
  gltfLoader.load(
    'assets/solar_panel.glb',
    function (gltf) {
      solarPanelModel = gltf.scene;
      solarPanelModel.scale.set(10, 10, 10);
      solarPanelModel.position.set(100, 0, -100);
      console.log(solarPanelModel.children);
      scene.add(solarPanelModel);
      // Log the results
      // console.log('Bounding Box Min:', boundingBox.min);
      // console.log('Bounding Box Max:', boundingBox.max);
      // console.log('Model Size (Width, Height, Depth):', size);
      // console.log('Model Center:', center);

      const solarPanelFolder = gui.addFolder('Solar Panel');
      solarPanelFolder
        .add(solarPanelModel.rotation, 'y', -Math.PI, 0)
        .name('Azimuth Angle');
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  // const solarPanelFolder = gui.addFolder('Solar Panel');
  // solarPanelFolder
  //   .add(solarPanel.children[0].rotation, 'x', 0, Math.PI / 2)
  //   .name('Tilt Angle');
  // solarPanelFolder
  //   .add(solarPanel.rotation, 'y', -Math.PI / 2, Math.PI / 2)
  //   .name('Azimuth Angle');

  updateSunPosition(sunLight, sunMesh, 0.5);

  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);
}

init();
