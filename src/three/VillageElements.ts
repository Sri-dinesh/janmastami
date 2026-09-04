import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createStandardMaterials, COLORS } from './materials.ts';

// Generates an offscreen canvas texture with realistic lunar maria & crater highlights
function createProceduralMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Pearl luminous white lunar surface
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 256);

    // Subtle dark lunar seas (maria)
    const maria = [
      { x: 180, y: 110, rx: 70, ry: 45, angle: 0.2 },
      { x: 260, y: 95, rx: 50, ry: 35, angle: -0.1 },
      { x: 310, y: 120, rx: 55, ry: 40, angle: 0.3 },
      { x: 140, y: 160, rx: 80, ry: 50, angle: -0.2 },
      { x: 280, y: 170, rx: 45, ry: 30, angle: 0.1 },
      { x: 350, y: 130, rx: 35, ry: 30, angle: 0 },
    ];

    maria.forEach((m) => {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.angle);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(m.rx, m.ry));
      grad.addColorStop(0, 'rgba(175, 188, 205, 0.45)');
      grad.addColorStop(0.6, 'rgba(195, 205, 220, 0.28)');
      grad.addColorStop(1, 'rgba(248, 250, 252, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, m.rx, m.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Bright crater rays (Tycho / Copernicus highlights)
    const craters = [
      { x: 240, y: 200, r: 14 },
      { x: 200, y: 120, r: 10 },
      { x: 160, y: 110, r: 8 },
      { x: 330, y: 150, r: 7 },
    ];
    craters.forEach((c) => {
      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 2.5);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r * 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Generates an offscreen canvas texture with ultra-soft feathered radial glow for the moon corona
function createProceduralMoonGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    grad.addColorStop(0.14, 'rgba(224, 242, 254, 0.72)');
    grad.addColorStop(0.32, 'rgba(186, 230, 253, 0.38)');
    grad.addColorStop(0.54, 'rgba(125, 211, 252, 0.16)');
    grad.addColorStop(0.78, 'rgba(56, 189, 248, 0.04)');
    grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Generates an offscreen canvas texture with traditional Indian Aipan / Pithha white rice-paste folk art
function createAipanMotifTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 128);

    // Auspicious repeating white rice-paste patterns
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = 3;

    // Top border wavy ribbon
    ctx.beginPath();
    for (let x = 0; x <= 512; x += 16) {
      const y = 20 + Math.sin((x / 512) * Math.PI * 16) * 8;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Bottom border wavy ribbon
    ctx.beginPath();
    for (let x = 0; x <= 512; x += 16) {
      const y = 108 + Math.cos((x / 512) * Math.PI * 16) * 8;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Sacred Lotus medallions along center
    for (let i = 0; i < 8; i++) {
      const cx = 32 + i * 64;
      const cy = 64;

      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      for (let p = 0; p < 8; p++) {
        const ang = (p / 8) * Math.PI * 2;
        const px = cx + Math.cos(ang) * 18;
        const py = cy + Math.sin(ang) * 18;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(2, 1);
  texture.needsUpdate = true;
  return texture;
}

// Custom Yamuna River Flowing Water Shader Material
function createYamunaWaterMaterial(moonPos: THREE.Vector3): THREE.ShaderMaterial {
  const moonDir = moonPos.clone().normalize();
  return new THREE.ShaderMaterial({
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vWaveHeight;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Flowing downstream along X with smooth multi-frequency waves
        float flow = pos.x * 0.32 + pos.z * 0.18 - uTime * 1.5;
        float cross = pos.x * 0.75 - pos.z * 0.42 + uTime * 2.1;
        float chop = pos.x * 1.85 + pos.z * 1.25 - uTime * 3.2;

        float wave1 = sin(flow) * 0.048;
        float wave2 = cos(cross) * 0.024;
        float wave3 = sin(chop) * 0.012;
        float totalWave = wave1 + wave2 + wave3;

        pos.y += totalWave;
        vWaveHeight = totalWave;

        // Analytical wave normal
        float dYdX = (cos(flow) * 0.32 * 0.048 - sin(cross) * 0.75 * 0.024 + cos(chop) * 1.85 * 0.012);
        float dYdZ = (cos(flow) * 0.18 * 0.048 + sin(cross) * 0.42 * 0.024 + cos(chop) * 1.25 * 0.012);
        vec3 waveNorm = normalize(vec3(-dYdX, 1.0, -dYdZ));
        vNormal = normalize(normalMatrix * waveNorm);

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uDeepColor;
      uniform vec3 uSurfaceColor;
      uniform vec3 uCrestColor;
      uniform vec3 uFoamColor;
      uniform vec3 uMoonDirection;
      uniform vec3 uMoonColor;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vWaveHeight;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);

        // Dynamic micro-ripples
        float rip1 = sin(vWorldPosition.x * 4.5 + vWorldPosition.z * 3.2 - uTime * 2.8);
        float rip2 = cos(vWorldPosition.x * 7.2 - vWorldPosition.z * 5.1 + uTime * 3.4);
        float microRipples = (rip1 + rip2) * 0.06;

        vec3 normal = normalize(vNormal + vec3(microRipples * 0.5, 0.0, microRipples * 0.5));

        // Fresnel reflection
        float NdotV = max(dot(normal, viewDir), 0.0);
        float fresnel = pow(1.0 - NdotV, 3.2);

        // Silvery moon specular reflection
        vec3 lightDir = normalize(uMoonDirection);
        vec3 halfVector = normalize(lightDir + viewDir);
        float NdotH = max(dot(normal, halfVector), 0.0);
        float moonSpecular = pow(NdotH, 64.0) * 1.35;
        float broadSpecular = pow(NdotH, 14.0) * 0.32;

        // Water depth & wave crest gradient
        vec3 waterCol = mix(uDeepColor, uSurfaceColor, clamp((vWaveHeight + 0.06) * 8.0, 0.0, 1.0));
        waterCol = mix(waterCol, uCrestColor, clamp(vWaveHeight * 12.0, 0.0, 0.45));

        // Shoreline soft foam along sandstone ghat steps
        float shoreDistance = smoothstep(0.85, 1.0, vUv.y);
        float foamWave = sin(vWorldPosition.x * 2.2 - uTime * 2.0) * 0.5 + 0.5;
        float foamIntensity = shoreDistance * foamWave * 0.65;
        waterCol = mix(waterCol, uFoamColor, foamIntensity);

        // Final color blending with silvery lunar glow
        vec3 finalCol = mix(waterCol, uMoonColor, fresnel * 0.55);
        finalCol += uMoonColor * (moonSpecular + broadSpecular);

        // Silvery sparkle
        float shimmer = sin(vWorldPosition.x * 12.0 + uTime * 4.0) * cos(vWorldPosition.z * 10.0 - uTime * 3.5);
        finalCol += uMoonColor * max(0.0, shimmer) * 0.08;

        float alpha = clamp(0.88 + fresnel * 0.12 + foamIntensity * 0.2, 0.78, 0.98);
        gl_FragColor = vec4(finalCol, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uDeepColor: { value: new THREE.Color(0x02284d) },
      uSurfaceColor: { value: new THREE.Color(0x0284c7) },
      uCrestColor: { value: new THREE.Color(0x38bdf8) },
      uFoamColor: { value: new THREE.Color(0xf0f9ff) },
      uMoonDirection: { value: moonDir },
      uMoonColor: { value: new THREE.Color(0xdbeafe) },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

// Helper to calculate exact outer clay pot radius at height y from spline profile
function getOuterPotRadiusAtY(y: number, outerPoints: THREE.Vector2[]): number {
  let closestR = 0.55;
  let minDy = 999;
  for (let i = 0; i < outerPoints.length; i++) {
    const pt = outerPoints[i];
    const dy = Math.abs(pt.y - y);
    if (dy < minDy) {
      minDy = dy;
      closestR = pt.x;
    }
  }
  return closestR;
}

// Sculpted organic whipped butter dome with procedural churned ripples & peaks
function createSculptedButterDome(radius = 0.42): THREE.BufferGeometry {
  const butterGeo = new THREE.SphereGeometry(radius, 48, 32);
  const pos = butterGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let px = pos.getX(i);
    let py = pos.getY(i);
    let pz = pos.getZ(i);

    if (py < 0) {
      py *= 0.15; // Flatten bottom sitting inside pot neck
    } else {
      const angle = Math.atan2(pz, px);
      const rad = Math.sqrt(px * px + pz * pz);
      const ripple = Math.sin(angle * 4.0 + py * 5.0) * (0.032 * (radius / 0.42)) +
                     Math.cos(rad * 8.0) * (0.022 * (radius / 0.42));
      const crown = Math.exp(-Math.pow(rad, 2) / 0.08) * (0.08 * (radius / 0.42));
      py = py * 0.72 + ripple + crown;
      px += Math.cos(angle) * (ripple * 0.4);
      pz += Math.sin(angle) * (ripple * 0.4);
    }
    pos.setXYZ(i, px, py, pz);
  }
  butterGeo.computeVertexNormals();
  return butterGeo;
}

// Anatomical Indian Gir Zebu Body with continuous quad-lofted geometry, forward-tilted hump, deep brisket, and pelvic contours
function createAnatomicalZebuBody(scale = 1.0): THREE.BufferGeometry {
  const rings = 36;
  const slices = 32;
  const verts: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const lengthSpan = 1.54 * scale;
  const startX = 0.72 * scale;

  for (let i = 0; i < rings; i++) {
    const t = i / (rings - 1);
    const x = startX - t * lengthSpan;

    // Centerline spine height cy
    let cy = 1.14 * scale;
    if (t < 0.25) {
      cy = (1.14 + (t / 0.25) * 0.06) * scale;
    } else if (t < 0.65) {
      const u = (t - 0.25) / 0.40;
      cy = (1.20 - Math.sin(u * Math.PI) * 0.08) * scale;
    } else {
      const u = (t - 0.65) / 0.35;
      cy = (1.12 + Math.sin(u * Math.PI * 0.8) * 0.08 - u * 0.08) * scale;
    }

    // Width and Height profiles
    let halfWidth = 0.24 * scale;
    let halfHeight = 0.28 * scale;
    if (t < 0.25) {
      const u = t / 0.25;
      halfWidth = (0.24 + u * 0.09) * scale;
      halfHeight = (0.28 + u * 0.10) * scale;
    } else if (t < 0.65) {
      const u = (t - 0.25) / 0.40;
      halfWidth = (0.33 + Math.sin(u * Math.PI) * 0.05 - u * 0.06) * scale;
      halfHeight = (0.38 + Math.sin(u * Math.PI) * 0.03 - u * 0.06) * scale;
    } else {
      const u = (t - 0.65) / 0.35;
      halfWidth = (0.32 + Math.sin(u * Math.PI * 0.7) * 0.04 - u * 0.18) * scale;
      halfHeight = (0.35 - u * 0.16) * scale;
    }

    // Sacred Gir Hump (Kakud) perched over the withers
    const humpAmp = 0.42 * scale;
    const hump = Math.exp(-Math.pow((t - 0.16) / 0.09, 2)) * humpAmp;

    // Brisket drop between forelegs
    const brisketAmp = 0.16 * scale;
    const brisket = Math.exp(-Math.pow((t - 0.18) / 0.11, 2)) * brisketAmp;

    // Belly sag along flank
    const bellyAmp = (t >= 0.25 && t <= 0.65)
      ? Math.sin(((t - 0.25) / 0.40) * Math.PI) * 0.08 * scale
      : 0;

    // Shoulder scapula & Haunch lateral muscular contours
    const shoulderBulge = Math.exp(-Math.pow((t - 0.18) / 0.08, 2)) * 0.06 * scale;
    const haunchBulge = Math.exp(-Math.pow((t - 0.76) / 0.10, 2)) * 0.07 * scale;

    for (let j = 0; j < slices; j++) {
      const angle = (j / slices) * Math.PI * 2.0;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Y deformation
      let dy = cosA * halfHeight;
      if (cosA > 0) {
        // Dorsal side - hump
        const topFactor = Math.pow(cosA, 2.2);
        dy += hump * topFactor;
      } else {
        // Ventral side - brisket & belly
        const botFactor = Math.pow(-cosA, 1.6);
        dy -= (brisket + bellyAmp) * botFactor;
      }

      // Z deformation (width + lateral muscles)
      let dz = sinA * halfWidth;
      const lateralFactor = Math.pow(Math.abs(sinA), 2.0);
      dz += Math.sign(sinA) * (shoulderBulge + haunchBulge) * lateralFactor;

      verts.push(x, cy + dy, dz);
      uvs.push(t, j / slices);
    }
  }

  // Quads to triangles
  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < slices; j++) {
      const nextJ = (j + 1) % slices;
      const a = i * slices + j;
      const b = (i + 1) * slices + j;
      const c = (i + 1) * slices + nextJ;
      const d = i * slices + nextJ;
      indices.push(a, b, c, a, c, d);
    }
  }

  // Front Cap
  const frontPoleIdx = verts.length / 3;
  verts.push(startX + 0.08 * scale, 1.14 * scale, 0);
  uvs.push(0, 0.5);
  for (let j = 0; j < slices; j++) {
    const nextJ = (j + 1) % slices;
    indices.push(frontPoleIdx, nextJ, j);
  }

  // Rear Cap
  const rearPoleIdx = verts.length / 3;
  verts.push(startX - lengthSpan - 0.08 * scale, 1.12 * scale, 0);
  uvs.push(1, 0.5);
  const lastRingOffset = (rings - 1) * slices;
  for (let j = 0; j < slices; j++) {
    const nextJ = (j + 1) % slices;
    indices.push(rearPoleIdx, lastRingOffset + j, lastRingOffset + nextJ);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Auspicious Pichwai-style royal embroidered silk saddle cloth (Jhool) draped over cow back
function createPichwaiJhool(scale = 1.0): THREE.BufferGeometry {
  const rings = 20;
  const slices = 20;
  const verts: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const startX = 0.16 * scale;
  const lengthX = 0.76 * scale;
  const drapeWidth = 0.52 * scale;

  for (let i = 0; i < rings; i++) {
    const u = i / (rings - 1);
    const x = startX - u * lengthX;
    
    // Exact height of cow back at this X with slight offset to avoid z-fighting
    const t = (0.72 * scale - x) / (1.54 * scale);
    const spineY = (1.20 - Math.sin(t * Math.PI) * 0.05 + 0.018) * scale;
    const cowHalfWidth = (0.32 + Math.sin(t * Math.PI) * 0.03) * scale;

    for (let j = 0; j < slices; j++) {
      const v = (j / (slices - 1)) * 2.0 - 1.0; // -1 to +1
      const sideFactor = Math.abs(v);
      const angle = (v * Math.PI * 0.5);

      const z = Math.sin(angle) * (cowHalfWidth + 0.016 * scale);
      const yDrop = Math.pow(sideFactor, 1.8) * drapeWidth;
      const y = spineY - yDrop;

      verts.push(x, y, z);
      uvs.push(u, (v + 1) * 0.5);
    }
  }

  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < slices - 1; j++) {
      const a = i * slices + j;
      const b = (i + 1) * slices + j;
      const c = (i + 1) * slices + j + 1;
      const d = i * slices + j + 1;
      indices.push(a, b, c, a, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export class VillageEnvironment {
  public group: THREE.Group;
  private materials = createStandardMaterials();

  // Interactive references
  public matkiGroup: THREE.Group;
  public matkiButterSplashes: THREE.Group;
  public cowGroup: THREE.Group;
  public cowHead: THREE.Group;
  public cowEars: THREE.Group[] = [];
  public cowTail?: THREE.Group;
  public calfGroup: THREE.Group;
  public calfHead: THREE.Group;
  public fluteGroup: THREE.Group;
  public fluteModel: THREE.Group | null = null;
  public fluteAltarLight: THREE.PointLight;
  public fluteAuraRing: THREE.Mesh;
  public jhulaSeat: THREE.Group;
  public cuteKrishnaGroup: THREE.Group;
  public cuteKrishnaMesh: THREE.Group | null = null;
  public cuteKrishnaProcedural: THREE.Group;
  public isCuteKrishnaLoaded: boolean = false;
  public jhulaAngle: number = 0;
  public jhulaVelocity: number = 0;
  public diyas: THREE.Group[] = [];
  public diyaFlames: THREE.Mesh[] = [];
  public diyaLights: THREE.PointLight[] = [];
  public lotusBlossoms: THREE.Group[] = [];
  public lotusData: Array<{ group: THREE.Group; baseX: number; baseZ: number; phase: number }> = [];
  public waterMesh: THREE.Mesh;
  public waterGeometry: THREE.PlaneGeometry;
  public waterMaterial?: THREE.ShaderMaterial;
  public waterInitialPositions: Float32Array;
  public floatingDiyas: Array<{
    group: THREE.Group;
    light: THREE.PointLight;
    flame: THREE.Mesh;
    baseX: number;
    baseZ: number;
    speed: number;
    phase: number;
  }> = [];
  public moonMesh: THREE.Mesh;
  public moonGroup: THREE.Group;
  public moonHalos: THREE.Mesh[] = [];
  public moonPos = new THREE.Vector3(4.2, 9.8, -15);

  // Hanging Festive Lanterns with soft flickering point lights
  public hangingLanterns: Array<{
    group: THREE.Group;
    lanternAssembly: THREE.Group;
    light: THREE.PointLight;
    glowMesh: THREE.Mesh;
    baseIntensity: number;
    baseEmissive: number;
    flickerSpeed: number;
    phaseOffset: number;
    swaySpeed: number;
    swayAngle: number;
  }> = [];

  // Matki wobble physics
  public matkiWobble: number = 0;
  public matkiWobbleVel: number = 0;

  // Cow interaction reaction
  public cowReaction: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'VillageEnvironment';

    // 1. Terrain Ground
    this.createTerrain();

    // 2. Mud Houses & Village Courtyard
    this.createHouses();

    // 3. Hanging Interactive Butter Matki
    this.createInteractiveMatki();

    // 4. Cute Mother Cow & Calf
    this.createCows();

    // 5. Dedicated Divine Krishna Flute Altar (Bansuri Singhasan)
    this.createKrishnaFluteAltar();

    // 6. Decorated Janmashtami Jhula (Floral Swing)
    this.createJhula();

    // 7. Sacred Yamuna River Area & Lotus
    this.createYamunaRiver();

    // 8. Courtyard Rangoli & Tulsi Vrindavan
    this.createRangoliAndTulsi();

    // 9. Trees & Foliage
    this.createTrees();

    // 10. Lit Festive Diyas
    this.createDiyas();

    // 11. Celestial Moon & Distant Hills
    this.createMoonAndHills();

    // 12. Hanging Festive Lanterns with soft flickering point lights
    this.createHangingLanterns();
  }

  private createTerrain() {
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x271e16,
      roughness: 0.95,
      metalness: 0.0,
    });
    const grassBankMat = new THREE.MeshStandardMaterial({
      color: 0x16301a,
      roughness: 0.92,
    });

    // 1. Village Courtyard Earth Platform (terminates cleanly at z = -7.5 where the Yamuna Ghat begins)
    const courtyardGeo = new THREE.BoxGeometry(46, 1.2, 29);
    const courtyardMesh = new THREE.Mesh(courtyardGeo, groundMat);
    courtyardMesh.position.set(0, -0.6, 7.0);
    courtyardMesh.receiveShadow = true;
    this.group.add(courtyardMesh);

    // Rounded soft grassy mounds framing the left and right courtyard flanks
    const leftMoundGeo = new THREE.CylinderGeometry(8, 12, 1.1, 24);
    const leftMound = new THREE.Mesh(leftMoundGeo, grassBankMat);
    leftMound.position.set(-19, -0.55, 6);
    leftMound.receiveShadow = true;
    this.group.add(leftMound);

    const rightMound = new THREE.Mesh(leftMoundGeo, grassBankMat);
    rightMound.position.set(19, -0.55, 6);
    rightMound.receiveShadow = true;
    this.group.add(rightMound);

    // 2. Distant North Bank of Yamuna (behind the river, framing the sacred Govardhan hills)
    const northBankGeo = new THREE.BoxGeometry(58, 1.6, 12);
    const northBank = new THREE.Mesh(northBankGeo, grassBankMat);
    northBank.position.set(0, -0.3, -30);
    northBank.receiveShadow = true;
    this.group.add(northBank);

    // 3. Stone pathway tiles leading through village to Krishna
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x4a3b32,
      roughness: 0.85,
    });
    for (let i = 0; i < 20; i++) {
      const z = -7.0 + i * 0.85;
      const x = Math.sin(i * 0.45) * 0.75;
      const stoneGeo = new THREE.BoxGeometry(1.2 + (i % 3) * 0.15, 0.08, 0.65);
      const stone = new THREE.Mesh(stoneGeo, pathMat);
      stone.position.set(x, 0.04, z);
      stone.rotation.y = (Math.sin(i * 1.3)) * 0.15;
      stone.receiveShadow = true;
      this.group.add(stone);
    }
  }

  private createHouses() {
    // Village House 1 (Left background)
    const house1 = this.createSingleHouse(3.5, 2.8, 3.8, 0xb46b38);
    house1.position.set(-5.5, 0, -3.5);
    house1.rotation.y = 0.4;
    this.group.add(house1);

    // Village House 2 (Right background)
    const house2 = this.createSingleHouse(4.0, 3.0, 4.0, 0xa1582c);
    house2.position.set(6.2, 0, -2.5);
    house2.rotation.y = -0.35;
    this.group.add(house2);

    // Village House 3 (Far Left)
    const house3 = this.createSingleHouse(3.2, 2.5, 3.2, 0x8c4b20);
    house3.position.set(-8.5, 0, 3.0);
    house3.rotation.y = 0.8;
    this.group.add(house3);
  }

  private createSingleHouse(w: number, h: number, d: number, wallColor: number): THREE.Group {
    const house = new THREE.Group();

    // Mud plaster walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.9,
    });
    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = h / 2;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    house.add(wallMesh);

    // Curved clay thatch roof
    const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.85, 1.8, 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: COLORS.clayRoof,
      roughness: 0.8,
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = h + 0.85;
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.castShadow = true;
    house.add(roofMesh);

    // Arched wooden doorway
    const doorGeo = new THREE.BoxGeometry(w * 0.3, h * 0.65, 0.08);
    const doorMat = new THREE.MeshStandardMaterial({
      color: COLORS.wood,
      roughness: 0.7,
    });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, (h * 0.65) / 2, d / 2 + 0.04);
    house.add(doorMesh);

    // Glowing window with warm light
    const windowGeo = new THREE.BoxGeometry(0.5, 0.5, 0.06);
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
    windowMesh.position.set(w * 0.32, h * 0.6, d / 2 + 0.04);
    house.add(windowMesh);

    // Toran (Mango leaves & marigold garland over doorway)
    const toranGeo = new THREE.TorusGeometry(w * 0.22, 0.04, 6, 12, Math.PI);
    const toranMat = new THREE.MeshStandardMaterial({ color: COLORS.marigoldOrange });
    const toranMesh = new THREE.Mesh(toranGeo, toranMat);
    toranMesh.position.set(0, h * 0.66, d / 2 + 0.06);
    house.add(toranMesh);

    // Veranda wooden corner posts
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, h, 8);
    const leftPost = new THREE.Mesh(postGeo, doorMat);
    leftPost.position.set(-w / 2 + 0.1, h / 2, d / 2 + 0.4);
    house.add(leftPost);

    const rightPost = leftPost.clone();
    rightPost.position.set(w / 2 - 0.1, h / 2, d / 2 + 0.4);
    house.add(rightPost);

    return house;
  }

  private createInteractiveMatki() {
    this.matkiGroup = new THREE.Group();
    this.matkiGroup.name = 'InteractiveMatkiGroup';
    this.matkiGroup.position.set(-2.2, 2.5, 1.2);

    // 1. Rustic Timber Rafter Beam with iron hanging hook & ceiling mounting peg
    const beamGeo = new THREE.CylinderGeometry(0.075, 0.08, 2.8, 16);
    beamGeo.rotateZ(Math.PI / 2);
    const beamMesh = new THREE.Mesh(beamGeo, this.materials.wood);
    beamMesh.position.y = 1.65;
    beamMesh.castShadow = true;
    this.matkiGroup.add(beamMesh);

    // Iron ceiling ring & mounting peg
    const ceilingRingGeo = new THREE.TorusGeometry(0.075, 0.016, 8, 24);
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.55, metalness: 0.75 });
    const ceilingRing = new THREE.Mesh(ceilingRingGeo, ironMat);
    ceilingRing.position.set(0, 1.58, 0);
    this.matkiGroup.add(ceilingRing);

    // Master apex jute rope loop with bound twine coil
    const topCoilGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.20, 14);
    const topCoil = new THREE.Mesh(topCoilGeo, this.materials.jute);
    topCoil.position.set(0, 1.45, 0);
    this.matkiGroup.add(topCoil);

    // 2. Authentic Macrame Jute Sikka (Chhinka / Hanging Pot Harness)
    // Four braided twisted jute suspension cords descending to the pot
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const ropeGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.28, 10);
      const rope = new THREE.Mesh(ropeGeo, this.materials.jute);
      rope.position.set(Math.cos(angle) * 0.28, 0.85, Math.sin(angle) * 0.28);
      rope.rotation.x = Math.sin(angle) * 0.22;
      rope.rotation.z = -Math.cos(angle) * 0.22;
      this.matkiGroup.add(rope);

      // Polished brass ringlet connectors on ropes
      const ringlet = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.009, 8, 20), this.materials.brassGold);
      ringlet.position.set(Math.cos(angle) * 0.38, 0.38, Math.sin(angle) * 0.38);
      this.matkiGroup.add(ringlet);

      // Carved wooden spacer bead on rope
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), this.materials.wood);
      bead.position.set(Math.cos(angle) * 0.33, 0.62, Math.sin(angle) * 0.33);
      this.matkiGroup.add(bead);
    }

    // Macrame Diamond Cradle Netting cupping the belly of the pot
    const netUpperRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.022, 8, 48), this.materials.jute);
    netUpperRing.rotation.x = Math.PI / 2;
    netUpperRing.position.y = 0.20;
    this.matkiGroup.add(netUpperRing);

    const netLowerRing = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.022, 8, 48), this.materials.jute);
    netLowerRing.rotation.x = Math.PI / 2;
    netLowerRing.position.y = -0.32;
    this.matkiGroup.add(netLowerRing);

    // Interlocking macrame diagonal web strands and knot beads
    for (let k = 0; k < 8; k++) {
      const knotAngle = (k / 8) * Math.PI * 2;
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), this.materials.jute);
      knot.position.set(Math.cos(knotAngle) * 0.58, 0.20, Math.sin(knotAngle) * 0.58);
      this.matkiGroup.add(knot);

      // Diagonal cradle cord
      const nextAngle = ((k + 1) / 8) * Math.PI * 2;
      const diagRopeGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.56, 8);
      const diagRope = new THREE.Mesh(diagRopeGeo, this.materials.jute);
      diagRope.position.set(
        (Math.cos(knotAngle) + Math.cos(nextAngle)) * 0.27,
        -0.06,
        (Math.sin(knotAngle) + Math.sin(nextAngle)) * 0.27
      );
      diagRope.rotation.z = Math.cos(knotAngle) * 0.5;
      diagRope.rotation.x = Math.sin(knotAngle) * 0.5;
      this.matkiGroup.add(diagRope);
    }

    // Jute tassel skirt cluster dangling below pot with terracotta beads & golden bells
    const tasselHub = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), this.materials.jute);
    tasselHub.position.set(0, -0.68, 0);
    this.matkiGroup.add(tasselHub);

    for (let t = 0; t < 6; t++) {
      const tAngle = (t / 6) * Math.PI * 2;
      const tasselCord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.009, 0.44 + (t % 2) * 0.12, 6),
        this.materials.jute
      );
      tasselCord.position.set(Math.cos(tAngle) * 0.06, -0.92, Math.sin(tAngle) * 0.06);
      this.matkiGroup.add(tasselCord);

      // Miniature terracotta bead
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), this.materials.terracotta);
      bead.position.set(Math.cos(tAngle) * 0.06, -0.84, Math.sin(tAngle) * 0.06);
      this.matkiGroup.add(bead);

      // Golden Ghungroo bell on tassel end
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), this.materials.brassGold);
      bell.position.set(Math.cos(tAngle) * 0.06, -1.16 - (t % 2) * 0.08, Math.sin(tAngle) * 0.06);
      this.matkiGroup.add(bell);
    }

    // 3. Earthen Terracotta Matki (Masterpiece Artisan Lathe Geometry - 96 segments, spline-interpolated profile)
    const potGroup = new THREE.Group();
    potGroup.name = 'MatkiPot';

    // Master Indian pottery clay pot cross-section profile points
    const potProfilePoints: THREE.Vector2[] = [
      new THREE.Vector2(0.001, -0.64), // Concave base center
      new THREE.Vector2(0.20, -0.64),  // Base underside
      new THREE.Vector2(0.28, -0.64),  // Footring outer bevel
      new THREE.Vector2(0.32, -0.58),  // Footring rise
      new THREE.Vector2(0.42, -0.48),  // Lower pot expansion
      new THREE.Vector2(0.55, -0.34),  // Swelling lower belly
      new THREE.Vector2(0.66, -0.16),  // Lower-mid belly
      new THREE.Vector2(0.71, 0.00),   // Widest equator of the Handi
      new THREE.Vector2(0.70, 0.12),   // Upper belly swell
      new THREE.Vector2(0.64, 0.24),   // Upper belly
      new THREE.Vector2(0.55, 0.36),   // Graceful shoulder taper
      new THREE.Vector2(0.44, 0.46),   // Shoulder to neck curve
      new THREE.Vector2(0.36, 0.52),   // Concave bottleneck groove
      new THREE.Vector2(0.42, 0.56),   // Raised clay collar (Kanthi)
      new THREE.Vector2(0.40, 0.60),   // Neck throat
      new THREE.Vector2(0.46, 0.64),   // Flared lip start
      new THREE.Vector2(0.54, 0.68),   // Flared Handi outer rim
      new THREE.Vector2(0.55, 0.72),   // Rounded rolled lip apex (Kundal)
      new THREE.Vector2(0.48, 0.73),   // Inner rim crest
      new THREE.Vector2(0.40, 0.69),   // Inner mouth lip
      new THREE.Vector2(0.34, 0.62),   // Inner neck throat
      new THREE.Vector2(0.30, 0.54),   // Inner mouth wall
      new THREE.Vector2(0.001, 0.50),  // Inner mouth floor
    ];

    // Spline curve interpolation for continuous silky-smooth ceramic clay curvature
    const potSpline = new THREE.SplineCurve(potProfilePoints);
    const smoothPotProfile = potSpline.getPoints(180);
    const potGeo = new THREE.LatheGeometry(smoothPotProfile, 96);
    potGeo.computeVertexNormals();
    const potMesh = new THREE.Mesh(potGeo, this.materials.terracotta);
    potMesh.castShadow = true;
    potMesh.receiveShadow = true;
    potGroup.add(potMesh);

    // Spline for the outer surface (indices 0 to 17) used to strictly conform decals & butter drips
    const outerWallSpline = new THREE.SplineCurve(potProfilePoints.slice(0, 18));
    const outerWallPoints = outerWallSpline.getPoints(120);

    // Decorative traditional braided clay rope relief band along shoulder
    const reliefRope = new THREE.Mesh(
      new THREE.TorusGeometry(0.56, 0.022, 10, 64),
      this.materials.sandstone
    );
    reliefRope.rotation.x = Math.PI / 2;
    reliefRope.position.y = 0.34;
    potGroup.add(reliefRope);

    // Ring of 24 sculpted spherical clay relief studs around upper belly
    for (let s = 0; s < 24; s++) {
      const sAngle = (s / 24) * Math.PI * 2;
      const stud = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), this.materials.sandstone);
      stud.position.set(Math.cos(sAngle) * 0.65, 0.22, Math.sin(sAngle) * 0.65);
      potGroup.add(stud);
    }

    // Traditional white Aipan / Pithha folk art painted band form-fitted to the spherical belly
    const aipanTex = createAipanMotifTexture();
    const aipanDecalPoints: THREE.Vector2[] = [];
    const decalSteps = 24;
    for (let s = 0; s <= decalSteps; s++) {
      const u = s / decalSteps;
      const dy = -0.16 + u * 0.32;
      const r = getOuterPotRadiusAtY(dy, outerWallPoints) + 0.005; // 5mm offset
      aipanDecalPoints.push(new THREE.Vector2(r, dy));
    }
    const aipanBandGeo = new THREE.LatheGeometry(aipanDecalPoints, 96);
    const aipanMat = new THREE.MeshStandardMaterial({
      map: aipanTex,
      transparent: true,
      opacity: 0.90,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    const aipanMesh = new THREE.Mesh(aipanBandGeo, aipanMat);
    potGroup.add(aipanMesh);

    // Sacred Red & Yellow Kalawa/Mauli thread wrapped 5 times around the neck
    for (let w = 0; w < 5; w++) {
      const threadMat = w % 2 === 0 ? this.materials.marigoldOrange : this.materials.marigoldYellow;
      const kalawa = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.012, 6, 40), threadMat);
      kalawa.rotation.x = Math.PI / 2;
      kalawa.position.y = 0.50 + w * 0.022;
      potGroup.add(kalawa);
    }

    // Sacred Kalawa tied knot & hanging ceremonial tails
    const kalawaKnot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), this.materials.marigoldOrange);
    kalawaKnot.position.set(0.38, 0.54, 0.12);
    potGroup.add(kalawaKnot);

    const tail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.005, 0.22, 6).rotateZ(0.3), this.materials.marigoldYellow);
    tail1.position.set(0.42, 0.44, 0.13);
    potGroup.add(tail1);

    const tail2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.005, 0.26, 6).rotateZ(0.15), this.materials.marigoldOrange);
    tail2.position.set(0.39, 0.42, 0.15);
    potGroup.add(tail2);

    // Exquisite miniature sacred peacock feather (Mor Pankh) tucked into the neck
    const featherQuill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.004, 0.46, 8),
      this.materials.gold
    );
    featherQuill.position.set(0.32, 0.74, 0.14);
    featherQuill.rotation.z = -0.42;
    featherQuill.rotation.y = 0.2;
    potGroup.add(featherQuill);

    const featherEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.10, 16, 16).scale(0.72, 1.45, 0.16),
      this.materials.peacockTeal
    );
    featherEye.position.set(0.46, 0.92, 0.18);
    featherEye.rotation.z = -0.42;
    potGroup.add(featherEye);

    const featherCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 12, 12).scale(0.8, 1.25, 0.22),
      this.materials.peacockBlue
    );
    featherCore.position.set(0.46, 0.92, 0.19);
    featherCore.rotation.z = -0.42;
    potGroup.add(featherCore);

    // Golden halo rim around feather eye
    const featherGoldRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.082, 0.012, 6, 24).scale(0.75, 1.4, 1.0),
      this.materials.gold
    );
    featherGoldRim.position.set(0.46, 0.92, 0.185);
    featherGoldRim.rotation.z = -0.42;
    potGroup.add(featherGoldRim);

    // 4. Luscious Sculpted Fresh Makhan (Whipped White Butter) Overflowing
    const makhanGroup = new THREE.Group();

    // Procedural noise-sculpted whipped butter dome overflowing over the mouth rim
    const sculptedButterGeo = createSculptedButterDome(0.42);
    const mainMound = new THREE.Mesh(sculptedButterGeo, this.materials.butter);
    mainMound.position.y = 0.64;
    mainMound.castShadow = true;
    mainMound.receiveShadow = true;
    makhanGroup.add(mainMound);

    // Fresh sacred green Tulsi leaf (holy basil) resting atop the fresh butter
    const tulsiStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.004, 0.14, 6),
      this.materials.foliage
    );
    tulsiStem.position.set(0.02, 0.86, 0.04);
    tulsiStem.rotation.z = 0.4;
    makhanGroup.add(tulsiStem);

    const tulsiLeaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10).scale(1.4, 0.2, 0.85),
      this.materials.foliage
    );
    tulsiLeaf.position.set(0.08, 0.88, 0.04);
    tulsiLeaf.rotation.y = 0.3;
    makhanGroup.add(tulsiLeaf);

    // Fragrant Parijat / Jasmine white flower offering on butter
    const parijatCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.008, 0.04, 6),
      this.materials.marigoldOrange
    );
    parijatCenter.position.set(-0.06, 0.86, 0.08);
    makhanGroup.add(parijatCenter);

    for (let p = 0; p < 5; p++) {
      const pAngle = (p / 5) * Math.PI * 2;
      const parijatPetal = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 6, 6).scale(1.2, 0.2, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
      );
      parijatPetal.position.set(-0.06 + Math.cos(pAngle) * 0.035, 0.86, 0.08 + Math.sin(pAngle) * 0.035);
      makhanGroup.add(parijatPetal);
    }

    // Authentic viscous cascading butter streams conforming strictly to the terracotta pot's curvature
    const dripConfigs = [
      { angle: 0.4, length: 0.45, radius: 0.046 },
      { angle: 1.5, length: 0.68, radius: 0.042 },
      { angle: 2.7, length: 0.34, radius: 0.040 },
      { angle: 3.8, length: 0.58, radius: 0.044 },
      { angle: 4.9, length: 0.74, radius: 0.042 },
      { angle: 5.8, length: 0.42, radius: 0.040 },
    ];

    dripConfigs.forEach((d) => {
      const dripPts: THREE.Vector3[] = [];
      const steps = 16;
      const startY = 0.70;
      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        const curY = startY - u * d.length;
        const r = getOuterPotRadiusAtY(curY, outerWallPoints) + 0.014;
        const curAngle = d.angle + Math.sin(u * Math.PI) * 0.035;
        dripPts.push(new THREE.Vector3(Math.cos(curAngle) * r, curY, Math.sin(curAngle) * r));
      }
      const dripCurve = new THREE.CatmullRomCurve3(dripPts);
      const streamGeo = new THREE.TubeGeometry(dripCurve, 20, d.radius * 0.75, 10, false);
      const stream = new THREE.Mesh(streamGeo, this.materials.butter);
      stream.castShadow = true;
      makhanGroup.add(stream);

      // Rounded teardrop droplet at bottom of stream
      const tipPt = dripPts[dripPts.length - 1];
      const dropBead = new THREE.Mesh(
        new THREE.SphereGeometry(d.radius * 1.35, 14, 14).scale(0.85, 1.25, 0.85),
        this.materials.butter
      );
      dropBead.position.copy(tipPt);
      dropBead.position.y -= d.radius * 0.35;
      dropBead.castShadow = true;
      makhanGroup.add(dropBead);
    });

    potGroup.add(makhanGroup);
    this.matkiGroup.add(potGroup);

    // 5. Interactive Butter Splashes (24 droplets created with dynamic spread)
    this.matkiButterSplashes = new THREE.Group();
    this.matkiButterSplashes.visible = false;
    for (let i = 0; i < 24; i++) {
      const dropGeo = new THREE.SphereGeometry(0.04 + Math.random() * 0.06, 10, 10);
      const drop = new THREE.Mesh(dropGeo, this.materials.butter);
      drop.position.set(
        (Math.random() - 0.5) * 1.2,
        0.55 + (Math.random() - 0.5) * 0.9,
        (Math.random() - 0.5) * 1.2
      );
      this.matkiButterSplashes.add(drop);
    }
    this.matkiGroup.add(this.matkiButterSplashes);

    this.group.add(this.matkiGroup);
  }

  private createCows() {
    // 1. Mother Sacred Cow (Gomati) - Indian Gir Zebu (Bos indicus) detailed anatomical geometry
    this.cowGroup = new THREE.Group();
    this.cowGroup.name = 'SacredCow';
    this.cowGroup.position.set(3.4, 0, 1.4);
    this.cowGroup.rotation.y = -0.75;

    // Muscular Anatomical Zebu Body with continuous quad-lofted geometry, forward-tilted hump, deep brisket, and pelvic contours
    const bodyGeo = createAnatomicalZebuBody(1.0);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.cowWhite);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyMesh.name = 'SacredCowBody';
    this.cowGroup.add(bodyMesh);

    // Traditional piebald markings (soft warm ochre patches on coat)
    const spot1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16).scale(1.25, 0.38, 0.8),
      this.materials.terracotta
    );
    spot1.position.set(0.12, 1.28, 0.36);
    spot1.rotation.y = 0.2;
    this.cowGroup.add(spot1);

    const spot2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 14, 14).scale(1.15, 0.32, 0.65),
      this.materials.terracotta
    );
    spot2.position.set(-0.36, 1.22, -0.38);
    this.cowGroup.add(spot2);

    // Auspicious Pichwai-style royal embroidered silk saddle cloth (Jhool) draped over cow back
    const jhoolGeo = createPichwaiJhool(1.0);
    const jhoolMesh = new THREE.Mesh(jhoolGeo, this.materials.crimsonVelvet);
    jhoolMesh.castShadow = true;
    this.cowGroup.add(jhoolMesh);

    // Golden embroidered lotus medallion on both flanks of the Pichwai Jhool
    [-0.35, 0.35].forEach((lz) => {
      const medallionGroup = new THREE.Group();
      medallionGroup.position.set(-0.22, 1.05, lz);
      medallionGroup.rotation.y = lz > 0 ? Math.PI / 2 : -Math.PI / 2;

      const disk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.10, 0.10, 0.012, 16),
        this.materials.zariGold
      );
      disk.rotation.x = Math.PI / 2;
      medallionGroup.add(disk);

      for (let p = 0; p < 8; p++) {
        const pAngle = (p / 8) * Math.PI * 2;
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.024, 6, 6).scale(0.5, 1.2, 0.3),
          this.materials.marigoldYellow
        );
        petal.position.set(Math.cos(pAngle) * 0.07, Math.sin(pAngle) * 0.07, 0.008);
        petal.rotation.z = pAngle;
        medallionGroup.add(petal);
      }
      this.cowGroup.add(medallionGroup);
    });

    // Golden fringe tassel beads hanging along both flank hems of the Jhool
    [-0.34, 0.34].forEach((fz) => {
      for (let k = 0; k < 7; k++) {
        const kx = 0.12 - k * 0.10;
        const tassel = new THREE.Mesh(
          new THREE.SphereGeometry(0.016, 6, 6).scale(0.8, 1.4, 0.8),
          this.materials.zariGold
        );
        tassel.position.set(kx, 0.82, fz);
        this.cowGroup.add(tassel);
      }
    });

    // Volumetric Cascading Dewlap (Galakambal) - characteristic soft flowing skin folds of Gir cattle
    const dewlapFolds = [
      { x: 0.52, y: 0.98, scale: [1.38, 0.85, 0.22], rotZ: -0.42 },
      { x: 0.38, y: 0.78, scale: [1.32, 0.92, 0.25], rotZ: -0.32 },
      { x: 0.24, y: 0.60, scale: [1.22, 0.88, 0.26], rotZ: -0.18 },
      { x: 0.10, y: 0.48, scale: [1.12, 0.78, 0.24], rotZ: -0.06 },
    ];
    dewlapFolds.forEach((df) => {
      const fold = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 20, 16).scale(df.scale[0], df.scale[1], df.scale[2]),
        this.materials.cowWhite
      );
      fold.position.set(df.x, df.y, 0);
      fold.rotation.z = df.rotZ;
      fold.castShadow = true;
      this.cowGroup.add(fold);
    });

    // 4 Articulated Cloven Legs with Anatomical Knees, Backward Hocks, Pasterns, and Split Claws
    const hornHoofMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.18,
    });

    const createClovenLeg = (isFront: boolean, isLeft: boolean, scale = 1.0) => {
      const leg = new THREE.Group();
      const zSign = isLeft ? 1 : -1;
      const xPos = isFront ? 0.38 * scale : -0.52 * scale;
      const zPos = (isFront ? 0.28 : 0.26) * scale * zSign;

      if (isFront) {
        // Front leg: Upper arm, carpal knee, cannon, fetlock, angled pastern, cloven hoof
        const upper = new THREE.Mesh(
          new THREE.CylinderGeometry(0.10 * scale, 0.08 * scale, 0.26 * scale, 16),
          this.materials.cowWhite
        );
        upper.position.set(0, 0.59 * scale, 0);
        upper.castShadow = true;
        leg.add(upper);

        const knee = new THREE.Mesh(
          new THREE.SphereGeometry(0.082 * scale, 14, 14),
          this.materials.cowWhite
        );
        knee.position.set(0, 0.46 * scale, 0);
        knee.castShadow = true;
        leg.add(knee);

        const cannon = new THREE.Mesh(
          new THREE.CylinderGeometry(0.068 * scale, 0.056 * scale, 0.28 * scale, 14),
          this.materials.cowWhite
        );
        cannon.position.set(0, 0.31 * scale, 0);
        cannon.castShadow = true;
        leg.add(cannon);

        const fetlock = new THREE.Mesh(
          new THREE.SphereGeometry(0.062 * scale, 12, 12),
          this.materials.cowWhite
        );
        fetlock.position.set(0, 0.16 * scale, 0);
        fetlock.castShadow = true;
        leg.add(fetlock);

        const pastern = new THREE.Mesh(
          new THREE.CylinderGeometry(0.048 * scale, 0.056 * scale, 0.10 * scale, 12),
          this.materials.cowWhite
        );
        pastern.position.set(0.015 * scale, 0.09 * scale, 0);
        pastern.rotation.z = -0.22;
        pastern.castShadow = true;
        leg.add(pastern);

        // Cloven Hoof with medial and lateral dark claws
        [-0.022, 0.022].forEach((cz) => {
          const claw = new THREE.Mesh(
            new THREE.BoxGeometry(0.055 * scale, 0.045 * scale, 0.038 * scale),
            hornHoofMat
          );
          claw.position.set(0.032 * scale, 0.022 * scale, cz * scale);
          claw.castShadow = true;
          leg.add(claw);
        });
      } else {
        // Hind leg: Upper thigh, lower thigh (gaskin), backward-pointing ungulate Hock joint, vertical cannon, fetlock, pastern, cloven hoof
        const upperThigh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13 * scale, 0.095 * scale, 0.24 * scale, 16),
          this.materials.cowWhite
        );
        upperThigh.position.set(0.04 * scale, 0.72 * scale, 0);
        upperThigh.rotation.z = -0.32;
        upperThigh.castShadow = true;
        leg.add(upperThigh);

        const gaskin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.095 * scale, 0.075 * scale, 0.22 * scale, 16),
          this.materials.cowWhite
        );
        gaskin.position.set(-0.02 * scale, 0.54 * scale, 0);
        gaskin.rotation.z = 0.35;
        gaskin.castShadow = true;
        leg.add(gaskin);

        // Backward Hock Joint (Calcaneus)
        const hock = new THREE.Mesh(
          new THREE.SphereGeometry(0.080 * scale, 14, 14),
          this.materials.cowWhite
        );
        hock.position.set(-0.06 * scale, 0.46 * scale, 0);
        hock.castShadow = true;
        leg.add(hock);

        const cannon = new THREE.Mesh(
          new THREE.CylinderGeometry(0.065 * scale, 0.054 * scale, 0.28 * scale, 14),
          this.materials.cowWhite
        );
        cannon.position.set(-0.06 * scale, 0.31 * scale, 0);
        cannon.castShadow = true;
        leg.add(cannon);

        const fetlock = new THREE.Mesh(
          new THREE.SphereGeometry(0.060 * scale, 12, 12),
          this.materials.cowWhite
        );
        fetlock.position.set(-0.06 * scale, 0.16 * scale, 0);
        fetlock.castShadow = true;
        leg.add(fetlock);

        const pastern = new THREE.Mesh(
          new THREE.CylinderGeometry(0.048 * scale, 0.056 * scale, 0.10 * scale, 12),
          this.materials.cowWhite
        );
        pastern.position.set(-0.045 * scale, 0.09 * scale, 0);
        pastern.rotation.z = -0.22;
        pastern.castShadow = true;
        leg.add(pastern);

        [-0.022, 0.022].forEach((cz) => {
          const claw = new THREE.Mesh(
            new THREE.BoxGeometry(0.055 * scale, 0.045 * scale, 0.038 * scale),
            hornHoofMat
          );
          claw.position.set(-0.028 * scale, 0.022 * scale, cz * scale);
          claw.castShadow = true;
          leg.add(claw);
        });
      }

      leg.position.set(xPos, 0, zPos);
      return leg;
    };

    this.cowGroup.add(createClovenLeg(true, true, 1.0));
    this.cowGroup.add(createClovenLeg(true, false, 1.0));
    this.cowGroup.add(createClovenLeg(false, true, 1.0));
    this.cowGroup.add(createClovenLeg(false, false, 1.0));

    // Slender Bovine Tail with Silky Long Hair Switch at the tip
    this.cowTail = new THREE.Group();
    this.cowTail.name = 'CowTail';
    this.cowTail.position.set(-0.78, 1.18, 0);

    const tailStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.016, 0.85, 12).rotateX(0.16),
      this.materials.cowWhite
    );
    tailStem.position.set(-0.06, -0.38, 0);
    tailStem.castShadow = true;
    this.cowTail.add(tailStem);

    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.085, 0.40, 16).scale(0.75, 1.0, 1.35),
      this.materials.cowWhite
    );
    tuft.position.set(-0.10, -0.86, 0);
    tuft.rotation.x = Math.PI;
    tuft.castShadow = true;
    this.cowTail.add(tuft);
    this.cowGroup.add(this.cowTail);

    // Anatomical Gir Bovine Head & Neck Group (interactive pivot & idle gaze)
    this.cowHead = new THREE.Group();
    this.cowHead.name = 'CowHeadGroup';
    this.cowHead.position.set(0.68, 1.18, 0);

    // Muscular Arched Neck seamlessly bridging withers and cranium
    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.38, 0.52, 20).rotateZ(-Math.PI / 4.2),
      this.materials.cowWhite
    );
    neckMesh.position.set(0.16, 0.12, 0);
    neckMesh.castShadow = true;
    this.cowHead.add(neckMesh);

    // Cranium / Skull Base
    const skullMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 22, 22).scale(1.15, 0.95, 0.85),
      this.materials.cowWhite
    );
    skullMesh.position.set(0.38, 0.28, 0);
    skullMesh.castShadow = true;
    this.cowHead.add(skullMesh);

    // Signature Gir Convex Domed Forehead (High rounded brow of Gir cattle)
    const girForehead = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 20, 20).scale(1.25, 1.10, 0.80),
      this.materials.cowWhite
    );
    girForehead.position.set(0.48, 0.42, 0);
    girForehead.castShadow = true;
    this.cowHead.add(girForehead);

    // Supraorbital Brow Ridges
    [-0.20, 0.20].forEach((bz) => {
      const brow = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12).scale(1.35, 0.42, 0.6),
        this.materials.cowWhite
      );
      brow.position.set(0.50, 0.40, bz);
      brow.rotation.y = bz > 0 ? 0.2 : -0.2;
      this.cowHead.add(brow);
    });

    // Nasal Bridge
    const nasalMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.22, 0.32, 16).rotateZ(-0.55),
      this.materials.cowWhite
    );
    nasalMesh.position.set(0.62, 0.30, 0);
    nasalMesh.castShadow = true;
    this.cowHead.add(nasalMesh);

    // Soft Velvety Pinkish-Peach Muzzle with Sculpted Nostrils & Mouth
    const snout = new THREE.Mesh(
      new THREE.SphereGeometry(0.20, 20, 20).scale(1.20, 0.85, 0.92),
      this.materials.cowMuzzle
    );
    snout.position.set(0.78, 0.16, 0);
    snout.castShadow = true;
    this.cowHead.add(snout);

    // Sculpted Left & Right Nostril Cavities with flared outer wings
    const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x3d1a1a });
    [-0.085, 0.085].forEach((nz) => {
      const nostril = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 10, 10).scale(0.6, 1.0, 1.4),
        nostrilMat
      );
      nostril.position.set(0.88, 0.18, nz);
      this.cowHead.add(nostril);
    });

    // Gentle lower jaw and chin
    const lowerJaw = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 14, 14).scale(1.3, 0.6, 0.9),
      this.materials.cowMuzzle
    );
    lowerJaw.position.set(0.70, 0.08, 0);
    this.cowHead.add(lowerJaw);

    // Majestic Swept-Back Gir Lyre Horns with Polished Brass Finials (Singhoti)
    const createLyreHorn = (isLeft: boolean) => {
      const hornGroup = new THREE.Group();
      const zSign = isLeft ? 1 : -1;

      const hornCurvePoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.08, 0.15, 0.12 * zSign),
        new THREE.Vector3(-0.14, 0.32, 0.20 * zSign),
        new THREE.Vector3(-0.02, 0.48, 0.14 * zSign),
        new THREE.Vector3(0.10, 0.58, 0.03 * zSign),
      ];
      const hornCurve = new THREE.CatmullRomCurve3(hornCurvePoints);
      const hornGeo = new THREE.TubeGeometry(hornCurve, 32, 0.048, 14, false);
      const hornMesh = new THREE.Mesh(hornGeo, this.materials.cowHorns);
      hornMesh.castShadow = true;
      hornGroup.add(hornMesh);

      for (let r = 0; r < 3; r++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.050 + r * 0.002, 0.008, 6, 16),
          this.materials.cowHorns
        );
        ring.position.set(-0.02 * r, 0.06 + r * 0.06, 0.04 * r * zSign);
        hornGroup.add(ring);
      }

      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), this.materials.brassGold);
      finial.position.copy(hornCurvePoints[4]);
      hornGroup.add(finial);

      hornGroup.position.set(0.32, 0.48, 0.16 * zSign);
      return hornGroup;
    };

    this.cowHead.add(createLyreHorn(true));
    this.cowHead.add(createLyreHorn(false));

    // Soulful Peaceful Bovine Eyes (Kamal-Nayan) with Eyelids & Corneal Highlights
    const createBovineEye = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      const zSign = isLeft ? 1 : -1;

      const lidGeo = new THREE.TorusGeometry(0.072, 0.015, 8, 20, Math.PI);
      const lid = new THREE.Mesh(lidGeo, this.materials.cowWhite);
      lid.position.set(0.02, 0.03, 0);
      lid.rotation.z = -0.15;
      eyeGroup.add(lid);

      const iris = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 16, 16).scale(0.85, 1.0, 0.75),
        new THREE.MeshBasicMaterial({ color: 0x09090b })
      );
      eyeGroup.add(iris);

      const glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      glint.position.set(0.040, 0.022, 0.026 * zSign);
      eyeGroup.add(glint);

      eyeGroup.position.set(0.52, 0.32, 0.24 * zSign);
      return eyeGroup;
    };

    this.cowHead.add(createBovineEye(true));
    this.cowHead.add(createBovineEye(false));

    // Iconic Pendulous Leaf-Shaped Gir Ears with Inner Pink Velvety Lining
    const createBovineEar = (isLeft: boolean) => {
      const ear = new THREE.Group();
      const zSign = isLeft ? 1 : -1;

      const earShellGeo = new THREE.ConeGeometry(0.095, 0.46, 14);
      earShellGeo.scale(1.0, 1.0, 0.35);
      const earShell = new THREE.Mesh(earShellGeo, this.materials.cowWhite);
      earShell.castShadow = true;
      ear.add(earShell);

      const innerLining = new THREE.Mesh(
        new THREE.ConeGeometry(0.072, 0.38, 10).scale(1.0, 1.0, 0.20),
        this.materials.cowMuzzle
      );
      innerLining.position.set(0, -0.02, 0.012 * zSign);
      ear.add(innerLining);

      ear.position.set(0.22, 0.34, 0.28 * zSign);
      ear.rotation.set(-1.25 * zSign, 0.25, -0.35);
      return ear;
    };

    const leftEar = createBovineEar(true);
    this.cowHead.add(leftEar);
    this.cowEars.push(leftEar);

    const rightEar = createBovineEar(false);
    this.cowHead.add(rightEar);
    this.cowEars.push(rightEar);

    // Sacred Vaishnava Chandan Tilak (Urdhva Pundra) on forehead with red Kumkum bindi
    const tilakChandan = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.024, 0.12, 8, 10),
      this.materials.marigoldYellow
    );
    tilakChandan.position.set(0.66, 0.45, 0);
    tilakChandan.rotation.z = -0.28;
    this.cowHead.add(tilakChandan);

    const tilakSindoor = new THREE.Mesh(
      new THREE.SphereGeometry(0.020, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    tilakSindoor.position.set(0.67, 0.45, 0);
    this.cowHead.add(tilakSindoor);

    // Festive Marigold Flower Garland (Genda Haar) draped over neck
    const garlandRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.44, 0.052, 10, 36),
      this.materials.marigoldOrange
    );
    garlandRing.rotation.y = Math.PI / 2;
    garlandRing.rotation.z = 0.25;
    garlandRing.position.set(0.12, 0.06, 0);
    this.cowHead.add(garlandRing);

    // Auspicious Red & Gold Ceremonial Collar with Master Brass Temple Bell (Ghanti)
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.040, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.55 })
    );
    collar.rotation.y = Math.PI / 2;
    collar.position.set(0.18, -0.02, 0);
    this.cowHead.add(collar);

    const bellGroup = new THREE.Group();
    bellGroup.position.set(0.18, -0.38, 0);

    const bellDome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.15, 0.22, 16),
      this.materials.brassGold
    );
    bellGroup.add(bellDome);

    const bellLip = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.024, 8, 24),
      this.materials.brassGold
    );
    bellLip.rotation.x = Math.PI / 2;
    bellLip.position.y = -0.11;
    bellGroup.add(bellLip);

    const clapper = new THREE.Mesh(
      new THREE.SphereGeometry(0.040, 10, 10),
      this.materials.brassGold
    );
    clapper.position.y = -0.13;
    bellGroup.add(clapper);

    this.cowHead.add(bellGroup);
    this.cowGroup.add(this.cowHead);
    this.group.add(this.cowGroup);

    // 2. Cute Baby Calf (Bachhda) resting affectionately beside mother
    this.calfGroup = new THREE.Group();
    this.calfGroup.name = 'CuteCalf';
    this.calfGroup.position.set(4.6, 0, 2.3);
    this.calfGroup.rotation.y = -1.8;

    // Chubby baby body
    const calfBodyGeo = createAnatomicalZebuBody(0.54);
    const calfBody = new THREE.Mesh(calfBodyGeo, this.materials.cowWhite);
    calfBody.castShadow = true;
    calfBody.receiveShadow = true;
    calfBody.name = 'CuteCalfBody';
    this.calfGroup.add(calfBody);

    // Baby coat spot
    const calfSpot = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12).scale(1.25, 0.38, 0.75),
      this.materials.terracotta
    );
    calfSpot.position.set(0.08, 0.65, 0.18);
    this.calfGroup.add(calfSpot);

    // Dainty baby legs with backward hocks and tiny cloven claws
    this.calfGroup.add(createClovenLeg(true, true, 0.54));
    this.calfGroup.add(createClovenLeg(true, false, 0.54));
    this.calfGroup.add(createClovenLeg(false, true, 0.54));
    this.calfGroup.add(createClovenLeg(false, false, 0.54));

    // Baby tail
    const calfTail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.010, 0.38, 8).rotateX(0.35),
      this.materials.cowWhite
    );
    calfTail.position.set(-0.44, 0.60, 0);
    calfTail.castShadow = true;
    this.calfGroup.add(calfTail);

    // Baby Calf Head Group (animated idle head nod)
    this.calfHead = new THREE.Group();
    this.calfHead.position.set(0.40, 0.66, 0);

    // Sweet baby skull
    const babySkull = new THREE.Mesh(
      new THREE.SphereGeometry(0.20, 18, 18).scale(1.15, 0.98, 0.86),
      this.materials.cowWhite
    );
    babySkull.castShadow = true;
    this.calfHead.add(babySkull);

    // Soft pink baby muzzle
    const babyMuzzle = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 14, 14).scale(1.20, 0.78, 0.88),
      this.materials.cowMuzzle
    );
    babyMuzzle.position.set(0.20, -0.06, 0);
    babyMuzzle.castShadow = true;
    this.calfHead.add(babyMuzzle);

    // Velvet horn nubs
    [-0.09, 0.09].forEach((nz) => {
      const nub = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 8, 8),
        this.materials.cowHorns
      );
      nub.position.set(-0.02, 0.18, nz);
      this.calfHead.add(nub);
    });

    // Sweet big doe-eyes
    const babyEyeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    [-0.14, 0.14].forEach((ez) => {
      const bEye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), babyEyeMat);
      bEye.position.set(0.10, 0.07, ez);
      this.calfHead.add(bEye);

      const bGlint = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      bGlint.position.set(0.12, 0.09, ez + (ez > 0 ? 0.01 : -0.01));
      this.calfHead.add(bGlint);
    });

    // Floppy baby ears
    [-0.18, 0.18].forEach((earZ) => {
      const bEar = new THREE.Mesh(
        new THREE.ConeGeometry(0.062, 0.24, 10).scale(1, 1, 0.38),
        this.materials.cowWhite
      );
      bEar.position.set(-0.07, 0.12, earZ);
      bEar.rotation.set(earZ > 0 ? -1.1 : 1.1, earZ > 0 ? 0.2 : -0.2, -0.2);
      this.calfHead.add(bEar);
    });

    // Festive red silk ribbon collar with silver bell
    const babyCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.022, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
    );
    babyCollar.rotation.y = Math.PI / 2;
    babyCollar.position.set(-0.08, -0.08, 0);
    this.calfHead.add(babyCollar);

    const silverBell = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 10, 10),
      this.materials.silver
    );
    silverBell.position.set(-0.08, -0.22, 0);
    this.calfHead.add(silverBell);

    this.calfGroup.add(this.calfHead);
    this.group.add(this.calfGroup);
  }

  private createKrishnaFluteAltar() {
    this.fluteGroup = new THREE.Group();
    this.fluteGroup.name = 'KrishnaFluteAltar';
    this.fluteGroup.position.set(1.45, 0, 0.65);
    this.fluteGroup.rotation.y = -0.32;

    // 1. Carved Makrana Marble Stepped Octagonal Plinth
    const tier1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.74, 0.12, 8),
      this.materials.makranaMarble
    );
    tier1.position.y = 0.06;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    this.fluteGroup.add(tier1);

    const goldBand1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.70, 0.016, 8, 8),
      this.materials.zariGold
    );
    goldBand1.rotation.x = Math.PI / 2;
    goldBand1.position.y = 0.12;
    this.fluteGroup.add(goldBand1);

    const tier2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.56, 0.10, 8),
      this.materials.makranaMarble
    );
    tier2.position.y = 0.17;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    this.fluteGroup.add(tier2);

    // 16-petal golden lotus collar (Padma-pitha) around tier 2
    for (let p = 0; p < 16; p++) {
      const angle = (p / 16) * Math.PI * 2;
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8).scale(0.5, 0.18, 1.4),
        this.materials.zariGold
      );
      petal.rotation.y = angle;
      petal.position.set(Math.cos(angle) * 0.48, 0.22, Math.sin(angle) * 0.48);
      petal.castShadow = true;
      this.fluteGroup.add(petal);
    }

    // 2. Royal Crimson Velvet Cushion (Singhasan)
    const cushion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.40, 0.09, 24),
      this.materials.crimsonVelvet
    );
    cushion.position.y = 0.27;
    cushion.castShadow = true;
    this.fluteGroup.add(cushion);

    const cushionPiping = new THREE.Mesh(
      new THREE.TorusGeometry(0.39, 0.016, 8, 24),
      this.materials.zariGold
    );
    cushionPiping.rotation.x = Math.PI / 2;
    cushionPiping.position.y = 0.28;
    this.fluteGroup.add(cushionPiping);

    // 3. Consecrated Standing Golden Lotus Socket (Bansuri Asana)
    const socketGroup = new THREE.Group();
    socketGroup.position.set(0, 0.31, 0);

    // Golden chalice base
    const chaliceBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.10, 0.15, 0.08, 16),
      this.materials.brassGold
    );
    chaliceBase.position.y = 0.04;
    chaliceBase.castShadow = true;
    socketGroup.add(chaliceBase);

    const chaliceRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.016, 8, 20),
      this.materials.zariGold
    );
    chaliceRim.rotation.x = Math.PI / 2;
    chaliceRim.position.y = 0.08;
    socketGroup.add(chaliceRim);

    // 8 upward-curving golden lotus petals cupping the base of the standing flute
    for (let p = 0; p < 8; p++) {
      const pAngle = (p / 8) * Math.PI * 2;
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 8, 8).scale(0.55, 1.35, 0.35),
        this.materials.zariGold
      );
      petal.rotation.y = pAngle;
      petal.rotation.x = 0.28;
      petal.position.set(Math.cos(pAngle) * 0.095, 0.07, Math.sin(pAngle) * 0.095);
      petal.castShadow = true;
      socketGroup.add(petal);
    }

    // Two flanking golden ornamental brackets
    [-0.18, 0.18].forEach((bx, bidx) => {
      const bracket = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI * 0.8),
        this.materials.brassGold
      );
      bracket.position.set(bx, 0.08, 0);
      bracket.rotation.z = bidx === 0 ? 0.3 : -0.3;
      bracket.rotation.y = Math.PI / 2;
      socketGroup.add(bracket);
    });

    this.fluteGroup.add(socketGroup);

    // 4. Sacred Flute Container & Loader (Standing Vertically)
    const fluteContainer = new THREE.Group();
    fluteContainer.name = 'KrishnaFlute';
    fluteContainer.position.set(0, 0.38, 0);
    this.fluteGroup.add(fluteContainer);

    // Procedural majestic golden bansuri placeholder (standing upright)
    const proceduralBansuri = new THREE.Group();
    proceduralBansuri.name = 'ProceduralFlute';

    const fluteStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.018, 1.28, 16),
      this.materials.brassGold
    );
    fluteStem.position.y = 0.64;
    fluteStem.castShadow = true;
    proceduralBansuri.add(fluteStem);

    // Finger holes along vertical shaft facing front
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
    for (let h = 0; h < 6; h++) {
      const hole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.007, 0.045, 8).rotateX(Math.PI / 2),
        holeMat
      );
      hole.position.set(0, 0.35 + h * 0.11, 0.018);
      proceduralBansuri.add(hole);
    }

    // Peacock feather plume crowning the top of the vertical flute
    const feather = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8).scale(0.65, 1.5, 0.1),
      this.materials.peacockTeal
    );
    feather.position.set(0.04, 1.34, 0);
    feather.rotation.z = -0.22;
    proceduralBansuri.add(feather);

    // Crimson and golden tassels hanging down from upper crest
    for (let t = 0; t < 2; t++) {
      const tassel = new THREE.Mesh(
        new THREE.ConeGeometry(0.032, 0.22, 8),
        t === 0 ? this.materials.crimsonVelvet : this.materials.zariGold
      );
      tassel.position.set(0.08 + t * 0.04, 1.10 - t * 0.05, 0.02);
      proceduralBansuri.add(tassel);
    }

    proceduralBansuri.rotation.set(0.03, 0.22, 0.0);
    fluteContainer.add(proceduralBansuri);

    // Asynchronous GLB Loader for public/krisha-flute.glb (standing upright)
    const loader = new GLTFLoader();
    const applyFluteGLB = (model: THREE.Group) => {
      model.name = 'KrishnaFluteModel';
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Desired vertical height ~1.38 units
      const targetHeight = 1.38;
      const scaleFactor = targetHeight / (size.y || 1.0);

      const innerGroup = new THREE.Group();
      // Center model on X and Z, align bottom of model with y = 0 of container
      model.position.set(-center.x, -box.min.y, -center.z);
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.name = 'KrishnaFlute';
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              m.side = THREE.DoubleSide;
              if (m instanceof THREE.MeshStandardMaterial) {
                m.roughness = Math.max(0.22, m.roughness);
                m.envMapIntensity = 1.35;
              }
            });
          }
        }
      });
      innerGroup.add(model);
      innerGroup.scale.setScalar(scaleFactor);

      // Standing vertically upright with gentle regal front-facing orientation
      innerGroup.rotation.set(0.03, 0.25, 0.0);

      fluteContainer.add(innerGroup);
      this.fluteModel = innerGroup;
      proceduralBansuri.visible = false;
    };

    loader.load(
      '/krisha-flute.glb',
      (gltf) => applyFluteGLB(gltf.scene),
      undefined,
      (err) => {
        console.warn('Retrying krisha-flute.glb from local path:', err);
        loader.load(
          'krisha-flute.glb',
          (gltf2) => applyFluteGLB(gltf2.scene),
          undefined,
          (err2) => console.error('Could not load krisha-flute.glb:', err2)
        );
      }
    );

    // 5. Flanking Brass Diyas
    [-0.46, 0.46].forEach((dx, didx) => {
      const diyaGroup = new THREE.Group();
      diyaGroup.name = `Diya_FluteAltar_${didx}`;
      diyaGroup.position.set(dx, 0.12, 0.18);

      const clayBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.05, 0.04, 16),
        this.materials.brassGold
      );
      clayBase.castShadow = true;
      diyaGroup.add(clayBase);

      const flameGeo = new THREE.ConeGeometry(0.022, 0.07, 8);
      const flame = new THREE.Mesh(flameGeo, this.materials.diyaFlame);
      flame.position.y = 0.05;
      diyaGroup.add(flame);
      this.diyaFlames.push(flame);

      const dLight = new THREE.PointLight(0xffa500, 0.9, 2.5);
      dLight.position.y = 0.08;
      diyaGroup.add(dLight);
      this.diyaLights.push(dLight);

      this.diyas.push(diyaGroup);
      this.fluteGroup.add(diyaGroup);
    });

    // 6. Offerings: Scattered Fresh Marigold Petals & Tulsi Leaves
    for (let f = 0; f < 18; f++) {
      const fAngle = (f / 18) * Math.PI * 2;
      const fRad = 0.35 + (f % 5) * 0.06;
      const isMarigold = f % 3 !== 0;
      const flowerGeo = isMarigold
        ? new THREE.SphereGeometry(0.028, 6, 6)
        : new THREE.BoxGeometry(0.045, 0.008, 0.03);
      const flowerMat = isMarigold
        ? (f % 2 === 0 ? this.materials.marigoldOrange : this.materials.marigoldYellow)
        : this.materials.foliage;
      const petal = new THREE.Mesh(flowerGeo, flowerMat);
      petal.position.set(Math.cos(fAngle) * fRad, 0.13, Math.sin(fAngle) * fRad);
      petal.rotation.set(0.1, f, 0.1);
      this.fluteGroup.add(petal);
    }

    // 7. Ethereal Golden Aura & Halo Ring encircling the vertical flute
    this.fluteAltarLight = new THREE.PointLight(0xfef08a, 1.6, 4.5);
    this.fluteAltarLight.position.set(0, 1.25, 0.25);
    this.fluteGroup.add(this.fluteAltarLight);

    this.fluteAuraRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.010, 8, 36),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.65 })
    );
    this.fluteAuraRing.position.set(0, 1.15, 0);
    this.fluteAuraRing.rotation.x = Math.PI / 2;
    this.fluteGroup.add(this.fluteAuraRing);

    this.group.add(this.fluteGroup);
  }

  private createJhula() {
    // Janmashtami Floral Swing (Jhula for baby Krishna / celebration)
    const jhulaGroup = new THREE.Group();
    jhulaGroup.name = 'JanmashtamiJhula';
    jhulaGroup.position.set(0, 0, -4.8);

    // Two ornate wooden pillars
    const pillarGeo = new THREE.CylinderGeometry(0.14, 0.16, 4.2, 12);
    const pillarMat = this.materials.wood;

    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-1.7, 2.1, 0);
    leftPillar.castShadow = true;
    jhulaGroup.add(leftPillar);

    const rightPillar = leftPillar.clone();
    rightPillar.position.set(1.7, 2.1, 0);
    jhulaGroup.add(rightPillar);

    // Cross beam on top
    const crossBeamGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 12);
    crossBeamGeo.rotateZ(Math.PI / 2);
    const crossBeam = new THREE.Mesh(crossBeamGeo, pillarMat);
    crossBeam.position.set(0, 4.2, 0);
    crossBeam.castShadow = true;
    jhulaGroup.add(crossBeam);

    // Top ornamental arch canopy
    const archGeo = new THREE.TorusGeometry(1.6, 0.08, 8, 24, Math.PI);
    const arch = new THREE.Mesh(archGeo, this.materials.gold);
    arch.position.set(0, 4.2, 0);
    jhulaGroup.add(arch);

    // Marigold garlands draped over pillars and arch
    for (let g = 0; g < 18; g++) {
      const flowerGeo = new THREE.SphereGeometry(0.09, 6, 6);
      const mat = g % 2 === 0 ? this.materials.marigoldOrange : this.materials.marigoldYellow;
      const flowerL = new THREE.Mesh(flowerGeo, mat);
      flowerL.position.set(-1.7 + Math.sin(g) * 0.08, 0.4 + g * 0.2, Math.cos(g) * 0.08);
      jhulaGroup.add(flowerL);

      const flowerR = flowerL.clone();
      flowerR.position.x = 1.7 + Math.sin(g) * 0.08;
      jhulaGroup.add(flowerR);
    }

    // Swinging Seat Group (Pivots from top crossbeam at y = 4.2)
    this.jhulaSeat = new THREE.Group();
    this.jhulaSeat.position.set(0, 4.2, 0);

    // Two golden chains / ropes
    const chainMat = this.materials.gold;
    const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.8, 6);

    const leftChain = new THREE.Mesh(chainGeo, chainMat);
    leftChain.position.set(-1.1, -1.4, 0);
    this.jhulaSeat.add(leftChain);

    const rightChain = leftChain.clone();
    rightChain.position.set(1.1, -1.4, 0);
    this.jhulaSeat.add(rightChain);

    // Wooden floral seat
    const seatPlatform = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.9), pillarMat);
    seatPlatform.position.set(0, -2.8, 0);
    seatPlatform.castShadow = true;
    this.jhulaSeat.add(seatPlatform);

    // Royal cushion on swing
    const cushionGeo = new THREE.BoxGeometry(2.2, 0.14, 0.8);
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.5 });
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.position.set(0, -2.7, 0);
    this.jhulaSeat.add(cushion);

    // Peacock feather ornament on Jhula backrest
    const backFeather = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8).scale(0.8, 1.4, 0.1), this.materials.peacockTeal);
    backFeather.position.set(0, -2.3, -0.4);
    this.jhulaSeat.add(backFeather);

    // Cute Baby Krishna Group on Jhula cushion
    this.cuteKrishnaGroup = new THREE.Group();
    this.cuteKrishnaGroup.name = 'CuteKrishnaJhula';
    // Position directly on the surface of the royal velvet cushion (cushion top at y = -2.63)
    this.cuteKrishnaGroup.position.set(0, -2.63, 0);

    // Immediate charming procedural Bal Krishna representation while 3D GLB loads
    this.createProceduralBalKrishna();
    this.cuteKrishnaGroup.add(this.cuteKrishnaProcedural);

    // Asynchronously load the 3D cute-krishna.glb model
    this.loadCuteKrishnaGlb();

    this.jhulaSeat.add(this.cuteKrishnaGroup);

    // Two warm golden brass hanging lamps under Jhula arch canopy
    const lampGeo = new THREE.ConeGeometry(0.1, 0.16, 8);
    const lampMat = this.materials.gold;
    const lampL = new THREE.Mesh(lampGeo, lampMat);
    lampL.position.set(-0.9, -0.6, 0);
    this.jhulaSeat.add(lampL);

    const lampR = lampL.clone();
    lampR.position.x = 0.9;
    this.jhulaSeat.add(lampR);

    // Warm golden lantern light illuminating Cute Krishna on the swing
    const jhulaLight = new THREE.PointLight(0xfef08a, 1.3, 4.5);
    jhulaLight.position.set(0, -1.2, 0.4);
    this.jhulaSeat.add(jhulaLight);

    jhulaGroup.add(this.jhulaSeat);
    this.group.add(jhulaGroup);
  }

  private createProceduralBalKrishna() {
    this.cuteKrishnaProcedural = new THREE.Group();
    this.cuteKrishnaProcedural.name = 'ProceduralBalKrishna';

    const skinMat = new THREE.MeshStandardMaterial({
      color: COLORS.krishnaSkin,
      roughness: 0.35,
      metalness: 0.05,
    });
    const dhotiMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.45,
    });
    const goldMat = this.materials.gold;

    // 1. Cute chubby baby torso
    const torsoGeo = new THREE.SphereGeometry(0.24, 16, 16).scale(1.0, 1.15, 0.9);
    const torso = new THREE.Mesh(torsoGeo, skinMat);
    torso.position.set(0, 0.36, 0);
    torso.castShadow = true;
    this.cuteKrishnaProcedural.add(torso);

    // 2. Silk yellow dhoti wrapped around hips & folded baby legs
    const hipsGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.22, 16);
    const hips = new THREE.Mesh(hipsGeo, dhotiMat);
    hips.position.set(0, 0.18, 0);
    hips.castShadow = true;
    this.cuteKrishnaProcedural.add(hips);

    // Folded baby legs resting on cushion
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.36, 12), dhotiMat);
    legL.rotation.z = Math.PI / 2.3;
    legL.rotation.y = 0.2;
    legL.position.set(-0.22, 0.08, 0.1);
    this.cuteKrishnaProcedural.add(legL);

    const legR = legL.clone();
    legR.rotation.z = -Math.PI / 2.3;
    legR.rotation.y = -0.2;
    legR.position.x = 0.22;
    this.cuteKrishnaProcedural.add(legR);

    // Baby feet with golden anklets
    const footGeo = new THREE.SphereGeometry(0.065, 8, 8).scale(1.1, 0.7, 1.3);
    const footL = new THREE.Mesh(footGeo, skinMat);
    footL.position.set(-0.15, 0.05, 0.22);
    this.cuteKrishnaProcedural.add(footL);

    const footR = footL.clone();
    footR.position.x = 0.15;
    this.cuteKrishnaProcedural.add(footR);

    // Golden waist belt (kardhani)
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 8, 24), goldMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.set(0, 0.24, 0);
    this.cuteKrishnaProcedural.add(belt);

    // 3. Sweet round baby head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), skinMat);
    head.position.set(0, 0.68, 0.02);
    head.castShadow = true;
    this.cuteKrishnaProcedural.add(head);

    // Chubby rosy cheeks
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.35,
    });
    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), cheekMat);
    cheekL.position.set(-0.13, 0.64, 0.18);
    this.cuteKrishnaProcedural.add(cheekL);

    const cheekR = cheekL.clone();
    cheekR.position.x = 0.13;
    this.cuteKrishnaProcedural.add(cheekR);

    // Sacred Chandan Tilak on forehead
    const tilak = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.01), new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
    tilak.position.set(0, 0.75, 0.225);
    this.cuteKrishnaProcedural.add(tilak);

    // Curly dark hair topknot (juda)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), hairMat);
    hair.position.set(0, 0.88, -0.04);
    this.cuteKrishnaProcedural.add(hair);

    // Golden mukut & peacock feather on topknot
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.12, 8), goldMat);
    crown.position.set(0, 0.94, 0);
    this.cuteKrishnaProcedural.add(crown);

    const peacockFeather = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8).scale(0.6, 1.4, 0.1),
      this.materials.peacockTeal
    );
    peacockFeather.position.set(0.05, 1.05, -0.02);
    peacockFeather.rotation.z = -0.25;
    this.cuteKrishnaProcedural.add(peacockFeather);

    // 4. Baby arms holding miniature golden flute
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.24, 10), skinMat);
    armL.rotation.z = Math.PI / 4;
    armL.position.set(-0.25, 0.36, 0.08);
    this.cuteKrishnaProcedural.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.24, 10), skinMat);
    armR.rotation.z = -Math.PI / 4;
    armR.position.set(0.25, 0.36, 0.08);
    this.cuteKrishnaProcedural.add(armR);

    // Mini golden flute
    const miniFlute = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.38, 8), goldMat);
    miniFlute.rotation.z = Math.PI / 3;
    miniFlute.rotation.x = 0.2;
    miniFlute.position.set(0.16, 0.42, 0.2);
    this.cuteKrishnaProcedural.add(miniFlute);

    // 5. Exquisite Miniature Clay Butter Pot (Makhan Matki) resting next to Little Krishna on the swing
    const miniPotGroup = new THREE.Group();
    miniPotGroup.position.set(-0.45, 0.02, 0.08);

    const miniProfilePoints = [
      new THREE.Vector2(0.001, 0.0),
      new THREE.Vector2(0.06, 0.0),
      new THREE.Vector2(0.08, 0.02),
      new THREE.Vector2(0.12, 0.07),
      new THREE.Vector2(0.15, 0.14),
      new THREE.Vector2(0.13, 0.20),
      new THREE.Vector2(0.09, 0.24),
      new THREE.Vector2(0.11, 0.27),
      new THREE.Vector2(0.13, 0.29),
      new THREE.Vector2(0.09, 0.29),
      new THREE.Vector2(0.001, 0.25),
    ];
    const miniSpline = new THREE.SplineCurve(miniProfilePoints);
    const smoothMiniProfile = miniSpline.getPoints(64);
    const miniPotGeo = new THREE.LatheGeometry(smoothMiniProfile, 48);
    miniPotGeo.computeVertexNormals();
    const miniPotMesh = new THREE.Mesh(miniPotGeo, this.materials.terracotta);
    miniPotMesh.castShadow = true;
    miniPotGroup.add(miniPotMesh);

    // Auspicious yellow thread around mini pot neck
    const miniKalawa = new THREE.Mesh(
      new THREE.TorusGeometry(0.095, 0.008, 6, 24),
      this.materials.marigoldYellow
    );
    miniKalawa.rotation.x = Math.PI / 2;
    miniKalawa.position.y = 0.24;
    miniPotGroup.add(miniKalawa);

    // Overflowing sculpted whipped butter
    const miniButterGeo = createSculptedButterDome(0.10);
    const miniButterMound = new THREE.Mesh(miniButterGeo, this.materials.butter);
    miniButterMound.position.y = 0.26;
    miniButterMound.castShadow = true;
    miniPotGroup.add(miniButterMound);

    // Cute curved butter drip trickling down
    const miniDripSplinePts = [
      new THREE.Vector3(0.09, 0.28, 0.03),
      new THREE.Vector3(0.12, 0.22, 0.04),
      new THREE.Vector3(0.13, 0.16, 0.04),
      new THREE.Vector3(0.12, 0.10, 0.04),
    ];
    const miniDripCurve = new THREE.CatmullRomCurve3(miniDripSplinePts);
    const miniDripGeo = new THREE.TubeGeometry(miniDripCurve, 12, 0.012, 8, false);
    const miniDrip = new THREE.Mesh(miniDripGeo, this.materials.butter);
    miniPotGroup.add(miniDrip);

    const miniDripDrop = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 8, 8).scale(0.9, 1.2, 0.9),
      this.materials.butter
    );
    miniDripDrop.position.set(0.12, 0.09, 0.04);
    miniPotGroup.add(miniDripDrop);

    this.cuteKrishnaProcedural.add(miniPotGroup);

    // 6. Miniature resting Krishna Bansuri on the swing cushion
    const jhulaFluteLoader = new GLTFLoader();
    jhulaFluteLoader.load(
      '/krisha-flute.glb',
      (gltf) => {
        const flute = gltf.scene;
        flute.name = 'KrishnaFluteJhula';
        const box = new THREE.Box3().setFromObject(flute);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const scale = 0.42 / (Math.max(size.x, size.y, size.z) || 1.0);
        flute.position.set(-center.x, -center.y, -center.z);

        const wrap = new THREE.Group();
        wrap.name = 'KrishnaFluteJhulaWrap';
        wrap.add(flute);
        wrap.scale.setScalar(scale);
        wrap.rotation.set(0.2, 0.25, Math.PI / 2 - 0.15);
        wrap.position.set(0.48, 0.05, 0.08);
        this.cuteKrishnaProcedural.add(wrap);
      },
      undefined,
      () => {}
    );
  }

  private loadCuteKrishnaGlb() {
    const loader = new GLTFLoader();

    const applyModel = (root: THREE.Group) => {
      root.name = 'CuteKrishnaGLBModel';

      // Compute bounding box
      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Desired proportional height sitting comfortably on the Jhula swing cushion
      const targetHeight = 1.35;
      const scale = targetHeight / (size.y || 1);
      root.scale.set(scale, scale, scale);

      // Center model on cushion X and Z, align bottom of model with top of velvet cushion
      root.position.x = -center.x * scale;
      root.position.z = -center.z * scale;
      root.position.y = -box.min.y * scale;

      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              m.side = THREE.DoubleSide;
              if (m instanceof THREE.MeshStandardMaterial) {
                m.roughness = Math.max(0.35, m.roughness);
                m.envMapIntensity = 1.25;
              }
            });
          }
        }
      });

      this.cuteKrishnaMesh = root;
      this.cuteKrishnaGroup.add(root);
      this.isCuteKrishnaLoaded = true;

      // Hide procedural fallback now that high-detail 3D GLB is ready
      if (this.cuteKrishnaProcedural) {
        this.cuteKrishnaProcedural.visible = false;
      }
    };

    // Load from root/public path
    loader.load(
      '/cute-krishna.glb',
      (gltf) => {
        applyModel(gltf.scene);
      },
      undefined,
      (err) => {
        console.warn('Trying fallback path for cute-krishna.glb:', err);
        loader.load(
          'cute-krishna.glb',
          (gltf) => {
            applyModel(gltf.scene);
          },
          undefined,
          (err2) => {
            console.error('Error loading cute-krishna.glb from all paths:', err2);
          }
        );
      }
    );
  }

  private createYamunaRiver() {
    const riverGroup = new THREE.Group();
    riverGroup.name = 'YamunaRiverSystem';

    // 1. Traditional Sandstone Yamuna Ghat (Terraced steps along riverbank)
    const ghatMat = this.materials.sandstone;
    for (let step = 0; step < 3; step++) {
      const stepZ = -7.6 - step * 0.55;
      const stepY = 0.02 - step * 0.08;
      const stepGeo = new THREE.BoxGeometry(52, 0.14, 0.65);
      const stepMesh = new THREE.Mesh(stepGeo, ghatMat);
      stepMesh.position.set(0, stepY, stepZ);
      stepMesh.receiveShadow = true;
      riverGroup.add(stepMesh);
    }

    // Ghat Carved Pilasters & Stone Lantern Shrines (Deepa-stambha) along the embankment
    const pilasterPositions = [-20, -12, -4, 4, 12, 20];
    pilasterPositions.forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.95, 8), ghatMat);
      post.position.set(px, 0.35, -7.5);
      post.castShadow = true;
      riverGroup.add(post);

      // Brass mooring ring
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.018, 6, 16), this.materials.brassGold);
      ring.position.set(px, 0.22, -7.34);
      riverGroup.add(ring);

      // Stone deepa cup atop post
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.14, 8), this.materials.diyaClay);
      cup.position.set(px, 0.88, -7.5);
      riverGroup.add(cup);

      // Warm burning diya flame
      const diyaFlame = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.11, 8), this.materials.diyaFlame);
      diyaFlame.position.set(px, 0.98, -7.5);
      riverGroup.add(diyaFlame);

      const diyaGlow = new THREE.PointLight(0xff9922, 0.65, 4.2);
      diyaGlow.position.set(px, 1.05, -7.5);
      riverGroup.add(diyaGlow);
    });

    // Riverbank natural smooth stones & pebbles along the water's edge
    for (let s = 0; s < 32; s++) {
      const stoneGeo = new THREE.DodecahedronGeometry(0.14 + (s % 4) * 0.08, 1);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3e3228, roughness: 0.85 });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(-24 + s * 1.55 + (Math.sin(s) * 0.4), -0.06, -8.9 + Math.cos(s * 1.5) * 0.45);
      stone.scale.set(1.2, 0.5, 0.9);
      riverGroup.add(stone);
    }

    // 2. Riverbed beneath water
    const riverbedGeo = new THREE.PlaneGeometry(58, 22);
    riverbedGeo.rotateX(-Math.PI / 2);
    const riverbedMat = new THREE.MeshStandardMaterial({ color: 0x07152b, roughness: 0.96 });
    const riverbed = new THREE.Mesh(riverbedGeo, riverbedMat);
    riverbed.position.set(0, -0.45, -17.5);
    riverbed.receiveShadow = true;
    riverGroup.add(riverbed);

    // 3. Dynamic Flowing Yamuna Water Mesh with Custom Shader
    this.waterGeometry = new THREE.PlaneGeometry(58, 22, 120, 50);
    this.waterGeometry.rotateX(-Math.PI / 2);
    this.waterMaterial = createYamunaWaterMaterial(this.moonPos);
    this.waterMesh = new THREE.Mesh(this.waterGeometry, this.waterMaterial);
    this.waterMesh.position.set(0, 0.02, -17.5);
    this.waterMesh.receiveShadow = true;
    riverGroup.add(this.waterMesh);

    // Cache initial vertex positions for safety
    this.waterInitialPositions = new Float32Array(this.waterGeometry.attributes.position.array);

    // 4. Sacred Nelumbo Lotuses (Kamal) floating on Yamuna
    const lotusPositions: Array<[number, number]> = [
      [-7.5, -11.5],
      [-4.2, -10.2],
      [-1.8, -12.4],
      [1.5, -9.8],
      [4.8, -11.8],
      [8.2, -10.5],
      [-11.2, -13.5],
      [12.5, -13.0],
    ];

    lotusPositions.forEach(([lx, lz], idx) => {
      const lotus = this.createLotusBlossom();
      lotus.position.set(lx, 0.02, lz);
      this.lotusBlossoms.push(lotus);
      this.lotusData.push({
        group: lotus,
        baseX: lx,
        baseZ: lz,
        phase: idx * 0.85,
      });
      riverGroup.add(lotus);
    });

    // 5. Floating Sacred Leaf-Diyas (Pattal Diyas) with warm flickering lights drifting down the sacred Yamuna
    const diyaPositions: Array<[number, number, number]> = [
      [-5.5, -10.8, 0.42],
      [-2.8, -9.5, 0.38],
      [0.2, -11.2, 0.45],
      [3.2, -10.2, 0.40],
      [6.5, -12.0, 0.46],
      [-8.8, -12.5, 0.36],
    ];

    diyaPositions.forEach(([dx, dz, spd], dIdx) => {
      const floatingDiyaGroup = new THREE.Group();
      floatingDiyaGroup.position.set(dx, 0.02, dz);

      // Green river leaf boat (Pattal)
      const leafGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.025, 12);
      leafGeo.scale(1.2, 1.0, 0.85);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      floatingDiyaGroup.add(leaf);

      // Terracotta lamp cup
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.06, 0.07, 10), this.materials.diyaClay);
      cup.position.y = 0.04;
      floatingDiyaGroup.add(cup);

      // Marigold flower offerings surrounding the flame
      for (let m = 0; m < 5; m++) {
        const mAngle = (m / 5) * Math.PI * 2;
        const petalMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 6, 6),
          m % 2 === 0 ? this.materials.marigoldOrange : this.materials.marigoldYellow
        );
        petalMesh.position.set(Math.cos(mAngle) * 0.14, 0.04, Math.sin(mAngle) * 0.14);
        floatingDiyaGroup.add(petalMesh);
      }

      // Burning golden flame
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.12, 8), this.materials.diyaFlame);
      flame.position.set(0, 0.11, 0);
      floatingDiyaGroup.add(flame);

      // PointLight casting warm golden reflections on water surface
      const waterLight = new THREE.PointLight(0xffaa33, 0.75, 4.0);
      waterLight.position.set(0, 0.16, 0);
      floatingDiyaGroup.add(waterLight);

      riverGroup.add(floatingDiyaGroup);

      this.floatingDiyas.push({
        group: floatingDiyaGroup,
        light: waterLight,
        flame,
        baseX: dx,
        baseZ: dz,
        speed: spd,
        phase: dIdx * 1.1,
      });
    });

    this.group.add(riverGroup);
  }

  private createLotusBlossom(): THREE.Group {
    const lotus = new THREE.Group();

    // Large emerald green lily pad (Kamal-patra) with radial vein notch
    const padGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.02, 20);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.005;
    lotus.add(pad);

    // Realistic layered Nelumbo Lotus petals (outer whorl + inner cup)
    // Outer whorl of 10 curved petals
    for (let p = 0; p < 10; p++) {
      const angle = (p / 10) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(0.20, 8, 8).scale(0.55, 0.28, 1.25);
      const petal = new THREE.Mesh(petalGeo, this.materials.lotusPink);
      petal.position.set(Math.cos(angle) * 0.24, 0.07, Math.sin(angle) * 0.24);
      petal.rotation.y = -angle;
      petal.rotation.x = 0.32;
      lotus.add(petal);
    }

    // Inner whorl of 8 upright delicate white-pink petals
    const innerPetalMat = new THREE.MeshStandardMaterial({
      color: 0xfce7f3,
      roughness: 0.45,
    });
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2 + 0.3;
      const petalGeo = new THREE.SphereGeometry(0.15, 6, 6).scale(0.48, 0.32, 1.1);
      const petal = new THREE.Mesh(petalGeo, innerPetalMat);
      petal.position.set(Math.cos(angle) * 0.13, 0.11, Math.sin(angle) * 0.13);
      petal.rotation.y = -angle;
      petal.rotation.x = 0.52;
      lotus.add(petal);
    }

    // Golden pollen seed-pod center (Karnika)
    const center = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.07, 0.09, 10),
      this.materials.marigoldYellow
    );
    center.position.y = 0.10;
    lotus.add(center);

    // Glowing Diya flame resting at the heart of the lotus
    const miniDiya = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 8), this.materials.diyaFlame);
    miniDiya.position.set(0, 0.18, 0);
    lotus.add(miniDiya);

    return lotus;
  }

  private createRangoliAndTulsi() {
    // 1. Ornate Courtyard Rangoli beneath Krishna's feet
    const rangoliGeo = new THREE.RingGeometry(0.1, 1.8, 32);
    rangoliGeo.rotateX(-Math.PI / 2);

    // Create procedural canvas texture for traditional Indian Janmashtami rangoli
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const cx = 256;
      const cy = 256;
      ctx.clearRect(0, 0, 512, 512);

      // Radial concentric circles
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 240, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.stroke();

      // 8 Peacock-feather / lotus petals
      for (let i = 0; i < 8; i++) {
        const rad = (i / 8) * Math.PI * 2;
        const px = cx + Math.cos(rad) * 150;
        const py = cy + Math.sin(rad) * 150;

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(px, py, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center sacred paduka / lotus
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.fill();
    }

    const rangoliTex = new THREE.CanvasTexture(canvas);
    const rangoliMat = new THREE.MeshStandardMaterial({
      map: rangoliTex,
      transparent: true,
      opacity: 0.92,
      roughness: 0.7,
    });
    const rangoliMesh = new THREE.Mesh(rangoliGeo, rangoliMat);
    rangoliMesh.position.set(0, 0.05, 0);
    this.group.add(rangoliMesh);

    // 2. Tulsi Vrindavan Courtyard Planter
    const tulsiGroup = new THREE.Group();
    tulsiGroup.position.set(2.8, 0, -1.8);

    // Terracotta square pedestal with tiered base
    const baseGeo = new THREE.BoxGeometry(0.9, 0.7, 0.9);
    const tulsiBase = new THREE.Mesh(baseGeo, this.materials.mudWall);
    tulsiBase.position.y = 0.35;
    tulsiBase.castShadow = true;
    tulsiGroup.add(tulsiBase);

    // Niches for mini diya in Tulsi stand
    const nicheGeo = new THREE.BoxGeometry(0.2, 0.22, 0.15);
    const nicheMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    const niche = new THREE.Mesh(nicheGeo, nicheMat);
    niche.position.set(0, 0.4, 0.42);
    tulsiGroup.add(niche);

    // Lush holy basil leaves
    for (let l = 0; l < 14; l++) {
      const leafGeo = new THREE.SphereGeometry(0.14, 6, 6).scale(0.4, 0.8, 0.2);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set((Math.random() - 0.5) * 0.45, 0.85 + Math.random() * 0.4, (Math.random() - 0.5) * 0.45);
      leaf.rotation.set(Math.random() * 0.6, Math.random() * Math.PI, Math.random() * 0.6);
      tulsiGroup.add(leaf);
    }

    this.group.add(tulsiGroup);
  }

  private createTrees() {
    // Sacred Kadamba & Palm trees along village edge
    const treePositions = [
      [-6.5, 0, -7.5],
      [7.8, 0, -8.0],
      [-9.2, 0, -1.5],
      [9.5, 0, 3.5],
      [-8.0, 0, 7.0],
    ];

    treePositions.forEach(([tx, ty, tz]) => {
      const tree = this.createKadambaTree();
      tree.position.set(tx, ty, tz);
      this.group.add(tree);
    });
  }

  private createKadambaTree(): THREE.Group {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 4.5, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.wood);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    tree.add(trunk);

    // Soft spherical stylized foliage clumps (Vrindavan Kadamba style)
    const foliageMat = new THREE.MeshStandardMaterial({
      color: COLORS.treeGreen,
      roughness: 0.8,
    });
    const foliageOffsets = [
      [0, 4.4, 0, 1.6],
      [-0.8, 4.1, 0.6, 1.2],
      [0.9, 4.2, -0.5, 1.3],
      [0.4, 4.8, 0.4, 1.1],
    ];

    foliageOffsets.forEach(([fx, fy, fz, r]) => {
      const foliage = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 10), foliageMat);
      foliage.position.set(fx, fy, fz);
      foliage.castShadow = true;
      tree.add(foliage);
    });

    // Hanging yellow Kadamba floral pom-poms
    for (let k = 0; k < 5; k++) {
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), this.materials.marigoldYellow);
      flower.position.set((Math.random() - 0.5) * 2, 3.5 + Math.random() * 0.8, (Math.random() - 0.5) * 2);
      tree.add(flower);
    }

    return tree;
  }

  private createDiyas() {
    // Array of festive clay diyas placed throughout the village
    const diyaPositions = [
      [-1.4, 0.08, 0.8],
      [1.4, 0.08, 0.8],
      [-0.8, 0.08, 1.6],
      [0.8, 0.08, 1.6],
      [-2.8, 0.08, 0.2],
      [2.8, 0.08, 0.2],
      [-1.8, 0.08, -3.2],
      [1.8, 0.08, -3.2],
      [0, 0.08, -3.8],
    ];

    diyaPositions.forEach(([dx, dy, dz], idx) => {
      const diya = new THREE.Group();
      diya.name = `Diya_${idx}`;
      diya.position.set(dx, dy, dz);

      // Terracotta lamp base
      const bowlGeo = new THREE.CylinderGeometry(0.16, 0.08, 0.08, 12);
      const bowl = new THREE.Mesh(bowlGeo, this.materials.clayRoof);
      diya.add(bowl);

      // Auspicious glowing flame
      const flameGeo = new THREE.ConeGeometry(0.06, 0.16, 8);
      const flame = new THREE.Mesh(flameGeo, this.materials.diyaFlame);
      flame.position.y = 0.1;
      diya.add(flame);
      this.diyaFlames.push(flame);

      // Flame halo
      const glowGeo = new THREE.SphereGeometry(0.14, 8, 8);
      const glow = new THREE.Mesh(glowGeo, this.materials.diyaGlow);
      glow.position.y = 0.1;
      diya.add(glow);

      // Dynamic warm point light
      const light = new THREE.PointLight(0xffa500, 0.75, 4.2);
      light.position.set(0, 0.2, 0);
      diya.add(light);
      this.diyaLights.push(light);

      this.diyas.push(diya);
      this.group.add(diya);
    });
  }

  private createMoonAndHills() {
    this.moonGroup = new THREE.Group();
    this.moonGroup.position.copy(this.moonPos);

    // 1. Radiant Full Moon (Sharad Poornima / Janmashtami midnight moon)
    const moonGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const moonTex = createProceduralMoonTexture();
    const moonMat = new THREE.MeshBasicMaterial({
      map: moonTex,
      color: 0xffffff,
      fog: false,
    });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.rotation.y = -0.6; // orient maria towards courtyard
    this.moonGroup.add(this.moonMesh);

    // Soft blurred atmospheric lunar corona (Gaussian radial falloff, zero sharp edges or concentric rings)
    const glowTex = createProceduralMoonGlowTexture();
    const glowGeo = new THREE.PlaneGeometry(16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
    });
    const moonCorona = new THREE.Mesh(glowGeo, glowMat);
    moonCorona.lookAt(new THREE.Vector3(0, 2.0, 4.0).sub(this.moonPos));
    this.moonHalos.push(moonCorona);
    this.moonGroup.add(moonCorona);

    // Secondary wide outer misty aura
    const outerGlowGeo = new THREE.PlaneGeometry(28, 28);
    const outerGlowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0.30,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
    });
    const outerCorona = new THREE.Mesh(outerGlowGeo, outerGlowMat);
    outerCorona.lookAt(new THREE.Vector3(0, 2.0, 4.0).sub(this.moonPos));
    this.moonHalos.push(outerCorona);
    this.moonGroup.add(outerCorona);

    this.group.add(this.moonGroup);

    // 2. Distant silhouettes of sacred Govardhan hills
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x091428,
      roughness: 0.95,
    });
    const hillOffsets = [
      [-18, 2, -28, 12, 6],
      [-5, 3, -32, 16, 7],
      [14, 2.5, -29, 14, 6.5],
    ];
    hillOffsets.forEach(([hx, hy, hz, r, h]) => {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(r, h, 16), hillMat);
      hill.position.set(hx, hy, hz);
      this.group.add(hill);
    });
  }

  private createRusticLanternPost(x: number, z: number, height: number = 2.5): THREE.Vector3 {
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.85,
      metalness: 0.1,
    });
    // Vertical wooden post
    const postGeo = new THREE.CylinderGeometry(0.06, 0.08, height, 8);
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(x, height / 2, z);
    post.castShadow = true;
    this.group.add(post);

    // Curved iron/brass arm extending out
    const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6);
    armGeo.rotateZ(Math.PI / 3);
    const arm = new THREE.Mesh(armGeo, this.materials.gold);
    arm.position.set(x + 0.18, height - 0.1, z);
    this.group.add(arm);

    // Return hook attachment coordinate
    return new THREE.Vector3(x + 0.35, height, z);
  }

  private createHangingLanterns() {
    // 1. Mud House 1 (Left background mud house veranda)
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-6.5, 2.4, -2.1), 0.35, 0xffa439, 1.25, 5.8, 1)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-4.5, 2.4, -2.3), 0.38, 0xfbbf24, 1.2, 5.5, 2)
    );

    // 2. Mud House 2 (Right background mud house veranda)
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(5.2, 2.5, -1.2), 0.35, 0xf59e0b, 1.3, 6.0, 3)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(7.3, 2.5, -1.6), 0.38, 0xffaa33, 1.2, 5.6, 4)
    );

    // 3. Mud House 3 (Far left mud house veranda)
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-7.8, 2.35, 2.3), 0.32, 0xf59e0b, 1.15, 5.2, 5)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-6.4, 2.35, 3.8), 0.36, 0xfbbf24, 1.15, 5.4, 6)
    );

    // 4. Butter Matki Scene (Hanging on the outer timber rafter ends, clear of Krishna)
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-3.4, 2.65, 1.2), 0.36, 0xfef08a, 1.3, 6.0, 7)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-2.4, 2.75, 0.4), 0.38, 0xfbbf24, 1.2, 5.5, 8)
    );

    // 5. Vrindavan Jhula Swing Canopy (Back floral swing arch posts)
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-1.8, 2.7, -4.8), 0.4, 0xfef08a, 1.35, 5.8, 9)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(1.8, 2.7, -4.8), 0.4, 0xfef08a, 1.35, 5.8, 10)
    );

    // 6. Sacred Gomati Cow & Calf Scene (Rustic post safely to the outer right flank)
    const cowPostHook = this.createRusticLanternPost(5.6, 2.2, 2.8);
    this.hangingLanterns.push(
      this.createSingleHangingLantern(cowPostHook, 0.38, 0xffa439, 1.35, 6.2, 11)
    );

    // 7. Sacred Yamuna River Embankment (Outer lateral ghat corners)
    const yamunaLeftHook = this.createRusticLanternPost(-5.8, -7.8, 2.2);
    const yamunaRightHook = this.createRusticLanternPost(5.8, -7.8, 2.2);
    this.hangingLanterns.push(
      this.createSingleHangingLantern(yamunaLeftHook, 0.38, 0xf59e0b, 1.3, 6.5, 12)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(yamunaRightHook, 0.38, 0xfbbf24, 1.3, 6.5, 13)
    );

    // 8. Courtyard Pathway Outer Flanks (Framing the village pathway on both sides, center line clear)
    const leftFlankHook = this.createRusticLanternPost(-3.8, 4.4, 2.8);
    this.hangingLanterns.push(
      this.createSingleHangingLantern(leftFlankHook, 0.40, 0xffaa33, 1.35, 6.5, 14)
    );
    const rightFlankHook = this.createRusticLanternPost(3.8, 4.4, 2.8);
    this.hangingLanterns.push(
      this.createSingleHangingLantern(rightFlankHook, 0.40, 0xfef08a, 1.35, 6.5, 15)
    );
  }

  private createSingleHangingLantern(
    pos: THREE.Vector3,
    cordLength: number,
    lanternColor: number = 0xffa439,
    baseIntensity: number = 1.15,
    lightDistance: number = 5.5,
    seed: number = 0
  ) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // 1. Suspension Cord / Link Chain
    const cordMat = new THREE.MeshStandardMaterial({
      color: 0x4a3b32,
      roughness: 0.8,
      metalness: 0.2,
    });
    const cordGeo = new THREE.CylinderGeometry(0.012, 0.012, cordLength, 6);
    const cordMesh = new THREE.Mesh(cordGeo, cordMat);
    cordMesh.position.y = -cordLength / 2;
    group.add(cordMesh);

    // 2. Swaying Lantern Assembly hanging at the bottom of the cord
    const lanternAssembly = new THREE.Group();
    lanternAssembly.position.y = -cordLength;

    // Brass Top Cap & Hanging Ring
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.7,
      roughness: 0.35,
    });
    const ringGeo = new THREE.TorusGeometry(0.045, 0.01, 8, 16);
    const ringMesh = new THREE.Mesh(ringGeo, brassMat);
    ringMesh.position.y = 0.28;
    lanternAssembly.add(ringMesh);

    // Tiered brass roof
    const capGeo = new THREE.ConeGeometry(0.2, 0.12, 8);
    const capMesh = new THREE.Mesh(capGeo, brassMat);
    capMesh.position.y = 0.2;
    lanternAssembly.add(capMesh);

    // Translucent Festive Glowing Lantern Core (traditional Kandil / Diya cage)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: lanternColor,
      emissiveIntensity: 1.4,
      roughness: 0.25,
      metalness: 0.05,
      transparent: true,
      opacity: 0.94,
    });
    const coreGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.26, 8);
    const glowMesh = new THREE.Mesh(coreGeo, coreMat);
    glowMesh.position.y = 0.02;
    lanternAssembly.add(glowMesh);

    // Outer Brass Ornamental Cage Struts (8 vertical ribs)
    for (let r = 0; r < 8; r++) {
      const angle = (r / 8) * Math.PI * 2;
      const ribGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.27, 4);
      const rib = new THREE.Mesh(ribGeo, brassMat);
      rib.position.set(Math.cos(angle) * 0.138, 0.02, Math.sin(angle) * 0.138);
      lanternAssembly.add(rib);
    }

    // Bottom Brass Base Plate
    const baseGeo = new THREE.CylinderGeometry(0.15, 0.13, 0.04, 8);
    const baseMesh = new THREE.Mesh(baseGeo, brassMat);
    baseMesh.position.y = -0.12;
    lanternAssembly.add(baseMesh);

    // Bottom dangling bell / festive tassel
    const tasselMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.7,
    });
    const tasselGeo = new THREE.ConeGeometry(0.04, 0.14, 6);
    tasselGeo.rotateX(Math.PI);
    const tasselMesh = new THREE.Mesh(tasselGeo, tasselMat);
    tasselMesh.position.y = -0.22;
    lanternAssembly.add(tasselMesh);

    // Small festive golden bead at tip of tassel
    const beadGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const beadMesh = new THREE.Mesh(beadGeo, brassMat);
    beadMesh.position.y = -0.29;
    lanternAssembly.add(beadMesh);

    // 3. Soft Point Light Source with gentle decay
    const light = new THREE.PointLight(lanternColor, baseIntensity, lightDistance, 1.8);
    light.position.set(0, 0.02, 0);
    lanternAssembly.add(light);

    group.add(lanternAssembly);
    this.group.add(group);

    const phaseOffset = seed * 1.618;
    const flickerSpeed = 7.0 + (seed % 5) * 1.4;
    const swaySpeed = 1.1 + (seed % 4) * 0.25;
    const swayAngle = 0.028 + (seed % 3) * 0.012;

    return {
      group,
      lanternAssembly,
      light,
      glowMesh,
      baseIntensity,
      baseEmissive: 1.4,
      flickerSpeed,
      phaseOffset,
      swaySpeed,
      swayAngle,
    };
  }

  public triggerMatkiPop() {
    this.matkiWobble = 0.8;
    this.matkiWobbleVel = 6.0;
    this.matkiButterSplashes.visible = true;
    setTimeout(() => {
      this.matkiButterSplashes.visible = false;
    }, 1400);
  }

  public triggerCowPet() {
    this.cowReaction = 1.0;
  }

  public pushJhula() {
    this.jhulaVelocity += 0.38;
  }

  public update(time: number) {
    // 1. Matki gentle swing & wobble physics
    if (this.matkiGroup) {
      if (this.matkiWobble > 0.005) {
        this.matkiWobble *= 0.94;
        this.matkiGroup.rotation.z = Math.sin(time * 16) * this.matkiWobble;
        this.matkiGroup.rotation.x = Math.cos(time * 14) * this.matkiWobble * 0.7;
      } else {
        // Natural gentle environmental breeze
        this.matkiGroup.rotation.z = Math.sin(time * 1.8) * 0.08;
        this.matkiGroup.rotation.x = Math.cos(time * 1.5) * 0.05;
      }
    }

    // 2. Cow subtle idle animation
    if (this.cowHead) {
      const earTwitch = Math.sin(time * 6) > 0.85 ? Math.sin(time * 25) * 0.2 : 0;
      this.cowEars.forEach((ear, idx) => {
        ear.rotation.z = (idx === 0 ? -0.3 : 0.3) + earTwitch * (idx === 0 ? 1 : -1);
      });

      if (this.cowReaction > 0.01) {
        this.cowReaction *= 0.95;
        this.cowHead.rotation.y = THREE.MathUtils.lerp(this.cowHead.rotation.y, 0.45, 0.1);
        this.cowHead.rotation.z = Math.sin(time * 8) * 0.1;
      } else {
        // Gentle peaceful grazing head movement
        this.cowHead.rotation.y = Math.sin(time * 0.8) * 0.12;
        this.cowHead.rotation.x = Math.cos(time * 0.6) * 0.06;
      }

      // Cow tail gentle periodic swish
      if (this.cowTail) {
        this.cowTail.rotation.z = Math.sin(time * 2.2) * 0.14;
      }
    }

    // Calf gentle head nod
    if (this.calfHead) {
      this.calfHead.rotation.z = Math.sin(time * 1.2) * 0.08;
    }

    // Flute Altar rotating aura ring and celestial golden light pulse
    if (this.fluteAuraRing) {
      this.fluteAuraRing.rotation.z = time * 0.45;
      const pulse = 1 + Math.sin(time * 2.4) * 0.07;
      this.fluteAuraRing.scale.set(pulse, pulse, pulse);
    }
    if (this.fluteAltarLight) {
      this.fluteAltarLight.intensity = 1.5 + Math.sin(time * 3.0) * 0.22;
    }

    // 3. Jhula harmonic swinging physics - continuous gentle persistent breeze & pendulum dynamics
    if (this.jhulaSeat) {
      // Natural pendulum physics: acceleration = -gravity * sin(theta) - damping * velocity + persistent environmental breeze torque
      const gravity = 2.2;
      const damping = 0.992;
      // Persistent harmonic breeze continuously feeds the swing so it stays gently in motion throughout the experience
      const breezeDrive =
        Math.sin(time * 0.92) * 0.052 +
        Math.sin(time * 0.45 + 1.2) * 0.018 +
        Math.cos(time * 1.85) * 0.009;

      this.jhulaVelocity += (-gravity * Math.sin(this.jhulaAngle) + breezeDrive) * 0.016;
      this.jhulaVelocity *= damping;
      this.jhulaAngle += this.jhulaVelocity * 0.016;

      // Soft natural pitch sway forward & back
      this.jhulaSeat.rotation.x = this.jhulaAngle;

      // Gentle secondary banking/roll roll sway on the ropes due to uneven breeze
      this.jhulaSeat.rotation.z = Math.sin(time * 0.75 + 0.5) * 0.018;

      // Cute Bal Krishna joyful counter-inertia and head tilt with the swing motion
      if (this.cuteKrishnaMesh) {
        this.cuteKrishnaMesh.rotation.y = Math.sin(time * 1.4) * 0.06;
        this.cuteKrishnaMesh.rotation.z = -this.jhulaSeat.rotation.z * 0.7;
      } else if (this.cuteKrishnaProcedural && this.cuteKrishnaProcedural.visible) {
        this.cuteKrishnaProcedural.rotation.y = Math.sin(time * 1.4) * 0.06;
        this.cuteKrishnaProcedural.rotation.z = -this.jhulaSeat.rotation.z * 0.7;
      }
    }

    // 4. Diya flicker animation
    for (let d = 0; d < this.diyaFlames.length; d++) {
      const flame = this.diyaFlames[d];
      const light = this.diyaLights[d];
      const flicker = 1 + Math.sin(time * 12 + d * 1.7) * 0.15 + (Math.random() - 0.5) * 0.08;
      flame.scale.set(flicker, flicker * 1.1, flicker);
      if (light) {
        light.intensity = 0.75 * flicker;
      }
    }

    // 5. Yamuna water dynamic flowing river wave animation
    if (this.waterMaterial) {
      this.waterMaterial.uniforms.uTime.value = time;
    }

    // Exact analytical wave elevation matching Yamuna vertex shader
    const getWaveY = (x: number, z: number, t: number) => {
      return (
        Math.sin(x * 0.38 + z * 0.32 + t * 1.6) * 0.045 +
        Math.cos(x * 0.85 - z * 0.65 + t * 2.2) * 0.025 +
        Math.sin(x * 1.8 + z * 1.4 + t * 3.4) * 0.012
      );
    };

    // 6. Lotus blossoms dynamic bobbing & tilting with the flowing Yamuna waves
    this.lotusData.forEach((item) => {
      const waveY = getWaveY(item.baseX, item.baseZ, time);
      item.group.position.y = 0.02 + waveY;
      item.group.rotation.z = Math.sin(time * 1.5 + item.phase) * 0.045;
      item.group.rotation.x = Math.cos(time * 1.2 + item.phase) * 0.035;
      item.group.rotation.y += 0.001;
    });

    // Floating sacred leaf-diyas drifting down the Yamuna with flame reflections
    this.floatingDiyas.forEach((diya) => {
      const driftX = Math.sin(time * diya.speed + diya.phase) * 0.45;
      const currentX = diya.baseX + driftX;
      const currentZ = diya.baseZ + Math.cos(time * diya.speed * 0.75 + diya.phase) * 0.22;
      diya.group.position.x = currentX;
      diya.group.position.z = currentZ;

      const waveY = getWaveY(currentX, currentZ, time);
      diya.group.position.y = 0.02 + waveY;
      diya.group.rotation.z = Math.sin(time * 2.2 + diya.phase) * 0.055;
      diya.group.rotation.x = Math.cos(time * 1.8 + diya.phase) * 0.045;

      const flameFlicker = 1 + Math.sin(time * 14 + diya.phase) * 0.16 + (Math.random() - 0.5) * 0.05;
      diya.flame.scale.set(flameFlicker, flameFlicker * 1.12, flameFlicker);
      diya.light.intensity = 0.75 * flameFlicker;
    });

    // 7. Moon halos gentle celestial shimmer
    this.moonHalos.forEach((halo, idx) => {
      const pulse = 1 + Math.sin(time * 1.8 + idx * 1.2) * 0.04;
      halo.scale.set(pulse, pulse, 1);
    });

    // 8. Hanging Lanterns subtle flicker animation & evening breeze sway
    for (let i = 0; i < this.hangingLanterns.length; i++) {
      const lantern = this.hangingLanterns[i];
      // Multi-layer organic flicker: base oscillation + second harmonic + micro-tremor
      const flicker =
        Math.sin(time * lantern.flickerSpeed + lantern.phaseOffset) * 0.11 +
        Math.sin(time * (lantern.flickerSpeed * 2.1) + lantern.phaseOffset * 1.6) * 0.055 +
        Math.sin(time * 0.85 + lantern.phaseOffset) * 0.04 +
        (Math.random() - 0.5) * 0.035;

      const currentIntensity = Math.max(0.2, lantern.baseIntensity * (1 + flicker));
      lantern.light.intensity = currentIntensity;

      // Synchronized glowing parchment emissive radiance
      const mat = lantern.glowMesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = Math.max(0.35, lantern.baseEmissive * (1 + flicker * 0.75));
      }

      // Gentle evening breeze pendulum sway of the lantern body
      lantern.lanternAssembly.rotation.z =
        Math.sin(time * lantern.swaySpeed + lantern.phaseOffset) * lantern.swayAngle;
      lantern.lanternAssembly.rotation.x =
        Math.cos(time * (lantern.swaySpeed * 0.85) + lantern.phaseOffset) * (lantern.swayAngle * 0.65);
    }
  }
}
