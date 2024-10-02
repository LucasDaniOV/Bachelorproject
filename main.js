import { GUI } from 'dat.gui';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createCamera } from './src/components/camera';
import { createScene } from './src/components/scene';
import { createSunLight, createSunMesh, updateSunPosition } from './src/components/sun';

class CustomGUI extends GUI {
    constructor() {
        super();
    }

    addFolder(name) {
        const folder = super.addFolder(name);

        const originalAdd = folder.add.bind(folder);
        folder.add = (object, property, min, max, step) => {
            const controller = originalAdd(object, property, min, max, step);
            const slider = controller.domElement.querySelector('.slider');
            if (!slider) {
                return controller;
            }

            const decrementButton = document.createElement('button');
            decrementButton.innerText = '-';
            decrementButton.style = `
                height: 20px;
                width: 20px;
                top: 0;
                position: absolute;
                left: 0;
            `;
            decrementButton.onclick = () => {
                if (object[property] > min) {
                    object[property] -= step;
                    controller.setValue(object[property]);
                }
            };

            const incrementButton = document.createElement('button');
            incrementButton.innerText = '+';
            incrementButton.style = `
                height: 20px;
                width: 20px;
                top: 0;
                position: absolute;
                right: 63px;
            `;
            incrementButton.onclick = () => {
                if (object[property] < max) {
                    object[property] += step;
                    controller.setValue(object[property]);
                }
            };

            slider.style = `
                position: relative;
                width: calc(66% - 50px);
                position: absolute;
                left: 30px;
            `;

            controller.domElement.style = `
                position: relative;
            `;

            controller.domElement.appendChild(decrementButton);
            controller.domElement.appendChild(incrementButton);

            return controller;
        };

        return folder;
    }
}

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

const text = {
    panelFolderName: { English: 'Solar Panel', Nederlands: 'Zonnepaneel' },
    automatic: { English: 'Automatic', Nederlands: 'Automatisch' },
    tiltAngle: { English: 'Tilt angle', Nederlands: 'Kantelhoek' },
    azimuthAngle: { English: 'Azimuth angle', Nederlands: 'Azimuthoek' },
    solarPanels: { English: 'Solar panels', Nederlands: 'Zonnepanelen' },
    panelWattPeak: { English: 'Panel Watt peak (Wp)', Nederlands: 'Paneel Watt piek (Wp)' },
    maxPossibleWatt: { English: 'Max possible Watt', Nederlands: 'Max Watt mogelijk' },
    incidentAngle: { English: 'Incident angle', Nederlands: 'Invalshoek' },
    alignment: { English: 'Alignment', Nederlands: 'Uitlijning' },
    totalKWH: { English: 'Total kWh', Nederlands: 'Totaal kWh' },
    resetTotalKWH: { English: 'Reset total kWh', Nederlands: 'Reset totaal kWh' },
    locationFolderName: { English: 'Location', Nederlands: 'Locatie' },
    resetLocation: { English: 'Reset to current location', Nederlands: 'Reset naar huidige locatie' },
    latitude: { English: 'Latitude', Nederlands: 'Breedtegraad' },
    longitude: { English: 'Longitude', Nederlands: 'Lengtegraad' },
    timeFolderName: { English: 'Time', Nederlands: 'Tijd' },
    resetTime: { English: 'Reset to current date', Nederlands: 'Reset naar huidige datum' },
    year: { English: 'Year', Nederlands: 'Jaar' },
    month: { English: 'Month', Nederlands: 'Maand' },
    day: { English: 'Day', Nederlands: 'Dag' },
    hour: { English: 'Hour', Nederlands: 'Uur' },
    minute: { English: 'Minute', Nederlands: 'Minuut' },
    passingTime: { English: 'Passing', Nederlands: 'Lopend' },
    speed: { English: 'Speed', Nederlands: 'Snelheid' },
    settingsFolderName: { English: 'Settings', Nederlands: 'Instellingen' },
    vectorDirections: { English: 'Vector directions', Nederlands: 'Vector richtingen' },
    sunIntensity: { English: 'Sun intensity', Nederlands: 'Zon intensiteit' },
    language: { English: 'Language', Nederlands: 'Taal' },
    closeControls: { English: 'Close Controls', Nederlands: 'Sluit Controles' },
    openControls: { English: 'Open Controls', Nederlands: 'Open Controles' },
};

let gui;
let closeGuiButton;
let panelFolder;
let locationFolder;
let timeFolder;
let settingsFolder;

let sunLight;
let sunMesh;
let panelCube;
let panelCylinder;
let sunLightDirectionHelper;
let solarPanelDirectionHelper;
let dayController;
let tiltAngleController;
let azimuthAngleController;

let info = {
    latitude: 50,
    longitude: 5,
    tilt: 0,
    azimuth: 0,
    showArrowHelpers: false,
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
    alignPanel: false,
    lang: 'English',
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
}

