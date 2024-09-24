import { getPosition } from 'suncalc';
import { DirectionalLight, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

const radius = 300;
const multiplier = 8;

function createSunLight() {
    const sunLight = new DirectionalLight(0xffffff, 1);
    return sunLight;
}

function createSunMesh() {
    const sunGeometry = new SphereGeometry(10, 32, 32);
    const sunMaterial = new MeshBasicMaterial({ color: 0xffdd44 });
    const sunMesh = new Mesh(sunGeometry, sunMaterial);
    return sunMesh;
}

function updateSunPosition(sunLight, sunMesh, latitude, longitude, date, userMultiplier) {
    const sunPosition = getPosition(date, latitude, longitude);

    sunPosition.azimuth += Math.PI / 2;

    let sunX = radius * Math.cos(sunPosition.altitude) * Math.cos(sunPosition.azimuth);
    let sunY = radius * Math.sin(sunPosition.altitude);
    let sunZ = radius * Math.cos(sunPosition.altitude) * Math.sin(sunPosition.azimuth);

    sunLight.position.set(sunX, sunY, sunZ);
    sunMesh.position.set(sunX, sunY, sunZ);

    const intensity = Math.max(0.1, (sunY / radius) * multiplier * userMultiplier);
    sunLight.intensity = intensity;
}

export { createSunLight, createSunMesh, updateSunPosition };
