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


export class VillageEnvironment {
  public group: THREE.Group;
  private materials = createStandardMaterials();

  // Interactive references
  public matkiGroup: THREE.Group;
  public matkiButterSplashes: THREE.Group;
  public cowGroup: THREE.Group;
  public cowHead: THREE.Group;
  public cowEars: THREE.Group[] = [];
  public calfGroup: THREE.Group;
  public calfHead: THREE.Group;
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
  public waterMaterial?: THREE.ShaderMaterial;
  public waterMesh: THREE.Mesh;
  public waterGeometry: THREE.PlaneGeometry;
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

    // 5. Decorated Janmashtami Jhula (Floral Swing)
    this.createJhula();

    // 6. Sacred Yamuna River Area & Lotus
    this.createYamunaRiver();

    // 7. Courtyard Rangoli & Tulsi Vrindavan
    this.createRangoliAndTulsi();

    // 8. Trees & Foliage
    this.createTrees();

    // 9. Lit Festive Diyas
    this.createDiyas();

    // 10. Celestial Moon & Distant Hills
    this.createMoonAndHills();

    // 11. Hanging Festive Lanterns with soft flickering point lights
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

    // 3. Earthen Terracotta Matki (Masterpiece Artisan Lathe Geometry - 96 segments, 36 profile points)
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

    const potGeo = new THREE.LatheGeometry(potProfilePoints, 96);
    const potMesh = new THREE.Mesh(potGeo, this.materials.terracotta);
    potMesh.castShadow = true;
    potMesh.receiveShadow = true;
    potGroup.add(potMesh);

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

