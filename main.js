import { GUI } from 'dat.gui';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createCamera } from './src/components/camera';
import { createScene } from './src/components/scene';
import { createSunLight, createSunMesh, updateSunPosition } from './src/components/sun';

const scene = createScene();
const camera = createCamera();
const renderer = new THREE.WebGLRenderer();

const controls = new MapControls(camera, renderer.domElement);
// controls.enableRotate = false;
controls.maxDistance = 500;
controls.minDistance = 50;
controls.maxTargetRadius = 500;

const gltfLoader = new GLTFLoader();
const fontLoader = new FontLoader();
const textureLoader = new THREE.TextureLoader();

const gui = new GUI();
const panelFolder = gui.addFolder('Solar Panel');
panelFolder.open();
const locationFolder = gui.addFolder('Location');
const timeFolder = gui.addFolder('Time');
const settingsFolder = gui.addFolder('Settings');

let sunLight;
let sunMesh;
let panelCube;
let panelCylinder;
let sunLightDirectionHelper;
let solarPanelDirectionHelper;
let dayController;

let info = {
    latitude: 50,
    longitude: 5,
    tilt: 0,
    azimuth: 0,
    showArrowHelpers: true,
    incidentAngle: 0,
    angleAlignment: 0,
    passTime: false,
    timeSpeed: 1,
    timeIntervalID: null,
    date: new Date(),
    solarPanels: 5,
    wattPeak: 500,
    totalWattPeak: 2500,
    currentWattMinute: 0,
    totalKWH: 0,
    sunIntensity: 1,
    currentMaxWatt: 0,
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
    const colorTexture = textureLoader.load('assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_Color.jpg');
    const normalTexture = textureLoader.load('assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_NormalDX.jpg'); // or NormalGL
    const roughnessTexture = textureLoader.load('assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_Roughness.jpg');
    const metalnessTexture = textureLoader.load('assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_Metalness.jpg');

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
    panelCube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    panelCube.castShadow = true;
    panelCube.receiveShadow = true;

    const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 30, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
    });
    panelCylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

    panelCylinder.position.set(40, 100, -45);
    panelCylinder.add(panelCube);
    panelCube.position.set(0, 17, 0);
    panelCube.rotateX(-Math.PI / 2);

    panelCylinder.castShadow = true;
    panelCylinder.receiveShadow = true;

    scene.add(panelCylinder);

    panelFolder
        .add(info, 'tilt', 0, 90)
        .name('Tilt Angle')
        .onChange((value) => {
            info.tilt = value;
            panelCube.rotation.x = -Math.PI / 2 - THREE.MathUtils.degToRad(value);
            calculateEnergyProduction();
        });

    panelFolder
        .add(info, 'azimuth', 0, 360)
        .name('Azimuth Angle')
        .onChange((value) => {
            info.azimuth = value;
            panelCylinder.rotation.y = -THREE.MathUtils.degToRad(value);
            calculateEnergyProduction();
        });

    panelFolder
        .add(info, 'solarPanels', 1, 100, 1)
        .name('Solar Panels')
        .onChange((value) => {
            info.solarPanels = value;
            info.totalWattPeak = info.wattPeak * info.solarPanels;
            calculateEnergyProduction();
        });

    panelFolder
        .add(info, 'wattPeak', 1, 1000, 1)
        .name('Panel Watt Peak (Wp)')
        .onChange((value) => {
            info.wattPeak = value;
            info.totalWattPeak = info.wattPeak * info.solarPanels;
            calculateEnergyProduction();
        });

    const disabled = [];
    // disabled.push(panelFolder.add(info, 'totalWattPeak').name('Total Watt Peak').listen());
    disabled.push(panelFolder.add(info, 'currentMaxWatt').name('Max Possible Watt').listen());

    disabled.forEach((controller) => {
        const input = controller.domElement.querySelector('input');
        input.disabled = true;
        input.style.cursor = 'not-allowed';
        input.style.backgroundColor = '#f0f0f0';
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
            updateSunPosition(sunLight, sunMesh, info.latitude, info.longitude, info.date, info.sunIntensity);
            calculateEnergyProduction();
        });
    }
}

