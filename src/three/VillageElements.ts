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
    // Courtyard & village earth
    const groundGeo = new THREE.CylinderGeometry(28, 30, 1.2, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x271e16,
      roughness: 0.95,
      metalness: 0.0,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.6;
    groundMesh.receiveShadow = true;
    this.group.add(groundMesh);

    // Stone pathway tiles leading through village to Krishna
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x4a3b32,
      roughness: 0.85,
    });
    for (let i = 0; i < 22; i++) {
      const z = -9 + i * 0.9;
      const x = Math.sin(i * 0.4) * 0.8;
      const stoneGeo = new THREE.BoxGeometry(1.2 + (i % 3) * 0.2, 0.08, 0.7);
      const stone = new THREE.Mesh(stoneGeo, pathMat);
      stone.position.set(x, 0.04, z);
      stone.rotation.y = (Math.random() - 0.5) * 0.2;
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

    // 1. Rustic Timber Rafter Beam with iron hanging hook
    const beamGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.6, 12);
    beamGeo.rotateZ(Math.PI / 2);
    const beamMesh = new THREE.Mesh(beamGeo, this.materials.wood);
    beamMesh.position.y = 1.65;
    beamMesh.castShadow = true;
    this.matkiGroup.add(beamMesh);

    // Iron ceiling ring & mounting peg
    const ceilingRingGeo = new THREE.TorusGeometry(0.07, 0.015, 8, 20);
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6, metalness: 0.7 });
    const ceilingRing = new THREE.Mesh(ceilingRingGeo, ironMat);
    ceilingRing.position.set(0, 1.58, 0);
    this.matkiGroup.add(ceilingRing);

    // Master apex jute rope loop with bound twine coil
    const topCoilGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.18, 12);
    const topCoil = new THREE.Mesh(topCoilGeo, this.materials.jute);
    topCoil.position.set(0, 1.46, 0);
    this.matkiGroup.add(topCoil);

    // 2. Authentic Macrame Jute Sikka (Chhinka / Hanging Pot Sling)
    // Four braided twisted jute suspension cords descending to the pot
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const ropeGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.25, 8);
      const rope = new THREE.Mesh(ropeGeo, this.materials.jute);
      rope.position.set(Math.cos(angle) * 0.28, 0.85, Math.sin(angle) * 0.28);
      rope.rotation.x = Math.sin(angle) * 0.22;
      rope.rotation.z = -Math.cos(angle) * 0.22;
      this.matkiGroup.add(rope);

      // Brass ringlet connectors on ropes
      const ringlet = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 16), this.materials.brassGold);
      ringlet.position.set(Math.cos(angle) * 0.38, 0.38, Math.sin(angle) * 0.38);
      this.matkiGroup.add(ringlet);
    }

    // Macrame Diamond Cradle Netting cupping the belly of the pot
    const netUpperRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.02, 8, 36), this.materials.jute);
    netUpperRing.rotation.x = Math.PI / 2;
    netUpperRing.position.y = 0.18;
    this.matkiGroup.add(netUpperRing);

    const netLowerRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.02, 8, 36), this.materials.jute);
    netLowerRing.rotation.x = Math.PI / 2;
    netLowerRing.position.y = -0.32;
    this.matkiGroup.add(netLowerRing);

    // Interlocking macrame diagonal web strands and knot beads
    for (let k = 0; k < 8; k++) {
      const knotAngle = (k / 8) * Math.PI * 2;
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), this.materials.jute);
      knot.position.set(Math.cos(knotAngle) * 0.54, 0.18, Math.sin(knotAngle) * 0.54);
      this.matkiGroup.add(knot);

      // Diagonal cradle cord
      const nextAngle = ((k + 1) / 8) * Math.PI * 2;
      const diagRopeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.54, 6);
      const diagRope = new THREE.Mesh(diagRopeGeo, this.materials.jute);
      diagRope.position.set(
        (Math.cos(knotAngle) + Math.cos(nextAngle)) * 0.26,
        -0.07,
        (Math.sin(knotAngle) + Math.sin(nextAngle)) * 0.26
      );
      diagRope.rotation.z = Math.cos(knotAngle) * 0.5;
      diagRope.rotation.x = Math.sin(knotAngle) * 0.5;
      this.matkiGroup.add(diagRope);
    }

    // Jute tassel skirt cluster dangling below pot with terracotta beads & golden bells
    const tasselHub = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), this.materials.jute);
    tasselHub.position.set(0, -0.68, 0);
    this.matkiGroup.add(tasselHub);

    for (let t = 0; t < 6; t++) {
      const tAngle = (t / 6) * Math.PI * 2;
      const tasselCord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.008, 0.42 + (t % 2) * 0.12, 6),
        this.materials.jute
      );
      tasselCord.position.set(Math.cos(tAngle) * 0.06, -0.92, Math.sin(tAngle) * 0.06);
      this.matkiGroup.add(tasselCord);

      // Miniature terracotta bead
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), this.materials.terracotta);
      bead.position.set(Math.cos(tAngle) * 0.06, -0.84, Math.sin(tAngle) * 0.06);
      this.matkiGroup.add(bead);

      // Golden Ghungroo bell on tassel end
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 8), this.materials.brassGold);
      bell.position.set(Math.cos(tAngle) * 0.06, -1.14 - (t % 2) * 0.08, Math.sin(tAngle) * 0.06);
      this.matkiGroup.add(bell);
    }

    // 3. Earthen Terracotta Matki (High-Definition Lathe Geometry)
    const potGroup = new THREE.Group();
    potGroup.name = 'MatkiPot';

    // Traditional Indian clay pot cross-section profile points
    const potProfilePoints: THREE.Vector2[] = [
      new THREE.Vector2(0.001, -0.62), // Sealed base center
      new THREE.Vector2(0.24, -0.62),  // Footring base
      new THREE.Vector2(0.27, -0.58),  // Footring bevel
      new THREE.Vector2(0.36, -0.48),  // Lower pot rise
      new THREE.Vector2(0.50, -0.34),  // Swelling lower belly
      new THREE.Vector2(0.62, -0.16),  // Widest belly point
      new THREE.Vector2(0.65, 0.02),   // Mid belly
      new THREE.Vector2(0.61, 0.20),   // Upper belly
      new THREE.Vector2(0.50, 0.36),   // Graceful shoulder taper
      new THREE.Vector2(0.39, 0.46),   // Shoulder to neck curve
      new THREE.Vector2(0.32, 0.52),   // Concave bottleneck
      new THREE.Vector2(0.33, 0.56),   // Neck groove
      new THREE.Vector2(0.38, 0.60),   // Flared lip start
      new THREE.Vector2(0.48, 0.66),   // Flared outer rim
      new THREE.Vector2(0.49, 0.70),   // Rounded rim apex
      new THREE.Vector2(0.43, 0.72),   // Inner rim crest
      new THREE.Vector2(0.34, 0.68),   // Inner mouth rim
      new THREE.Vector2(0.28, 0.58),   // Inner neck wall
      new THREE.Vector2(0.26, 0.48),   // Inner throat
      new THREE.Vector2(0.001, 0.46),  // Inner mouth floor
    ];

    const potGeo = new THREE.LatheGeometry(potProfilePoints, 64);
    const potMesh = new THREE.Mesh(potGeo, this.materials.terracotta);
    potMesh.castShadow = true;
    potMesh.receiveShadow = true;
    potGroup.add(potMesh);

    // Decorative traditional clay relief bands along shoulder
    const reliefBand1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.51, 0.018, 8, 48),
      this.materials.marigoldYellow
    );
    reliefBand1.rotation.x = Math.PI / 2;
    reliefBand1.position.y = 0.35;
    potGroup.add(reliefBand1);

    const reliefBand2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.40, 0.016, 8, 48),
      this.materials.marigoldOrange
    );
    reliefBand2.rotation.x = Math.PI / 2;
    reliefBand2.position.y = 0.45;
    potGroup.add(reliefBand2);

    // Sacred Red & Yellow Kalawa/Mauli thread wrapped around the neck
    for (let w = 0; w < 3; w++) {
      const threadMat = w % 2 === 0 ? this.materials.marigoldOrange : this.materials.marigoldYellow;
      const kalawa = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.014, 6, 32), threadMat);
      kalawa.rotation.x = Math.PI / 2;
      kalawa.position.y = 0.51 + w * 0.024;
      potGroup.add(kalawa);
    }

    // Miniature sacred peacock feather (Mor Pankh) tucked in the neck
    const featherQuill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.004, 0.42, 6),
      this.materials.gold
    );
    featherQuill.position.set(0.28, 0.72, 0.14);
    featherQuill.rotation.z = -0.45;
    featherQuill.rotation.y = 0.2;
    potGroup.add(featherQuill);

    const featherEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 12).scale(0.7, 1.4, 0.15),
      this.materials.peacockTeal
    );
    featherEye.position.set(0.42, 0.88, 0.18);
    featherEye.rotation.z = -0.45;
    potGroup.add(featherEye);

    const featherCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8).scale(0.8, 1.2, 0.2),
      this.materials.peacockBlue
    );
    featherCore.position.set(0.42, 0.88, 0.19);
    featherCore.rotation.z = -0.45;
    potGroup.add(featherCore);

    // 4. Luscious Overflowing Fresh Makhan (White Butter)
    const makhanGroup = new THREE.Group();
    // Rich billowing butter mound over the mouth
    const mainMound = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 24, 24).scale(1.15, 0.58, 1.15),
      this.materials.butter
    );
    mainMound.position.y = 0.65;
    mainMound.castShadow = true;
    makhanGroup.add(mainMound);

    // Sculpted organic butter lobes
    const lobePositions = [
      [-0.14, 0.72, 0.10, 0.16],
      [0.15, 0.71, -0.08, 0.18],
      [0.02, 0.75, 0.14, 0.15],
      [-0.10, 0.70, -0.14, 0.17],
      [0.12, 0.74, 0.11, 0.14],
    ];
    lobePositions.forEach(([lx, ly, lz, lr]) => {
      const lobe = new THREE.Mesh(
        new THREE.SphereGeometry(lr, 16, 16).scale(1.1, 0.7, 1.0),
        this.materials.butter
      );
      lobe.position.set(lx, ly, lz);
      makhanGroup.add(lobe);
    });

    // Realistic dripping butter streams cascading over the terracotta rim
    const dripConfigs = [
      { angle: 0.4, length: 0.38, radius: 0.052, y: 0.48 },
      { angle: 1.6, length: 0.54, radius: 0.048, y: 0.38 },
      { angle: 2.8, length: 0.28, radius: 0.042, y: 0.52 },
      { angle: 3.9, length: 0.46, radius: 0.050, y: 0.42 },
      { angle: 5.1, length: 0.62, radius: 0.045, y: 0.32 },
    ];

    dripConfigs.forEach((d) => {
      const rad = 0.46 + (0.64 - 0.46) * Math.max(0, 0.65 - d.y);
      const dx = Math.cos(d.angle) * rad;
      const dz = Math.sin(d.angle) * rad;

      // Stream body
      const streamGeo = new THREE.CapsuleGeometry(d.radius, d.length, 8, 12);
      const stream = new THREE.Mesh(streamGeo, this.materials.butter);
      stream.position.set(dx, d.y, dz);
      stream.rotation.x = Math.sin(d.angle) * 0.15;
      stream.rotation.z = -Math.cos(d.angle) * 0.15;
      stream.castShadow = true;
      makhanGroup.add(stream);

      // Droplet bead at bottom of stream
      const dropBead = new THREE.Mesh(
        new THREE.SphereGeometry(d.radius * 1.25, 10, 10).scale(0.9, 1.2, 0.9),
        this.materials.butter
      );
      dropBead.position.set(dx * 1.02, d.y - d.length * 0.55, dz * 1.02);
      makhanGroup.add(dropBead);
    });

    potGroup.add(makhanGroup);
    this.matkiGroup.add(potGroup);

    // 5. Interactive Butter Splashes (droplets created when clicked/tapped)
    this.matkiButterSplashes = new THREE.Group();
    this.matkiButterSplashes.visible = false;
    for (let i = 0; i < 16; i++) {
      const dropGeo = new THREE.SphereGeometry(0.05 + Math.random() * 0.06, 10, 10);
      const drop = new THREE.Mesh(dropGeo, this.materials.butter);
      drop.position.set(
        (Math.random() - 0.5) * 1.1,
        0.5 + (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 1.1
      );
      this.matkiButterSplashes.add(drop);
    }
    this.matkiGroup.add(this.matkiButterSplashes);

    this.group.add(this.matkiGroup);
  }

  private createCows() {
    // 1. Mother Sacred Cow (Gomati) - Indian Zebu (Bos indicus) detailed anatomical geometry
    this.cowGroup = new THREE.Group();
    this.cowGroup.name = 'SacredCow';
    this.cowGroup.position.set(3.4, 0, 1.4);
    this.cowGroup.rotation.y = -0.75;

    // Muscular Zebu Torso (Barreled ribcage with pelvic contours)
    const torsoGroup = new THREE.Group();
    const barrelGeo = new THREE.CapsuleGeometry(0.58, 1.45, 16, 24);
    barrelGeo.rotateZ(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, this.materials.cowWhite);
    barrel.position.set(0, 0.96, 0);
    barrel.castShadow = true;
    torsoGroup.add(barrel);

    // Sacred Zebu Dorsal Hump (Kakud) perched majestically on the withers
    const humpGeo = new THREE.SphereGeometry(0.38, 20, 20);
    humpGeo.scale(0.85, 1.35, 0.72);
    humpGeo.rotateZ(-0.32);
    const hump = new THREE.Mesh(humpGeo, this.materials.cowWhite);
    hump.position.set(0.32, 1.46, 0);
    hump.castShadow = true;
    torsoGroup.add(hump);

    // Pelvic flank & pin bones (hindquarters)
    const pelvisGeo = new THREE.SphereGeometry(0.35, 12, 12);
    pelvisGeo.scale(0.72, 1.05, 0.96);
    const pelvis = new THREE.Mesh(pelvisGeo, this.materials.cowWhite);
    pelvis.position.set(-0.64, 1.02, 0);
    torsoGroup.add(pelvis);

    // Muscular shoulder contours
    const leftShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 12, 12).scale(0.8, 1.2, 0.6),
      this.materials.cowWhite
    );
    leftShoulder.position.set(0.42, 0.88, 0.36);
    torsoGroup.add(leftShoulder);

    const rightShoulder = leftShoulder.clone();
    rightShoulder.position.set(0.42, 0.88, -0.36);
    torsoGroup.add(rightShoulder);

    // Traditional piebald markings (soft warm ochre spots on coat)
    const spot1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.30, 10, 10).scale(1.2, 0.35, 0.75),
      this.materials.terracotta
    );
    spot1.position.set(0.12, 1.28, 0.38);
    spot1.rotation.y = 0.2;
    torsoGroup.add(spot1);

    const spot2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 8, 8).scale(1.1, 0.3, 0.6),
      this.materials.terracotta
    );
    spot2.position.set(-0.35, 1.22, -0.40);
    torsoGroup.add(spot2);

    // Undulating Throat Dewlap (Galakambal) hanging gracefully under neck
    const dewlapGeo = new THREE.CylinderGeometry(0.03, 0.14, 0.72, 8);
    dewlapGeo.scale(0.4, 1.0, 1.25);
    dewlapGeo.rotateZ(0.65);
    const dewlap = new THREE.Mesh(dewlapGeo, this.materials.cowWhite);
    dewlap.position.set(0.56, 0.78, 0);
    torsoGroup.add(dewlap);

    this.cowGroup.add(torsoGroup);

    // 4 Articulated Legs with Shoulders, Knees, Hocks, and Split Cloven Hooves
    const hornHoofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.2 });

    const createClovenLeg = (isFront: boolean, isLeft: boolean) => {
      const leg = new THREE.Group();
      const zSign = isLeft ? 1 : -1;
      const xPos = isFront ? 0.44 : -0.48;
      const zPos = isFront ? 0.34 * zSign : 0.32 * zSign;

      // Upper leg segment
      const upperGeo = new THREE.CylinderGeometry(isFront ? 0.10 : 0.12, 0.085, 0.42, 10);
      const upper = new THREE.Mesh(upperGeo, this.materials.cowWhite);
      upper.position.y = 0.64;
      leg.add(upper);

      // Knee / Hock joint
      const kneeGeo = new THREE.SphereGeometry(isFront ? 0.095 : 0.105, 8, 8);
      const knee = new THREE.Mesh(kneeGeo, this.materials.cowWhite);
      knee.position.y = 0.44;
      leg.add(knee);

      // Lower shank / cannon bone
      const lowerGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.36, 10);
      const lower = new THREE.Mesh(lowerGeo, this.materials.cowWhite);
      lower.position.y = 0.26;
      leg.add(lower);

      // Fetlock joint
      const fetlock = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), this.materials.cowWhite);
      fetlock.position.y = 0.10;
      leg.add(fetlock);

      // Cloven Hoof (Divided into two realistic claws)
      const clawGeo = new THREE.BoxGeometry(0.055, 0.09, 0.065);
      const leftClaw = new THREE.Mesh(clawGeo, hornHoofMat);
      leftClaw.position.set(0.01, 0.045, 0.038);
      leftClaw.rotation.y = 0.08;
      leg.add(leftClaw);

      const rightClaw = new THREE.Mesh(clawGeo, hornHoofMat);
      rightClaw.position.set(0.01, 0.045, -0.038);
      rightClaw.rotation.y = -0.08;
      leg.add(rightClaw);

      leg.position.set(xPos, 0, zPos);
      return leg;
    };

    this.cowGroup.add(createClovenLeg(true, true));
    this.cowGroup.add(createClovenLeg(true, false));
    this.cowGroup.add(createClovenLeg(false, true));
    this.cowGroup.add(createClovenLeg(false, false));

    // Slender Tail with Silky Bushy Hair Switch at the tip
    const tailGroup = new THREE.Group();
    tailGroup.position.set(-0.72, 1.0, 0);
    const tailStemGeo = new THREE.CylinderGeometry(0.032, 0.02, 0.82, 8);
    tailStemGeo.rotateX(0.22);
    const tailStem = new THREE.Mesh(tailStemGeo, this.materials.cowWhite);
    tailStem.position.set(-0.06, -0.38, 0);
    tailGroup.add(tailStem);

    // Bushy tuft
    const tuftGeo = new THREE.ConeGeometry(0.065, 0.28, 8);
    tuftGeo.scale(0.7, 1.0, 1.3);
    const tuft = new THREE.Mesh(tuftGeo, this.materials.cowWhite);
    tuft.position.set(-0.09, -0.82, 0);
    tuft.rotation.x = Math.PI;
    tailGroup.add(tuft);
    this.cowGroup.add(tailGroup);

    // Anatomical Bovine Head & Neck Group (interactive pivot & idle gaze)
    this.cowHead = new THREE.Group();
    this.cowHead.name = 'CowHeadGroup';
    this.cowHead.position.set(0.82, 1.24, 0);

    // Muscular neck junction
    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.36, 0.44, 12).rotateZ(-Math.PI / 4),
      this.materials.cowWhite
    );
    neckMesh.position.set(-0.16, -0.08, 0);
    this.cowHead.add(neckMesh);

    // Bovine Cranium / Skull
    const skullMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 16, 16).scale(1.15, 0.92, 0.82),
      this.materials.cowWhite
    );
    this.cowHead.add(skullMesh);

    // Forehead frontal plate & brow ridges
    const browPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.22, 0.34),
      this.materials.cowWhite
    );
    browPlate.position.set(0.12, 0.12, 0);
    this.cowHead.add(browPlate);

    // Soft Velvety Pink Muzzle with Sculpted Nostrils & Mouth
    const muzzleGroup = new THREE.Group();
    muzzleGroup.position.set(0.36, -0.12, 0);

    const snout = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 14, 14).scale(1.15, 0.72, 0.86),
      this.materials.cowMuzzle
    );
    muzzleGroup.add(snout);

    // Sculpted Left & Right Nostrils
    const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x4a1d1d });
    const leftNostril = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8).scale(0.6, 1.0, 1.4), nostrilMat);
    leftNostril.position.set(0.22, -0.02, 0.10);
    muzzleGroup.add(leftNostril);

    const rightNostril = leftNostril.clone();
    rightNostril.position.set(0.22, -0.02, -0.10);
    muzzleGroup.add(rightNostril);

    // Lower jaw
    const lowerJaw = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.08, 0.26),
      this.materials.cowMuzzle
    );
    lowerJaw.position.set(0.08, -0.12, 0);
    muzzleGroup.add(lowerJaw);
    this.cowHead.add(muzzleGroup);

    // Graceful Lyre-Shaped Horns with Polished Brass Finials (Singhoti)
    const createLyreHorn = (isLeft: boolean) => {
      const hornGroup = new THREE.Group();
      const zSign = isLeft ? 1 : -1;

      // Smooth curving horn stem
      const hornCurvePoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.04, 0.16, 0.10 * zSign),
        new THREE.Vector3(-0.06, 0.32, 0.16 * zSign),
        new THREE.Vector3(0.02, 0.44, 0.11 * zSign),
        new THREE.Vector3(0.08, 0.50, 0.02 * zSign),
      ];
      const hornCurve = new THREE.CatmullRomCurve3(hornCurvePoints);
      const hornGeo = new THREE.TubeGeometry(hornCurve, 20, 0.055, 10, false);
      const hornMesh = new THREE.Mesh(hornGeo, this.materials.cowHorns);
      hornGroup.add(hornMesh);

      // Polished Temple Brass Finial Cap (Singhoti) on horn tip
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), this.materials.brassGold);
      finial.position.copy(hornCurvePoints[4]);
      hornGroup.add(finial);

      hornGroup.position.set(-0.04, 0.32, 0.20 * zSign);
      return hornGroup;
    };

    this.cowHead.add(createLyreHorn(true));
    this.cowHead.add(createLyreHorn(false));

    // Soulful Peaceful Bovine Eyes with Eyelids & Specular Highlights
    const createBovineEye = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      const zSign = isLeft ? 1 : -1;

      // Dark almond iris & pupil
      const iris = new THREE.Mesh(
        new THREE.SphereGeometry(0.062, 12, 12).scale(0.8, 1.0, 0.7),
        new THREE.MeshBasicMaterial({ color: 0x09090b })
      );
      eyeGroup.add(iris);

      // Glistening moist white highlight
      const glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      glint.position.set(0.038, 0.022, 0.025 * zSign);
      eyeGroup.add(glint);

      eyeGroup.position.set(0.18, 0.10, 0.29 * zSign);
      return eyeGroup;
    };

    this.cowHead.add(createBovineEye(true));
    this.cowHead.add(createBovineEye(false));

    // Drooping Bovine Ears with Inner Pink Cartilage Detail (animated idle twitching)
    const createBovineEar = (isLeft: boolean) => {
      const ear = new THREE.Group();
      const zSign = isLeft ? 1 : -1;

      // Outer ear shell
      const earShellGeo = new THREE.ConeGeometry(0.09, 0.36, 8);
      earShellGeo.scale(1, 1, 0.42);
      const earShell = new THREE.Mesh(earShellGeo, this.materials.cowWhite);
      ear.add(earShell);

      // Inner pink velvety lining
      const innerLining = new THREE.Mesh(
        new THREE.ConeGeometry(0.065, 0.28, 6).scale(1, 1, 0.25),
        this.materials.cowMuzzle
      );
      innerLining.position.set(0, 0, 0.015 * zSign);
      ear.add(innerLining);

      ear.position.set(-0.14, 0.20, 0.35 * zSign);
      ear.rotation.set(-1.05 * zSign, 0.22, -0.32);
      return ear;
    };

    const leftEar = createBovineEar(true);
    this.cowHead.add(leftEar);
    this.cowEars.push(leftEar);

    const rightEar = createBovineEar(false);
    this.cowHead.add(rightEar);
    this.cowEars.push(rightEar);

    // Sacred Chandan & Sindoor Tilak on forehead
    const tilakChandan = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.024, 0.12, 6, 8),
      this.materials.marigoldYellow
    );
    tilakChandan.position.set(0.31, 0.16, 0);
    tilakChandan.rotation.z = -0.25;
    this.cowHead.add(tilakChandan);

    const tilakSindoor = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    tilakSindoor.position.set(0.32, 0.16, 0);
    this.cowHead.add(tilakSindoor);

    // Festive Marigold Flower Garland around neck & hump
    const garlandRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.44, 0.05, 8, 28),
      this.materials.marigoldOrange
    );
    garlandRing.rotation.y = Math.PI / 2;
    garlandRing.rotation.z = 0.25;
    garlandRing.position.set(-0.22, -0.12, 0);
    this.cowHead.add(garlandRing);

    // Auspicious Red Ceremonial Collar with Engraved Brass Temple Bell (Ghanti)
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.038, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 })
    );
    collar.rotation.y = Math.PI / 2;
    collar.position.set(-0.16, -0.22, 0);
    this.cowHead.add(collar);

    // Master Brass Temple Bell
    const bellGroup = new THREE.Group();
    bellGroup.position.set(-0.16, -0.55, 0);

    const bellDome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.13, 0.18, 14),
      this.materials.brassGold
    );
    bellGroup.add(bellDome);

    const bellLip = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.022, 6, 18),
      this.materials.brassGold
    );
    bellLip.rotation.x = Math.PI / 2;
    bellLip.position.y = -0.09;
    bellGroup.add(bellLip);

    // Inner clapper
    const clapper = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      this.materials.brassGold
    );
    clapper.position.y = -0.11;
    bellGroup.add(clapper);

    this.cowHead.add(bellGroup);

    this.cowGroup.add(this.cowHead);
    this.group.add(this.cowGroup);

    // 2. Cute Little Calf (Bachhda) resting affectionately beside mother
    this.calfGroup = new THREE.Group();
    this.calfGroup.name = 'CuteCalf';
    this.calfGroup.position.set(4.6, 0, 2.3);
    this.calfGroup.rotation.y = -1.8;

    // Chubby baby body
    const calfBodyGeo = new THREE.CapsuleGeometry(0.34, 0.72, 12, 16);
    calfBodyGeo.rotateZ(Math.PI / 2);
    const calfBody = new THREE.Mesh(calfBodyGeo, this.materials.cowWhite);
    calfBody.position.y = 0.44;
    calfBody.castShadow = true;
    this.calfGroup.add(calfBody);

    // Baby coat spot
    const calfSpot = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8).scale(1.2, 0.35, 0.7),
      this.materials.terracotta
    );
    calfSpot.position.set(0.08, 0.62, 0.22);
    this.calfGroup.add(calfSpot);

    // Dainty little baby legs with tiny cloven hooves
    const calfLegPositions = [
      [0.26, 0.20, 0.22],
      [0.26, 0.20, -0.22],
      [-0.26, 0.20, 0.22],
      [-0.26, 0.20, -0.22],
    ];
    calfLegPositions.forEach(([clx, cly, clz]) => {
      const cLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.048, 0.36, 8),
        this.materials.cowWhite
      );
      cLeg.position.set(clx, cly, clz);
      this.calfGroup.add(cLeg);

      const cHoof = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.055, 0.06, 8),
        hornHoofMat
      );
      cHoof.position.set(clx, 0.03, clz);
      this.calfGroup.add(cHoof);
    });

    // Playful baby tail
    const calfTail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.012, 0.38, 6).rotateX(0.4),
      this.materials.cowWhite
    );
    calfTail.position.set(-0.44, 0.40, 0);
    this.calfGroup.add(calfTail);

    // Sculpted Baby Calf Head Group (animated idle head nod)
    this.calfHead = new THREE.Group();
    this.calfHead.position.set(0.44, 0.64, 0);

    const babySkull = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12).scale(1.1, 0.95, 0.85),
      this.materials.cowWhite
    );
    this.calfHead.add(babySkull);

    // Soft pink baby muzzle
    const babyMuzzle = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 10, 10).scale(1.15, 0.75, 0.85),
      this.materials.cowMuzzle
    );
    babyMuzzle.position.set(0.20, -0.06, 0);
    this.calfHead.add(babyMuzzle);

    // Tiny emerging velvet horn buds (nubs)
    const nubGeo = new THREE.SphereGeometry(0.028, 6, 6);
    const leftNub = new THREE.Mesh(nubGeo, this.materials.cowHorns);
    leftNub.position.set(-0.02, 0.22, 0.11);
    this.calfHead.add(leftNub);

    const rightNub = leftNub.clone();
    rightNub.position.set(-0.02, 0.22, -0.11);
    this.calfHead.add(rightNub);

    // Sweet large curious baby eyes
    const babyEyeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const leftBabyEye = new THREE.Mesh(new THREE.SphereGeometry(0.046, 8, 8), babyEyeMat);
    leftBabyEye.position.set(0.11, 0.08, 0.18);
    this.calfHead.add(leftBabyEye);

    const leftGlint = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    leftGlint.position.set(0.13, 0.10, 0.19);
    this.calfHead.add(leftGlint);

    const rightBabyEye = leftBabyEye.clone();
    rightBabyEye.position.set(0.11, 0.08, -0.18);
    this.calfHead.add(rightBabyEye);

    // Soft floppy baby ears
    const babyEarGeo = new THREE.ConeGeometry(0.06, 0.22, 6).scale(1, 1, 0.35);
    const leftBabyEar = new THREE.Mesh(babyEarGeo, this.materials.cowWhite);
    leftBabyEar.position.set(-0.08, 0.12, 0.22);
    leftBabyEar.rotation.set(-1.1, 0.2, -0.2);
    this.calfHead.add(leftBabyEar);

    const rightBabyEar = leftBabyEar.clone();
    rightBabyEar.position.set(-0.08, 0.12, -0.22);
    rightBabyEar.rotation.set(1.1, -0.2, -0.2);
    this.calfHead.add(rightBabyEar);

    // Festive red silk ribbon collar with a tinkling silver bell
    const babyCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.024, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
    );
    babyCollar.rotation.y = Math.PI / 2;
    babyCollar.position.set(-0.10, -0.10, 0);
    this.calfHead.add(babyCollar);

    const silverBell = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
    );
    silverBell.position.set(-0.10, -0.26, 0);
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

    // 5. Tiny Clay Butter Pot (Makhan Matki) resting next to Little Krishna on the swing
    const miniPot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12).scale(1.0, 1.1, 1.0), this.materials.clayRoof);
    miniPot.position.set(-0.45, 0.14, 0.08);
    miniPot.castShadow = true;
    this.cuteKrishnaProcedural.add(miniPot);

    // Butter overflowing from pot
    const butterTop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.2 }));
    butterTop.position.set(-0.45, 0.24, 0.08);
    this.cuteKrishnaProcedural.add(butterTop);
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
      const stepGeo = new THREE.BoxGeometry(44, 0.14, 0.65);
      const stepMesh = new THREE.Mesh(stepGeo, ghatMat);
      stepMesh.position.set(0, stepY, stepZ);
      stepMesh.receiveShadow = true;
      riverGroup.add(stepMesh);
    }

    // Ghat Carved Pilasters & Stone Lantern Shrines (Deepa-stambha) along the embankment
    const pilasterPositions = [-18, -10, -3, 5, 12, 19];
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
    for (let s = 0; s < 28; s++) {
      const stoneGeo = new THREE.DodecahedronGeometry(0.14 + (s % 4) * 0.08, 1);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3e3228, roughness: 0.85 });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(-20 + s * 1.45 + (Math.sin(s) * 0.4), -0.05, -8.9 + Math.cos(s * 1.5) * 0.45);
      stone.scale.set(1.2, 0.5, 0.9);
      riverGroup.add(stone);
    }

    // 2. Riverbed beneath water
    const riverbedGeo = new THREE.PlaneGeometry(54, 26);
    riverbedGeo.rotateX(-Math.PI / 2);
    const riverbedMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
    const riverbed = new THREE.Mesh(riverbedGeo, riverbedMat);
    riverbed.position.set(0, -0.32, -15.5);
    riverbed.receiveShadow = true;
    riverGroup.add(riverbed);

    // 3. Dynamic Flowing Yamuna Water Mesh (high subdivision for smooth vertex waves)
    this.waterGeometry = new THREE.PlaneGeometry(54, 24, 140, 60);
    this.waterGeometry.rotateX(-Math.PI / 2);
    this.waterMesh = new THREE.Mesh(this.waterGeometry, this.materials.water);
    this.waterMesh.position.set(0, 0.08, -15.5);
    this.waterMesh.receiveShadow = true;
    riverGroup.add(this.waterMesh);

    // Cache initial vertex positions for dynamic wave simulation
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
      lotus.position.set(lx, 0.08, lz);
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
      floatingDiyaGroup.position.set(dx, 0.08, dz);

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

    // Multi-layer Celestial Moon Halos (shimmering atmospheric corona)
    const haloConfigs = [
      { inner: 2.22, outer: 3.8, color: 0xffffff, opacity: 0.35 },
      { inner: 3.6, outer: 6.2, color: 0xbae6fd, opacity: 0.22 },
      { inner: 5.8, outer: 10.5, color: 0x7dd3fc, opacity: 0.12 },
    ];

    haloConfigs.forEach((cfg) => {
      const haloGeo = new THREE.RingGeometry(cfg.inner, cfg.outer, 36);
      const haloMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.lookAt(new THREE.Vector3(0, 2.0, 4.0).sub(this.moonPos));
      this.moonHalos.push(halo);
      this.moonGroup.add(halo);
    });

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
      this.createSingleHangingLantern(new THREE.Vector3(-6.5, 2.4, -2.1), 0.35, 0xffa439, 1.15, 5.5, 1)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-4.5, 2.4, -2.3), 0.38, 0xfbbf24, 1.1, 5.2, 2)
    );

    // 2. Mud House 2 (Right background mud house veranda)
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(5.1, 2.5, -1.2), 0.35, 0xf59e0b, 1.2, 5.8, 3)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(7.3, 2.5, -1.6), 0.38, 0xffaa33, 1.15, 5.4, 4)
    );

    // 3. Mud House 3 (Far left mud house veranda)
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-7.8, 2.35, 2.3), 0.32, 0xf59e0b, 1.05, 5.0, 5)
    );

    // 4. Butter Matki Scene (Strung on the wooden tripod beam)
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-3.2, 2.65, 1.2), 0.36, 0xfef08a, 1.25, 5.8, 6)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-1.3, 2.6, 1.45), 0.42, 0xfbbf24, 1.15, 5.2, 7)
    );

    // 5. Vrindavan Jhula Swing Canopy (Floral swing arch posts)
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(-1.5, 2.7, -4.8), 0.4, 0xfef08a, 1.3, 5.5, 8)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(1.5, 2.7, -4.8), 0.4, 0xfef08a, 1.3, 5.5, 9)
    );

    // 6. Sacred Gomati Cow & Calf Scene (Rustic post beside the shelter)
    const cowPostHook = this.createRusticLanternPost(3.4, 2.7, 2.45);
    this.hangingLanterns.push(
      this.createSingleHangingLantern(cowPostHook, 0.35, 0xffa439, 1.15, 5.6, 10)
    );

    // 7. Sacred Yamuna River Embankment (Rustic riverside mooring lantern posts)
    const yamunaLeftHook = this.createRusticLanternPost(-2.8, -7.8, 2.05);
    const yamunaRightHook = this.createRusticLanternPost(2.8, -7.8, 2.05);
    this.hangingLanterns.push(
      this.createSingleHangingLantern(yamunaLeftHook, 0.38, 0xf59e0b, 1.2, 6.0, 11)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(yamunaRightHook, 0.38, 0xfbbf24, 1.2, 6.0, 12)
    );

    // 8. Central Courtyard / Kadamba Tree Branch
    const courtyardHook = this.createRusticLanternPost(-0.2, 3.4, 2.75);
    this.hangingLanterns.push(
      this.createSingleHangingLantern(courtyardHook, 0.42, 0xffaa33, 1.25, 6.2, 13)
    );
    this.hangingLanterns.push(
      this.createSingleHangingLantern(new THREE.Vector3(1.6, 2.6, 0.9), 0.38, 0xfef08a, 1.1, 5.4, 14)
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
    if (this.waterGeometry && this.waterInitialPositions) {
      const pos = this.waterGeometry.attributes.position;
      const count = pos.count;
      const init = this.waterInitialPositions;
      for (let i = 0; i < count; i++) {
        const ix = init[i * 3];
        const iy = init[i * 3 + 1];
        // Primary downstream river current:
        const w1 = Math.sin(ix * 0.42 + iy * 0.32 + time * 1.8) * 0.045;
        // Cross ripples:
        const w2 = Math.cos(ix * 0.92 - iy * 0.62 + time * 2.3) * 0.022;
        // Micro moonlight sparkles:
        const w3 = Math.sin(ix * 2.2 + iy * 1.5 + time * 3.6) * 0.012;
        pos.setZ(i, w1 + w2 + w3);
      }
      pos.needsUpdate = true;
      this.waterGeometry.computeVertexNormals();
    }

    // 6. Lotus blossoms dynamic bobbing & tilting with the flowing Yamuna waves
    this.lotusData.forEach((item) => {
      const w1 = Math.sin(item.baseX * 0.42 - item.baseZ * 0.32 + time * 1.8) * 0.045;
      const w2 = Math.cos(item.baseX * 0.92 + item.baseZ * 0.62 + time * 2.3) * 0.022;
      item.group.position.y = 0.08 + w1 + w2;
      item.group.rotation.z = Math.sin(time * 1.5 + item.phase) * 0.038;
      item.group.rotation.x = Math.cos(time * 1.2 + item.phase) * 0.028;
      item.group.rotation.y += 0.001;
    });

    // Floating sacred leaf-diyas drifting down the Yamuna with flame reflections
    this.floatingDiyas.forEach((diya) => {
      const driftX = Math.sin(time * diya.speed + diya.phase) * 0.45;
      const currentX = diya.baseX + driftX;
      const currentZ = diya.baseZ + Math.cos(time * diya.speed * 0.75 + diya.phase) * 0.22;
      diya.group.position.x = currentX;
      diya.group.position.z = currentZ;

      const w1 = Math.sin(currentX * 0.42 - currentZ * 0.32 + time * 1.8) * 0.045;
      const w2 = Math.cos(currentX * 0.92 + currentZ * 0.62 + time * 2.3) * 0.022;
      diya.group.position.y = 0.08 + w1 + w2;
      diya.group.rotation.z = Math.sin(time * 2.2 + diya.phase) * 0.045;
      diya.group.rotation.x = Math.cos(time * 1.8 + diya.phase) * 0.035;

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