    // Traditional white Aipan / Pithha folk art painted band around the belly
    const aipanTex = createAipanMotifTexture();
    const aipanBandGeo = new THREE.CylinderGeometry(0.72, 0.71, 0.32, 64, 1, true);
    const aipanMat = new THREE.MeshStandardMaterial({
      map: aipanTex,
      transparent: true,
      opacity: 0.90,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    const aipanMesh = new THREE.Mesh(aipanBandGeo, aipanMat);
    aipanMesh.position.y = -0.02;
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

    // 4. Luscious Whipped Fresh Makhan (White Butter) Overflowing
    const makhanGroup = new THREE.Group();

    // High-resolution sculpted whipped butter mound brimming over the mouth
    const mainMound = new THREE.Mesh(
      new THREE.SphereGeometry(0.40, 32, 32).scale(1.18, 0.62, 1.18),
      this.materials.butter
    );
    mainMound.position.y = 0.68;
    mainMound.castShadow = true;
    makhanGroup.add(mainMound);

    // Organic sculpted butter crests and whipped lobes bursting over the rim
    const lobeConfigs = [
      [-0.16, 0.76, 0.12, 0.18],
      [0.18, 0.75, -0.10, 0.20],
      [0.02, 0.80, 0.16, 0.17],
      [-0.12, 0.74, -0.16, 0.19],
      [0.14, 0.78, 0.14, 0.16],
      [-0.04, 0.82, -0.04, 0.18],
    ];
    lobeConfigs.forEach(([lx, ly, lz, lr]) => {
      const lobe = new THREE.Mesh(
        new THREE.SphereGeometry(lr, 18, 18).scale(1.15, 0.75, 1.05),
        this.materials.butter
      );
      lobe.position.set(lx, ly, lz);
      makhanGroup.add(lobe);
    });

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

    // Realistic viscous cascading butter streams trickling down the terracotta body
    const dripConfigs = [
      { angle: 0.4, length: 0.45, radius: 0.052, y: 0.48 },
      { angle: 1.5, length: 0.68, radius: 0.048, y: 0.36 },
      { angle: 2.7, length: 0.34, radius: 0.044, y: 0.54 },
      { angle: 3.8, length: 0.58, radius: 0.050, y: 0.42 },
      { angle: 4.9, length: 0.76, radius: 0.046, y: 0.30 },
      { angle: 5.8, length: 0.42, radius: 0.046, y: 0.50 },
    ];

    dripConfigs.forEach((d) => {
      const rad = 0.52 + (0.71 - 0.52) * Math.max(0, 0.68 - d.y);
      const dx = Math.cos(d.angle) * rad;
      const dz = Math.sin(d.angle) * rad;

      // Organic stream body
      const streamGeo = new THREE.CapsuleGeometry(d.radius, d.length, 10, 16);
      const stream = new THREE.Mesh(streamGeo, this.materials.butter);
      stream.position.set(dx, d.y, dz);
      stream.rotation.x = Math.sin(d.angle) * 0.16;
      stream.rotation.z = -Math.cos(d.angle) * 0.16;
      stream.castShadow = true;
      makhanGroup.add(stream);

      // Droplet teardrop bulb at bottom of stream
      const dropBead = new THREE.Mesh(
        new THREE.SphereGeometry(d.radius * 1.35, 12, 12).scale(0.9, 1.25, 0.9),
        this.materials.butter
      );
      dropBead.position.set(dx * 1.02, d.y - d.length * 0.55, dz * 1.02);
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

    // Muscular Anatomical Zebu Torso & Skeletal Framework
    const torsoGroup = new THREE.Group();

    // Contoured Barreled Ribcage (deep chest behind elbows, tapering into lean loin)
    const barrelGeo = new THREE.CapsuleGeometry(0.60, 1.38, 24, 32);
    barrelGeo.rotateZ(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, this.materials.cowWhite);
    barrel.scale.set(1.15, 1.22, 0.94);
    barrel.position.set(0.04, 0.98, 0);
    barrel.castShadow = true;
    barrel.receiveShadow = true;
    torsoGroup.add(barrel);

    // Sacred Gir Zebu Dorsal Hump (Kakud) perched majestically on the withers
    // Leans gracefully forward over the shoulder blades, smoothly blending into the spine
    const humpGeo = new THREE.SphereGeometry(0.42, 28, 28);
    humpGeo.scale(0.86, 1.42, 0.74);
    humpGeo.rotateZ(-0.28);
    const hump = new THREE.Mesh(humpGeo, this.materials.cowWhite);
    hump.position.set(0.34, 1.52, 0);
    hump.castShadow = true;
    torsoGroup.add(hump);

    // Pelvic Girdle (Rump) with modeled iliac crests (hook bones) and pin bones
    const pelvisGeo = new THREE.SphereGeometry(0.38, 20, 20);
    pelvisGeo.scale(0.82, 1.12, 0.94);
    const pelvis = new THREE.Mesh(pelvisGeo, this.materials.cowWhite);
    pelvis.position.set(-0.66, 1.05, 0);
    pelvis.castShadow = true;
    torsoGroup.add(pelvis);

    // Left & Right Muscular Shoulder Blades (Scapulae)
    const leftShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.30, 16, 16).scale(0.85, 1.32, 0.65),
      this.materials.cowWhite
    );
    leftShoulder.position.set(0.46, 0.92, 0.36);
    torsoGroup.add(leftShoulder);

    const rightShoulder = leftShoulder.clone();
    rightShoulder.position.set(0.46, 0.92, -0.36);
    torsoGroup.add(rightShoulder);

    // Left & Right Stifle / Thigh Musculature on hindquarters
    const leftThigh = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16).scale(0.88, 1.30, 0.70),
      this.materials.cowWhite
    );
    leftThigh.position.set(-0.46, 0.88, 0.35);
    torsoGroup.add(leftThigh);

    const rightThigh = leftThigh.clone();
    rightThigh.position.set(-0.46, 0.88, -0.35);
    torsoGroup.add(rightThigh);