function createLocationControls() {
    locationFolder.add({ reset: getLocation }, 'reset').name('Reset to current location');
    locationFolder
        .add(info, 'latitude', -90, 90)
        .name('Latitude')
        .onChange((value) => {
            info.latitude = value;
            updateSunPosition(sunLight, sunMesh, info.latitude, info.longitude, info.date, info.sunIntensity);
            calculateEnergyProduction();
        });
    locationFolder
        .add(info, 'longitude', -180, 180)
        .name('Longitude')
        .onChange((value) => {
            info.longitude = value;
            updateSunPosition(sunLight, sunMesh, info.latitude, info.longitude, info.date, info.sunIntensity);
            calculateEnergyProduction();
        });
}

function createTimeControls() {
    setDateStuff();
    timeFolder
        .add(
            {
                reset: () => {
                    info.date = new Date();
                    updateTime();
                },
            },
            'reset'
        )
        .name('Reset to current date');

    timeFolder
        .add(info, 'year')
        .name('Year')
        .onChange((value) => {
            info.date.setFullYear(value);
            updateTime();
        });

    timeFolder
        .add(info, 'guiMonth', 1, 12, 1)
        .name('Month')
        .onChange((value) => {
            info.date.setMonth(value - 1); // months range: 0-11
            updateTime();
        });

    dayController = timeFolder
        .add(info, 'day', 1, info.maxDay, 1)
        .name('Day')
        .onChange((value) => {
            info.date.setDate(value);
            updateTime();
        });

    timeFolder
        .add(info, 'hour', 0, 23, 1)
        .name('Hour')
        .onChange((value) => {
            info.date.setHours(value);
            updateTime();
        });

    timeFolder
        .add(info, 'minute', 0, 59, 1)
        .name('Minute')
        .onChange((value) => {
            info.date.setMinutes(value);
            updateTime();
        });

    timeFolder
        .add(info, 'passTime')
        .name('Passing')
        .onChange((value) => {
            info.passTime = value;
            togglePassTime();
        });

    timeFolder
        .add(info, 'timeSpeed', 1, 100)
        .name('Speed')
        .onChange(function (value) {
            info.timeSpeed = value;
            togglePassTime();
        });
}

function calculateSolarPanelAlignment() {
    const tiltRad = THREE.MathUtils.degToRad(info.tilt) + Math.PI;
    const azimuthRad = THREE.MathUtils.degToRad(info.azimuth) - Math.PI / 2;

    const panelNormal = new THREE.Vector3(Math.sin(tiltRad) * Math.cos(azimuthRad), Math.cos(tiltRad), Math.sin(tiltRad) * Math.sin(azimuthRad)).normalize();

    const sunDirection = sunLight.position.clone().negate().normalize();

    if (!sunLightDirectionHelper) {
        sunLightDirectionHelper = new THREE.ArrowHelper(sunDirection, sunLight.position, 500, 0xff0000);
        scene.add(sunLightDirectionHelper);
    } else {
        sunLightDirectionHelper.position.copy(sunLight.position);
        sunLightDirectionHelper.setDirection(sunDirection);
    }

    if (!solarPanelDirectionHelper) {
        solarPanelDirectionHelper = new THREE.ArrowHelper(panelNormal, panelCylinder.position, 500, 0x00ff00);
        scene.add(solarPanelDirectionHelper);
    } else {
        solarPanelDirectionHelper.position.copy(panelCylinder.position);
        solarPanelDirectionHelper.setDirection(panelNormal);
    }

    const angle = panelNormal.angleTo(sunDirection);
    const angleDeg = THREE.MathUtils.radToDeg(angle);
    info.incidentAngle = angleDeg;

    const efficiency = Math.cos(angle);
    info.angleAlignment = Math.max(0, efficiency);
}