function addPanelControls() {
    function toggleTiltAndAzimuthControllers() {
        [tiltAngleController, azimuthAngleController].forEach((controller) => {
            const input = controller.domElement.querySelector('input');
            const slider = controller.domElement.querySelector('.slider');

            if (info.alignPanel) {
                input.disabled = true;
                input.style.cursor = 'not-allowed';
                input.style.backgroundColor = '#f0f0f0';
                slider.style.pointerEvents = 'none';
            } else {
                input.disabled = false;
                input.style.cursor = '';
                input.style.backgroundColor = '';
                slider.style.pointerEvents = '';
            }
        });
    }

    panelFolder
        .add(info, 'alignPanel')
        .name(text.automatic[info.lang])
        .onChange((value) => {
            info.alignPanel = value;
            toggleTiltAndAzimuthControllers();
            calculateEnergyProduction();
        });

    tiltAngleController = panelFolder
        .add(info, 'tilt', 0, 90, 1)
        .name(text.tiltAngle[info.lang])
        .onChange((value) => {
            info.tilt = value;
            panelCube.rotation.x = -Math.PI / 2 - THREE.MathUtils.degToRad(value);
            calculateEnergyProduction();
        });

    azimuthAngleController = panelFolder
        .add(info, 'azimuth', 0, 360, 1)
        .name(text.azimuthAngle[info.lang])
        .onChange((value) => {
            info.azimuth = value;
            panelCylinder.rotation.y = -THREE.MathUtils.degToRad(value);
            calculateEnergyProduction();
        });

    panelFolder
        .add(info, 'solarPanels', 1, 100, 1)
        .name(text.solarPanels[info.lang])
        .onChange((value) => {
            info.solarPanels = value;
            info.totalWattPeak = info.wattPeak * info.solarPanels;
            calculateEnergyProduction();
        });

    panelFolder
        .add(info, 'wattPeak', 1, 1000, 1)
        .name(text.panelWattPeak[info.lang])
        .onChange((value) => {
            info.wattPeak = value;
            info.totalWattPeak = info.wattPeak * info.solarPanels;
            calculateEnergyProduction();
        });

    const disabled = [];
    // disabled.push(panelFolder.add(info, 'totalWattPeak').name('Total Watt Peak').listen());
    disabled.push(panelFolder.add(info, 'currentMaxWatt').step(0.01).name(text.maxPossibleWatt[info.lang]).listen());

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

async function getLocation() {
    if (!navigator.geolocation) {
        return;
    }
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        info.latitude = position.coords.latitude;
        info.longitude = position.coords.longitude;
    } catch (error) {
        console.error(error);
    }
}

async function resetLocation() {
    await getLocation();
    gui.updateDisplay();
    updateSunPosition(sunLight, sunMesh, info.latitude, info.longitude, info.date, info.sunIntensity);
    calculateEnergyProduction();
}

function createLocationControls() {
    locationFolder.add({ reset: resetLocation }, 'reset').name(text.resetLocation[info.lang]);
    locationFolder
        .add(info, 'latitude', -90, 90, 0.1)
        .name(text.latitude[info.lang])
        .onChange((value) => {
            info.latitude = value;
            updateSunPosition(sunLight, sunMesh, info.latitude, info.longitude, info.date, info.sunIntensity);
            calculateEnergyProduction();
        });
    locationFolder
        .add(info, 'longitude', -180, 180, 0.1)
        .name(text.longitude[info.lang])
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
        .name(text.resetTime[info.lang]);

    timeFolder
        .add(info, 'year')
        .name(text.year[info.lang])
        .onChange((value) => {
            info.date.setFullYear(value);
            updateTime();
        });

    timeFolder
        .add(info, 'guiMonth', 1, 12, 1)
        .name(text.month[info.lang])
        .onChange((value) => {
            info.date.setMonth(value - 1); // months range: 0-11
            updateTime();
        });

    dayController = timeFolder
        .add(info, 'day', 1, info.maxDay, 1)
        .name(text.day[info.lang])
        .onChange((value) => {
            info.date.setDate(value);
            updateTime();
        });

    timeFolder
        .add(info, 'hour', 0, 23, 1)
        .name(text.hour[info.lang])
        .onChange((value) => {
            info.date.setHours(value);
            updateTime();
        });

    timeFolder
        .add(info, 'minute', 0, 59, 1)
        .name(text.minute[info.lang])
        .onChange((value) => {
            info.date.setMinutes(value);
            updateTime();
        });

    timeFolder
        .add(info, 'passTime')
        .name(text.passingTime[info.lang])
        .onChange((value) => {
            info.passTime = value;
            togglePassTime();
        });

    timeFolder
        .add(info, 'timeSpeed', 1, 100, 1)
        .name(text.speed[info.lang])
        .onChange(function (value) {
            info.timeSpeed = value;
            togglePassTime();
        });
}

function calculateSolarPanelAlignment() {
    if (info.alignPanel) {
        alignPanel();
    }
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

    sunLightDirectionHelper.visible = info.showArrowHelpers;
    solarPanelDirectionHelper.visible = info.showArrowHelpers;

    const angle = panelNormal.angleTo(sunDirection);
    const angleDeg = THREE.MathUtils.radToDeg(angle);
    info.incidentAngle = angleDeg;

    const efficiency = Math.cos(angle);
    info.angleAlignment = Math.max(0, efficiency);
}