    // Traditional piebald markings (soft warm ochre patches on coat)
    const spot1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 12).scale(1.25, 0.38, 0.8),
      this.materials.terracotta
    );
    spot1.position.set(0.14, 1.30, 0.38);
    spot1.rotation.y = 0.2;
    torsoGroup.add(spot1);

    const spot2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 10, 10).scale(1.15, 0.32, 0.65),
      this.materials.terracotta
    );
    spot2.position.set(-0.36, 1.24, -0.40);
    torsoGroup.add(spot2);

    // Iconic Undulating Throat Dewlap (Galakambal) - characteristic flowing skin folds of Gir cattle
    const dewlapFolds = new THREE.Group();
    // Primary deep throat dewlap fold
    const dewlapGeo1 = new THREE.CylinderGeometry(0.04, 0.18, 0.82, 12);
    dewlapGeo1.scale(0.45, 1.0, 1.35);
    dewlapGeo1.rotateZ(0.68);
    const dewlap1 = new THREE.Mesh(dewlapGeo1, this.materials.cowWhite);
    dewlap1.position.set(0.60, 0.76, 0);
    dewlap1.castShadow = true;
    dewlapFolds.add(dewlap1);

    // Secondary rippling brisket fold cascading between the forelegs
    const dewlapGeo2 = new THREE.CylinderGeometry(0.03, 0.14, 0.58, 10);
    dewlapGeo2.scale(0.4, 1.0, 1.2);
    dewlapGeo2.rotateZ(0.85);
    const dewlap2 = new THREE.Mesh(dewlapGeo2, this.materials.cowWhite);
    dewlap2.position.set(0.48, 0.58, 0);
    dewlapFolds.add(dewlap2);

    torsoGroup.add(dewlapFolds);
    this.cowGroup.add(torsoGroup);

    // 4 Articulated Legs with Shoulders, Knees, Hocks, Pasterns, and Split Cloven Hooves
    const hornHoofMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.38,
      metalness: 0.18,
    });

    const createClovenLeg = (isFront: boolean, isLeft: boolean) => {
      const leg = new THREE.Group();
      const zSign = isLeft ? 1 : -1;
      const xPos = isFront ? 0.44 : -0.48;
      const zPos = isFront ? 0.34 * zSign : 0.32 * zSign;

      // Upper leg segment (Brachium / Thigh)
      const upperGeo = new THREE.CylinderGeometry(isFront ? 0.11 : 0.13, 0.09, 0.44, 12);
      const upper = new THREE.Mesh(upperGeo, this.materials.cowWhite);
      upper.position.y = 0.65;
      leg.add(upper);

      // Carpal Knee / Hock Joint (Tarsus)
      const kneeGeo = new THREE.SphereGeometry(isFront ? 0.10 : 0.115, 10, 10);
      const knee = new THREE.Mesh(kneeGeo, this.materials.cowWhite);
      knee.position.y = 0.44;
      leg.add(knee);

      // Lower Shank / Cannon bone (Metacarpus / Metatarsus)
      const lowerGeo = new THREE.CylinderGeometry(0.082, 0.072, 0.38, 12);
      const lower = new THREE.Mesh(lowerGeo, this.materials.cowWhite);
      lower.position.y = 0.25;
      leg.add(lower);

      // Fetlock Joint
      const fetlock = new THREE.Mesh(new THREE.SphereGeometry(0.078, 10, 10), this.materials.cowWhite);
      fetlock.position.y = 0.10;
      leg.add(fetlock);

      // Pastern (coronet band)
      const pasternGeo = new THREE.CylinderGeometry(0.065, 0.072, 0.06, 10);
      const pastern = new THREE.Mesh(pasternGeo, this.materials.cowWhite);
      pastern.position.y = 0.065;
      leg.add(pastern);

      // Dual-claw Anatomical Cloven Hoof (split into medial and lateral digits)
      const clawGeo = new THREE.BoxGeometry(0.058, 0.085, 0.068);
      const leftClaw = new THREE.Mesh(clawGeo, hornHoofMat);
      leftClaw.position.set(0.015, 0.038, 0.038);
      leftClaw.rotation.y = 0.08;
      leg.add(leftClaw);

      const rightClaw = new THREE.Mesh(clawGeo, hornHoofMat);
      rightClaw.position.set(0.015, 0.038, -0.038);
      rightClaw.rotation.y = -0.08;
      leg.add(rightClaw);

      leg.position.set(xPos, 0, zPos);
      return leg;
    };

    this.cowGroup.add(createClovenLeg(true, true));
    this.cowGroup.add(createClovenLeg(true, false));
    this.cowGroup.add(createClovenLeg(false, true));
    this.cowGroup.add(createClovenLeg(false, false));

    // Slender Bovine Tail with Silky Long Hair Switch at the tip
    const tailGroup = new THREE.Group();
    tailGroup.position.set(-0.72, 1.05, 0);

    const tailStemGeo = new THREE.CylinderGeometry(0.032, 0.018, 0.86, 10);
    tailStemGeo.rotateX(0.18);
    const tailStem = new THREE.Mesh(tailStemGeo, this.materials.cowWhite);
    tailStem.position.set(-0.06, -0.38, 0);
    tailGroup.add(tailStem);

    // Silky long hair tuft (switch)
    const tuftGeo = new THREE.ConeGeometry(0.075, 0.36, 10);
    tuftGeo.scale(0.7, 1.0, 1.35);
    const tuft = new THREE.Mesh(tuftGeo, this.materials.cowWhite);
    tuft.position.set(-0.10, -0.86, 0);
    tuft.rotation.x = Math.PI;
    tailGroup.add(tuft);
    this.cowGroup.add(tailGroup);

    // Anatomical Gir Bovine Head & Neck Group (interactive pivot & idle gaze)
    this.cowHead = new THREE.Group();
    this.cowHead.name = 'CowHeadGroup';
    this.cowHead.position.set(0.86, 1.28, 0);

    // Muscular arched neck junction
    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.38, 0.48, 16).rotateZ(-Math.PI / 4),
      this.materials.cowWhite
    );
    neckMesh.position.set(-0.16, -0.08, 0);
    this.cowHead.add(neckMesh);

    // Bovine Cranium / Skull
    const skullMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 20, 20).scale(1.18, 0.95, 0.85),
      this.materials.cowWhite
    );
    this.cowHead.add(skullMesh);

    // Signature Gir Convex Domed Forehead (High rounded brow of Gir cattle)
    const girForehead = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 18, 18).scale(1.22, 0.95, 0.78),
      this.materials.cowWhite
    );
    girForehead.position.set(0.12, 0.16, 0);
    this.cowHead.add(girForehead);

    // Supraorbital brow ridges sheltering the eyes
    const leftBrow = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 10, 10).scale(1.4, 0.4, 0.6),
      this.materials.cowWhite
    );
    leftBrow.position.set(0.18, 0.18, 0.26);
    leftBrow.rotation.y = 0.2;
    this.cowHead.add(leftBrow);

    const rightBrow = leftBrow.clone();
    rightBrow.position.set(0.18, 0.18, -0.26);
    rightBrow.rotation.y = -0.2;
    this.cowHead.add(rightBrow);

    // Soft Velvety Pinkish-Taupe Muzzle with Sculpted Nostrils & Mouth
    const muzzleGroup = new THREE.Group();
    muzzleGroup.position.set(0.38, -0.12, 0);

    const snout = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 18, 18).scale(1.2, 0.74, 0.88),
      this.materials.cowMuzzle
    );
    muzzleGroup.add(snout);

    // Sculpted Left & Right Nostril Cavities with flared outer wings
    const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x3d1a1a });
    const leftNostril = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 10).scale(0.6, 1.0, 1.4),
      nostrilMat
    );
    leftNostril.position.set(0.24, -0.02, 0.11);
    muzzleGroup.add(leftNostril);

    const rightNostril = leftNostril.clone();
    rightNostril.position.set(0.24, -0.02, -0.11);
    muzzleGroup.add(rightNostril);

    // Gentle lower jaw and chin
    const lowerJaw = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.09, 0.28),
      this.materials.cowMuzzle
    );
    lowerJaw.position.set(0.10, -0.12, 0);
    muzzleGroup.add(lowerJaw);
    this.cowHead.add(muzzleGroup);

    // Majestic Swept-Back Gir Lyre Horns with Polished Brass Finials (Singhoti)
    const createLyreHorn = (isLeft: boolean) => {
      const hornGroup = new THREE.Group();
      const zSign = isLeft ? 1 : -1;

      // Authentic Gir lyre horn curve points: sweeps back from forehead, curves gracefully outward and upward
      const hornCurvePoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.06, 0.18, 0.12 * zSign),
        new THREE.Vector3(-0.10, 0.36, 0.20 * zSign),
        new THREE.Vector3(0.02, 0.50, 0.14 * zSign),
        new THREE.Vector3(0.10, 0.58, 0.04 * zSign),
      ];
      const hornCurve = new THREE.CatmullRomCurve3(hornCurvePoints);
      const hornGeo = new THREE.TubeGeometry(hornCurve, 28, 0.058, 12, false);
      const hornMesh = new THREE.Mesh(hornGeo, this.materials.cowHorns);
      hornGroup.add(hornMesh);

      // Ridged growth rings near the horn base
      for (let r = 0; r < 3; r++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.059 + r * 0.002, 0.008, 6, 16),
          this.materials.cowHorns
        );
        ring.position.set(-0.02 * r, 0.06 + r * 0.06, 0.04 * r * zSign);
        hornGroup.add(ring);
      }

      // Polished Temple Brass Finial Cap (Singhoti) on horn tip
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), this.materials.brassGold);
      finial.position.copy(hornCurvePoints[4]);
      hornGroup.add(finial);

      hornGroup.position.set(-0.06, 0.34, 0.20 * zSign);
      return hornGroup;
    };

    this.cowHead.add(createLyreHorn(true));
    this.cowHead.add(createLyreHorn(false));

    // Soulful Peaceful Bovine Eyes (Kamal-Nayan) with Eyelids & Corneal Highlights
    const createBovineEye = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      const zSign = isLeft ? 1 : -1;

      // Upper and lower eyelid rim
      const lidGeo = new THREE.TorusGeometry(0.075, 0.016, 6, 16, Math.PI);
      const lid = new THREE.Mesh(lidGeo, this.materials.cowWhite);
      lid.position.set(0.02, 0.03, 0);
      lid.rotation.z = -0.15;
      eyeGroup.add(lid);

      // Dark almond iris & pupil
      const iris = new THREE.Mesh(
        new THREE.SphereGeometry(0.068, 16, 16).scale(0.85, 1.0, 0.75),
        new THREE.MeshBasicMaterial({ color: 0x09090b })
      );
      eyeGroup.add(iris);

      // Glistening moist white corneal highlight
      const glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.020, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      glint.position.set(0.042, 0.024, 0.028 * zSign);
      eyeGroup.add(glint);

      eyeGroup.position.set(0.20, 0.12, 0.30 * zSign);
      return eyeGroup;
    };

    this.cowHead.add(createBovineEye(true));
    this.cowHead.add(createBovineEye(false));

    // Iconic Pendulous Leaf-Shaped Gir Ears with Inner Pink Velvety Lining (drooping gently)
    const createBovineEar = (isLeft: boolean) => {
      const ear = new THREE.Group();
      const zSign = isLeft ? 1 : -1;

      // Long pendulous outer ear shell
      const earShellGeo = new THREE.ConeGeometry(0.10, 0.42, 10);
      earShellGeo.scale(1.0, 1.0, 0.42);
      const earShell = new THREE.Mesh(earShellGeo, this.materials.cowWhite);
      ear.add(earShell);

      // Inner soft pink velvety canal lining
      const innerLining = new THREE.Mesh(
        new THREE.ConeGeometry(0.075, 0.34, 8).scale(1.0, 1.0, 0.25),
        this.materials.cowMuzzle
      );
      innerLining.position.set(0, 0, 0.016 * zSign);
      ear.add(innerLining);

      ear.position.set(-0.16, 0.22, 0.36 * zSign);
      ear.rotation.set(-1.15 * zSign, 0.24, -0.34);
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
      new THREE.CapsuleGeometry(0.026, 0.14, 8, 10),
      this.materials.marigoldYellow
    );
    tilakChandan.position.set(0.34, 0.18, 0);
    tilakChandan.rotation.z = -0.25;
    this.cowHead.add(tilakChandan);

    const tilakSindoor = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    tilakSindoor.position.set(0.35, 0.18, 0);
    this.cowHead.add(tilakSindoor);

    // Festive Marigold Flower Garland (Genda Haar) draped over neck & hump
    const garlandRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.055, 10, 36),
      this.materials.marigoldOrange
    );
    garlandRing.rotation.y = Math.PI / 2;
    garlandRing.rotation.z = 0.25;
    garlandRing.position.set(-0.22, -0.12, 0);
    this.cowHead.add(garlandRing);

    // Auspicious Red & Gold Ceremonial Collar with Master Brass Temple Bell (Ghanti)
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.40, 0.042, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.55 })
    );
    collar.rotation.y = Math.PI / 2;
    collar.position.set(-0.16, -0.22, 0);
    this.cowHead.add(collar);

    // Master Brass Temple Bell (Ghanti) with clapper
    const bellGroup = new THREE.Group();
    bellGroup.position.set(-0.16, -0.58, 0);

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

    // Inner clapper
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
    const calfBodyGeo = new THREE.CapsuleGeometry(0.36, 0.76, 16, 20);
    calfBodyGeo.rotateZ(Math.PI / 2);
    const calfBody = new THREE.Mesh(calfBodyGeo, this.materials.cowWhite);
    calfBody.position.y = 0.44;
    calfBody.castShadow = true;
    this.calfGroup.add(calfBody);

    // Tiny emerging baby dorsal hump bud
    const calfHump = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 10, 10).scale(0.85, 1.2, 0.75),
      this.materials.cowWhite
    );
    calfHump.position.set(0.16, 0.76, 0);
    this.calfGroup.add(calfHump);

    // Baby coat spot
    const calfSpot = new THREE.Mesh(
      new THREE.SphereGeometry(0.20, 10, 10).scale(1.25, 0.38, 0.75),
      this.materials.terracotta
    );
    calfSpot.position.set(0.08, 0.64, 0.22);
    this.calfGroup.add(calfSpot);

    // Dainty little baby legs with cloven hooves
    const calfLegPositions = [
      [0.26, 0.20, 0.22],
      [0.26, 0.20, -0.22],
      [-0.26, 0.20, 0.22],
      [-0.26, 0.20, -0.22],
    ];
    calfLegPositions.forEach(([clx, cly, clz]) => {
      const cLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058, 0.048, 0.38, 10),
        this.materials.cowWhite
      );
      cLeg.position.set(clx, cly, clz);
      this.calfGroup.add(cLeg);

      const cHoof = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.058, 0.065, 10),
        hornHoofMat
      );
      cHoof.position.set(clx, 0.03, clz);
      this.calfGroup.add(cHoof);
    });

    // Playful baby tail
    const calfTail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.012, 0.40, 8).rotateX(0.4),
      this.materials.cowWhite
    );
    calfTail.position.set(-0.46, 0.42, 0);
    this.calfGroup.add(calfTail);

    // Sculpted Baby Calf Head Group (animated idle head nod)
    this.calfHead = new THREE.Group();
    this.calfHead.position.set(0.46, 0.66, 0);

    const babySkull = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16).scale(1.12, 0.96, 0.86),
      this.materials.cowWhite
    );
    this.calfHead.add(babySkull);

    // Soft pink baby muzzle
    const babyMuzzle = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 12).scale(1.18, 0.76, 0.88),
      this.materials.cowMuzzle
    );
    babyMuzzle.position.set(0.22, -0.06, 0);
    this.calfHead.add(babyMuzzle);

    // Tiny emerging velvet horn buds (nubs)
    const nubGeo = new THREE.SphereGeometry(0.030, 8, 8);
    const leftNub = new THREE.Mesh(nubGeo, this.materials.cowHorns);
    leftNub.position.set(-0.02, 0.24, 0.11);
    this.calfHead.add(leftNub);

    const rightNub = leftNub.clone();
    rightNub.position.set(-0.02, 0.24, -0.11);
    this.calfHead.add(rightNub);

    // Sweet large curious baby eyes
    const babyEyeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const leftBabyEye = new THREE.Mesh(new THREE.SphereGeometry(0.050, 10, 10), babyEyeMat);
    leftBabyEye.position.set(0.12, 0.08, 0.19);
    this.calfHead.add(leftBabyEye);

    const leftGlint = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    leftGlint.position.set(0.14, 0.10, 0.20);
    this.calfHead.add(leftGlint);

    const rightBabyEye = leftBabyEye.clone();
    rightBabyEye.position.set(0.12, 0.08, -0.19);
    this.calfHead.add(rightBabyEye);

    // Soft floppy baby ears
    const babyEarGeo = new THREE.ConeGeometry(0.065, 0.24, 8).scale(1, 1, 0.38);
    const leftBabyEar = new THREE.Mesh(babyEarGeo, this.materials.cowWhite);
    leftBabyEar.position.set(-0.08, 0.14, 0.23);
    leftBabyEar.rotation.set(-1.1, 0.2, -0.2);
    this.calfHead.add(leftBabyEar);

    const rightBabyEar = leftBabyEar.clone();
    rightBabyEar.position.set(-0.08, 0.14, -0.23);
    rightBabyEar.rotation.set(1.1, -0.2, -0.2);
    this.calfHead.add(rightBabyEar);

    // Festive red silk ribbon collar with a tinkling silver bell
    const babyCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.026, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
    );
    babyCollar.rotation.y = Math.PI / 2;
    babyCollar.position.set(-0.10, -0.10, 0);
    this.calfHead.add(babyCollar);

    const silverBell = new THREE.Mesh(
      new THREE.SphereGeometry(0.040, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
    );
    silverBell.position.set(-0.10, -0.28, 0);
    this.calfHead.add(silverBell);

    this.calfGroup.add(this.calfHead);
    this.group.add(this.calfGroup);
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
    const miniPotGeo = new THREE.LatheGeometry(miniProfilePoints, 32);
    const miniPotMesh = new THREE.Mesh(miniPotGeo, this.materials.terracotta);
    miniPotMesh.castShadow = true;
    miniPotGroup.add(miniPotMesh);

    // Auspicious yellow thread around mini pot neck
    const miniKalawa = new THREE.Mesh(
      new THREE.TorusGeometry(0.095, 0.008, 6, 20),
      this.materials.marigoldYellow
    );
    miniKalawa.rotation.x = Math.PI / 2;
    miniKalawa.position.y = 0.24;
    miniPotGroup.add(miniKalawa);

    // Overflowing whipped butter
    const miniButterMound = new THREE.Mesh(
      new THREE.SphereGeometry(0.10, 16, 16).scale(1.15, 0.65, 1.15),
      this.materials.butter
    );
    miniButterMound.position.y = 0.28;
    miniButterMound.castShadow = true;
    miniPotGroup.add(miniButterMound);

    // Cute butter drip trickling down
    const miniDrip = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.015, 0.12, 6, 8),
      this.materials.butter
    );
    miniDrip.position.set(0.11, 0.20, 0.04);
    miniDrip.rotation.z = -0.2;
    miniPotGroup.add(miniDrip);

    this.cuteKrishnaProcedural.add(miniPotGroup);
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
    }

    // Calf gentle head nod
    if (this.calfHead) {
      this.calfHead.rotation.z = Math.sin(time * 1.2) * 0.08;
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