function toggleArrowHelpers() {
    settingsFolder
        .add(info, 'showArrowHelpers')
        .name('Vector directions')
        .onChange((value) => {
            info.showArrowHelpers = value;
            if (sunLightDirectionHelper) {
                sunLightDirectionHelper.visible = value;
            }
            if (solarPanelDirectionHelper) {
                solarPanelDirectionHelper.visible = value;
            }
        });
}

function displayPanelStats() {
    let controllers = [];
    controllers.push(panelFolder.add(info, 'incidentAngle').step(0.01).name('Incident Angle').listen());
    controllers.push(panelFolder.add(info, 'angleAlignment').step(0.01).name('Alignment').listen());
    controllers.push(panelFolder.add(info, 'currentWattMinute').step(0.01).name('Watt').listen());
    controllers.push(panelFolder.add(info, 'totalKWH').step(0.0001).name('Total kWh').listen());

    panelFolder
        .add(
            {
                reset: () => {
                    info.totalKWH = 0;
                },
            },
            'reset'
        )
        .name('Reset total kWh');

    const labels = panelFolder.domElement.getElementsByTagName('span');
    for (let label of labels) {
        if (label.innerHTML === 'Incident Angle' || label.innerHTML === 'Alignment' || label.innerHTML === 'Watt' || label.innerHTML === 'Total kWh') {
            if (label.innerHTML === 'Watt' || label.innerHTML === 'Total kWh') {
                label.style.color = 'yellow';
                label.style.fontSize = '15px';
                label.style.fontWeight = 'bold';
            } else {
                label.style.color = 'green';
                label.style.fontSize = '15px';
                label.style.fontWeight = 'bold';
            }
        }
    }

    controllers.forEach((controller) => {
        const input = controller.domElement.querySelector('input');
        if (input) {
            input.disabled = true;
            input.style.cursor = 'not-allowed';
            input.style.backgroundColor = '#f0f0f0';
        }
    });
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function setDateStuff() {
    info.year = info.date.getFullYear();
    info.month = info.date.getMonth();
    info.day = info.date.getDate();
    info.hour = info.date.getHours();
    info.minute = info.date.getMinutes();
    info.maxDay = new Date(info.year, info.month + 1, 0).getDate();
    info.guiMonth = info.month + 1;
}

function updateTime() {
    setDateStuff();
    dayController.max(info.maxDay);
    gui.updateDisplay();
    updateSunPosition(sunLight, sunMesh, info.latitude, info.longitude, info.date, info.sunIntensity);
    calculateEnergyProduction();
}

function passMinute() {
    info.totalKWH += info.currentWattMinute / 60 / 1000;
    info.date = new Date(info.date.setMinutes(info.date.getMinutes() + 1));
    updateTime();
}

function togglePassTime() {
    if (info.passTime) {
        if (info.timeIntervalID) {
            clearInterval(info.timeIntervalID);
        }
        info.timeIntervalID = setInterval(function () {
            passMinute();
        }, 1000 / info.timeSpeed);
    } else {
        clearInterval(info.timeIntervalID);
        info.timeIntervalID = null;
    }
}

function calculateEnergyProduction() {
    calculateSolarPanelAlignment();
    info.currentMaxWatt = info.wattPeak * (sunLight.intensity / 8) * 1 * info.solarPanels;
    info.currentWattMinute = info.wattPeak * (sunLight.intensity / 8) * info.angleAlignment * info.solarPanels;
}

function controlSunIntensity() {
    settingsFolder
        .add(info, 'sunIntensity', 0.1, 1, 0.01)
        .name('Sun Intensity')
        .onChange((value) => {
            info.sunIntensity = value;
            updateSunPosition(sunLight, sunMesh, info.latitude, info.longitude, info.date, info.sunIntensity);
            calculateEnergyProduction();
        });
}

function init() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    createSun();
    loadGrassland();
    loadNavigation();
    loadHouse();
    addRoofSolarPanel();
    getLocation();
    createLocationControls();
    createTimeControls();
    calculateEnergyProduction();
    toggleArrowHelpers();
    displayPanelStats();
    controlSunIntensity();

    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
}

init();