function alignPanel() {
    if (info.currentMaxWatt === 0) {
        return;
    }
    const sunDirection = sunLight.position.clone().negate().normalize();
    const panelNormal = sunDirection.clone().normalize();

    const tilt = Math.acos(panelNormal.y);
    const azimuth = Math.atan2(panelNormal.z, panelNormal.x);

    const tiltDeg = THREE.MathUtils.radToDeg(tilt - Math.PI);
    const azimuthDeg = THREE.MathUtils.radToDeg(azimuth - Math.PI / 2);
    const azimuthDegClamped = (azimuthDeg + 360) % 360;

    info.tilt = Math.abs(tiltDeg);
    info.tilt > 90 ? (info.tilt = 90) : null;
    info.azimuth = Math.abs(azimuthDegClamped);

    panelCube.rotation.x = -Math.PI / 2 - THREE.MathUtils.degToRad(info.tilt);
    panelCylinder.rotation.y = -THREE.MathUtils.degToRad(info.azimuth);
    gui.updateDisplay();
}

function toggleArrowHelpers() {
    settingsFolder
        .add(info, 'showArrowHelpers')
        .name(text.vectorDirections[info.lang])
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
    controllers.push(panelFolder.add(info, 'incidentAngle').step(0.01).name(text.incidentAngle[info.lang]).listen());
    controllers.push(panelFolder.add(info, 'angleAlignment').step(0.01).name(text.alignment[info.lang]).listen());
    controllers.push(panelFolder.add(info, 'currentWattMinute').step(0.01).name('Watt').listen());
    controllers.push(panelFolder.add(info, 'totalKWH').step(0.0001).name(text.totalKWH[info.lang]).listen());

    panelFolder
        .add(
            {
                reset: () => {
                    info.totalKWH = 0;
                },
            },
            'reset'
        )
        .name(text.resetTotalKWH[info.lang]);

    const labels = panelFolder.domElement.getElementsByTagName('span');
    for (let label of labels) {
        if (label.innerHTML === text.incidentAngle[info.lang] || label.innerHTML === text.alignment[info.lang] || label.innerHTML === 'Watt' || label.innerHTML === text.totalKWH[info.lang]) {
            if (label.innerHTML === 'Watt' || label.innerHTML === text.totalKWH[info.lang]) {
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
        .name(text.sunIntensity[info.lang])
        .onChange((value) => {
            info.sunIntensity = value;
            updateSunPosition(sunLight, sunMesh, info.latitude, info.longitude, info.date, info.sunIntensity);
            calculateEnergyProduction();
        });
}

function createFolders() {
    panelFolder = gui.addFolder(text.panelFolderName[info.lang]);
    locationFolder = gui.addFolder(text.locationFolderName[info.lang]);
    timeFolder = gui.addFolder(text.timeFolderName[info.lang]);
    settingsFolder = gui.addFolder(text.settingsFolderName[info.lang]);
}

function addLanguageControl() {
    settingsFolder
        .add(info, 'lang', ['English', 'Nederlands'])
        .name(text.language[info.lang])
        .onChange((value) => {
            info.lang = value;
            let isPanelFolderClosed = panelFolder.closed;
            let isLocationFolderClosed = locationFolder.closed;
            let isTimeFolderClosed = timeFolder.closed;
            let isSettingsFolderClosed = settingsFolder.closed;
            gui.destroy();
            addGui();

            if (!isPanelFolderClosed) {
                panelFolder.open();
            }
            if (!isLocationFolderClosed) {
                locationFolder.open();
            }
            if (!isTimeFolderClosed) {
                timeFolder.open();
            }
            if (!isSettingsFolderClosed) {
                settingsFolder.open();
            }

            translateCloseButton();
        });
}

function addSettings() {
    toggleArrowHelpers();
    controlSunIntensity();
    addLanguageControl();
}

function addGui() {
    gui = new CustomGUI();
    createFolders();
    addPanelControls();
    createLocationControls();
    createTimeControls();
    displayPanelStats();
    addSettings();
    closeGuiButton = document.querySelector('.close-button');
    closeGuiButton.addEventListener('click', translateCloseButton);
}

function translateCloseButton() {
    const ul = closeGuiButton.parentElement.querySelector('ul');
    const isClosed = ul.classList.contains('closed');

    if (isClosed) {
        closeGuiButton.innerHTML = text.openControls[info.lang];
    } else {
        closeGuiButton.innerHTML = text.closeControls[info.lang];
    }
}

async function init() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    await getLocation();
    createSun();
    updateSunPosition(sunLight, sunMesh, info.latitude, info.longitude, info.date, info.sunIntensity);
    loadGrassland();
    loadNavigation();
    loadHouse();
    addRoofSolarPanel();
    calculateEnergyProduction();

    addGui();
    panelFolder.open();

    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('DOMContentLoaded', () => {
        translateCloseButton();
    });

    window.addEventListener('resize', onWindowResize, false);
}

init();
