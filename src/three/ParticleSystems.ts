import * as THREE from 'three';
import { isMobile } from '../utils/device.ts';

// Generates an offscreen canvas texture for smooth circular glow particles (no square edges)
function createRadialGlowTexture(innerRgb: string, outerRgb: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 31);
    gradient.addColorStop(0, innerRgb);
    gradient.addColorStop(0.35, innerRgb.replace(/[\d\.]+\)$/, '0.7)'));
    gradient.addColorStop(0.7, outerRgb.replace(/[\d\.]+\)$/, '0.2)'));
    gradient.addColorStop(1, outerRgb.replace(/[\d\.]+\)$/, '0)'));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 31, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Generates an organic flower petal texture (marigold / rose petal)
function createPetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.save();
    ctx.translate(32, 32);
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 15, Math.PI / 4, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 24);
    grad.addColorStop(0, 'rgba(255, 245, 230, 0.95)');
    grad.addColorStop(0.4, 'rgba(249, 115, 22, 0.85)');
    grad.addColorStop(0.8, 'rgba(220, 38, 38, 0.5)');
    grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export class FestivalParticles {
  public group: THREE.Group;
  private fireflies: THREE.Points;
  private petals: THREE.Points;
  private goldenDust: THREE.Points;
  private stars: THREE.Points;

  private fireflyPositions: Float32Array;
  private fireflyVelocities: Float32Array;
  private petalPositions: Float32Array;
  private dustPositions: Float32Array;

  // Textures cached to avoid square rasterization
  private glowTexture: THREE.CanvasTexture;
  private petalTexture: THREE.CanvasTexture;
  private starTexture: THREE.CanvasTexture;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'FestivalParticles';

    this.glowTexture = createRadialGlowTexture('rgba(254, 240, 138, 1)', 'rgba(245, 158, 11, 1)');
    this.petalTexture = createPetalTexture();
    this.starTexture = createRadialGlowTexture('rgba(255, 255, 255, 1)', 'rgba(186, 230, 253, 1)');

    // 1. Night Sky Stars
    this.createStars();

    // 2. Village Fireflies (positioned around nature, keeping Krishna center clear)
    this.createFireflies();

    // 3. Falling Flower Petals (gentle marigold blossoms around courtyard)
    this.createFlowerPetals();

    // 4. Subtle Golden Ambient Dust (on ground perimeter, clear of Krishna's view)
    this.createGoldenDust();
  }

  private createStars() {
    const starCount = isMobile ? 100 : 350;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = 6 + Math.random() * 40;
      positions[i * 3 + 2] = -15 - Math.random() * 45;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMat = new THREE.PointsMaterial({
      map: this.starTexture,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.stars = new THREE.Points(starGeo, starMat);
    this.group.add(this.stars);
  }

  private createFireflies() {
    const count = isMobile ? 16 : 60;
    this.fireflyPositions = new Float32Array(count * 3);
    this.fireflyVelocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Keep fireflies outside a 2.5m radius from Krishna (0, 0) so they never disturb the view of Lord Krishna
      let x = (Math.random() - 0.5) * 20;
      let z = (Math.random() - 0.5) * 20;
      const dist = Math.hypot(x, z);
      if (dist < 2.5) {
        x += (x >= 0 ? 2.5 : -2.5);
        z += (z >= 0 ? 2.5 : -2.5);
      }

      this.fireflyPositions[i * 3] = x;
      this.fireflyPositions[i * 3 + 1] = 0.5 + Math.random() * 4.0;
      this.fireflyPositions[i * 3 + 2] = z;

      this.fireflyVelocities[i * 3] = (Math.random() - 0.5) * 0.012;
      this.fireflyVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.006;
      this.fireflyVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.012;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.fireflyPositions, 3));

    const mat = new THREE.PointsMaterial({
      map: this.glowTexture,
      size: 0.38,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.fireflies = new THREE.Points(geo, mat);
    this.group.add(this.fireflies);
  }

  private createFlowerPetals() {
    const count = isMobile ? 22 : 90;
    this.petalPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute petals across the courtyard
      this.petalPositions[i * 3] = (Math.random() - 0.5) * 16;
      this.petalPositions[i * 3 + 1] = Math.random() * 10 + 1;
      this.petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.petalPositions, 3));

    const mat = new THREE.PointsMaterial({
      map: this.petalTexture,
      size: 0.32,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    this.petals = new THREE.Points(geo, mat);
    this.group.add(this.petals);
  }

  private createGoldenDust() {
    // Subtle ambient stardust around the courtyard perimeter and lower altar base
    // Exclude the direct sightline of Lord Krishna (center area 0,0)
    const count = isMobile ? 18 : 80;
    this.dustPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 4.5; // Strictly outer courtyard perimeter
      this.dustPositions[i * 3] = Math.cos(angle) * radius;
      this.dustPositions[i * 3 + 1] = 0.15 + Math.random() * 1.6; // Low to ground
      this.dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));

    const mat = new THREE.PointsMaterial({
      map: this.glowTexture,
      size: 0.22,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.goldenDust = new THREE.Points(geo, mat);
    this.group.add(this.goldenDust);
  }

  public showerPetals() {
    for (let i = 0; i < this.petalPositions.length / 3; i++) {
      this.petalPositions[i * 3 + 1] = 8 + Math.random() * 6;
      this.petalPositions[i * 3] = (Math.random() - 0.5) * 12;
      this.petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
  }

  public update(time: number) {
    // On mobile, throttle particle physics updates to 30fps to avoid GPU buffer re-upload bottlenecks
    if (isMobile && Math.floor(time * 30) % 2 !== 0) {
      return;
    }

    // 1. Firefly organic wandering movement
    const fPos = this.fireflies.geometry.attributes.position.array as Float32Array;
    const fCount = fPos.length / 3;
    for (let i = 0; i < fCount; i++) {
      fPos[i * 3] += Math.sin(time * 1.5 + i) * 0.012 + this.fireflyVelocities[i * 3];
      fPos[i * 3 + 1] += Math.cos(time * 1.2 + i * 2) * 0.008 + this.fireflyVelocities[i * 3 + 1];
      fPos[i * 3 + 2] += Math.sin(time * 1.3 + i * 3) * 0.012 + this.fireflyVelocities[i * 3 + 2];

      // Keep fireflies outside Krishna center corridor
      const d = Math.hypot(fPos[i * 3], fPos[i * 3 + 2]);
      if (d < 2.0) {
        fPos[i * 3] += (fPos[i * 3] >= 0 ? 0.05 : -0.05);
        fPos[i * 3 + 2] += (fPos[i * 3 + 2] >= 0 ? 0.05 : -0.05);
      }

      // Bounds
      if (Math.abs(fPos[i * 3]) > 11) fPos[i * 3] *= -0.9;
      if (fPos[i * 3 + 1] < 0.3) fPos[i * 3 + 1] = 3.5;
      if (fPos[i * 3 + 1] > 5.5) fPos[i * 3 + 1] = 0.5;
      if (Math.abs(fPos[i * 3 + 2]) > 11) fPos[i * 3 + 2] *= -0.9;
    }
    this.fireflies.geometry.attributes.position.needsUpdate = true;

    // 2. Flower petals gentle flutter & fall
    const pPos = this.petals.geometry.attributes.position.array as Float32Array;
    const pCount = pPos.length / 3;
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3 + 1] -= 0.018 + (i % 3) * 0.005;
      pPos[i * 3] += Math.sin(time * 2 + i) * 0.012;
      pPos[i * 3 + 2] += Math.cos(time * 1.8 + i) * 0.009;

      if (pPos[i * 3 + 1] < 0.05) {
        pPos[i * 3 + 1] = 8 + Math.random() * 3;
        pPos[i * 3] = (Math.random() - 0.5) * 14;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
    }
    this.petals.geometry.attributes.position.needsUpdate = true;

    // 3. Subtle ambient dust along courtyard ground
    const dPos = this.goldenDust.geometry.attributes.position.array as Float32Array;
    const dCount = dPos.length / 3;
    for (let i = 0; i < dCount; i++) {
      dPos[i * 3 + 1] += 0.004;
      dPos[i * 3] += Math.sin(time * 2 + i) * 0.003;
      if (dPos[i * 3 + 1] > 2.0) {
        dPos[i * 3 + 1] = 0.15;
      }
    }
    this.goldenDust.geometry.attributes.position.needsUpdate = true;
  }
}
