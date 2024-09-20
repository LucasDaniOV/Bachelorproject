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
const textureLoader = new THREE.TextureLoader();

const gui = new GUI();

let sunLight;
let sunMesh;
let dayController;

let info = {
  latitude: 50,
  longitude: 5,
};

let dateStuff = {
  year: {
    setter: 'setFullYear',
  },
  month: {
    setter: 'setMonth',
    min: 1,
    max: 12,
  },
  day: {
    setter: 'setDate',
    min: 1,
  },
  hour: {
    setter: 'setHours',
    min: 1,
    max: 24,
  },
  minutes: {
    setter: 'setMinutes',
    min: 0,
    max: 60,
  },
};

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

function addRoofSolarPanel() {
  const colorTexture = textureLoader.load(
    'assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_Color.jpg'
  );
  const normalTexture = textureLoader.load(
    'assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_NormalDX.jpg'
  ); // or NormalGL
  const roughnessTexture = textureLoader.load(
    'assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_Roughness.jpg'
  );
  const metalnessTexture = textureLoader.load(
    'assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_Metalness.jpg'
  );

  const panelMaterial = new THREE.MeshStandardMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    metalnessMap: metalnessTexture,
    roughness: 0.5,
    metalness: 0.5,
  });

  const cubeGeometry = new THREE.BoxGeometry(50, 75, 5);

  const cubeMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x808080 }), // Right face (positive x)
    new THREE.MeshStandardMaterial({ color: 0x808080 }), // Left face (negative x)
    new THREE.MeshStandardMaterial({ color: 0x808080 }), // Top face (positive y)
    new THREE.MeshStandardMaterial({ color: 0x808080 }), // Bottom face (negative y)
    panelMaterial,
    new THREE.MeshStandardMaterial({ color: 0x808080 }), // Back face (negative z)
  ];
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
  cube.castShadow = true;
  cube.receiveShadow = true;

  const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 30, 32);
  const cylinderMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

  cylinder.position.set(40, 100, -45);
  cylinder.add(cube);
  cube.position.set(0, 17, 0);
  cube.rotateX(-Math.PI / 2);

  cylinder.castShadow = true;
  cylinder.receiveShadow = true;

  scene.add(cylinder);

  let params = {
    tilt: 0,
    azimuth: 0,
  };

  const panelFolder = gui.addFolder('Solar Panel');
  panelFolder
    .add(params, 'tilt', 0, 90)
    .name('Tilt Angle')
    .onChange((value) => {
      params.tilt = value;
      cube.rotation.x = -Math.PI / 2 - THREE.MathUtils.degToRad(value);
    });

  panelFolder
    .add(params, 'azimuth', 0, 360)
    .name('Azimuth Angle')
    .onChange((value) => {
      params.azimuth = value;
      cylinder.rotation.y = -THREE.MathUtils.degToRad(value);
    });
}

function createSun() {
  sunLight = createSunLight();
  sunMesh = createSunMesh();
  scene.add(sunLight);
  scene.add(sunMesh);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      info.latitude = position.coords.latitude;
      info.longitude = position.coords.longitude;
      gui.updateDisplay();
      updateSunPosition(
        sunLight,
        sunMesh,
        info.latitude,
        info.longitude,
        info.date
      );
    });
  }
}

function updateLocationGUI() {
  const locationFolder = gui.addFolder('Location');
  locationFolder
    .add({ reset: getLocation }, 'reset')
    .name('Reset to current location');
  locationFolder
    .add(info, 'latitude', -90, 90)
    .name('Latitude')
    .onChange((value) => {
      info.latitude = value;
      updateSunPosition(
        sunLight,
        sunMesh,
        info.latitude,
        info.longitude,
        info.date
      );
    });
  locationFolder
    .add(info, 'longitude', -180, 180)
    .name('Longitude')
    .onChange((value) => {
      info.longitude = value;
      updateSunPosition(
        sunLight,
        sunMesh,
        info.latitude,
        info.longitude,
        info.date
      );
    });
}

function setDate() {
  const date = new Date();
  info.date = date;
  info.year = date.getFullYear();
  info.month = date.getMonth() + 1;
  info.day = date.getDate();
  info.hour = date.getHours();
  info.minutes = date.getMinutes();
  dateStuff.day.max = new Date(
    date.getFullYear(),
    date.getMonth(),
    0
  ).getDate();
  if (dayController) {
    dayController.max(dateStuff.day.max).setValue(info.day);
  }
  gui.updateDisplay();
  updateSunPosition(
    sunLight,
    sunMesh,
    info.latitude,
    info.longitude,
    info.date
  );
}

function createTimeControls() {
  const timeFolder = gui.addFolder('Time');
  timeFolder.add({ reset: setDate }, 'reset').name('Reset to current date');

  Object.keys(dateStuff).forEach((key) => {
    const { setter, min, max } = dateStuff[key];
    if (key == 'day') {
      dayController = timeFolder
        .add(info, key, min, max, 1)
        .name(key.charAt(0).toUpperCase() + key.slice(1))
        .onChange((value) => {
          info.date[setter](value);
          updateSunPosition(
            sunLight,
            sunMesh,
            info.latitude,
            info.longitude,
            info.date
          );
        });
    } else if (key == 'year') {
      timeFolder
        .add(info, key)
        .name(key.charAt(0).toUpperCase() + key.slice(1))
        .onChange((value) => {
          info.date[setter](value);
          updateSunPosition(
            sunLight,
            sunMesh,
            info.latitude,
            info.longitude,
            info.date
          );
        });
    } else {
      timeFolder
        .add(info, key, min, max, 1)
        .name(key.charAt(0).toUpperCase() + key.slice(1))
        .onChange((value) => {
          info.date[setter](value);
          if (key == 'month') {
            dateStuff[key].max = new Date(
              info.date.getFullYear(),
              info.date.getMonth(),
              0
            ).getDate();
            dayController.max(dateStuff[key].max).setValue(1);
          }
          updateSunPosition(
            sunLight,
            sunMesh,
            info.latitude,
            info.longitude,
            info.date
          );
        });
    }
  });
}

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  createSun();
  setDate();
  loadGrassland();
  loadNavigation();
  loadHouse();
  addRoofSolarPanel();
  getLocation();
  updateLocationGUI();
  createTimeControls();

  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);
}

init();
