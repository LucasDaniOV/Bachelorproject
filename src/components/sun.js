import {
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from 'three';

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

function updateSunPosition(sunLight, sunMesh, hour) {
  const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;

  const sunX = radius * Math.cos(angle);
  const sunY = radius * Math.sin(angle);

  sunLight.position.set(sunX, sunY, radius);
  sunMesh.position.set(sunX, sunY, radius);

  const intensity = Math.max(0.1, (sunY / radius) * multiplier);
  sunLight.intensity = intensity;
}

export { createSunLight, createSunMesh, updateSunPosition };
