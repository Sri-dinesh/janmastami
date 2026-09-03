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
  public waterMesh: THREE.Mesh;
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
    this.matkiGroup.position.set(-2.2, 2.5, 1.2);

    // Hanging tripod or beam
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8);
    beamGeo.rotateZ(Math.PI / 2);
    const beamMesh = new THREE.Mesh(beamGeo, this.materials.wood);
    beamMesh.position.y = 1.6;
    this.matkiGroup.add(beamMesh);

    // Ropes supporting the matki (Sikka)
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const ropeGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 6);
      const rope = new THREE.Mesh(ropeGeo, ropeMat);
      rope.position.set(Math.cos(angle) * 0.25, 0.8, Math.sin(angle) * 0.25);
      rope.rotation.x = Math.sin(angle) * 0.12;
      rope.rotation.z = -Math.cos(angle) * 0.12;
      this.matkiGroup.add(rope);
    }

    // Earthen Clay Pot (Matki)
    const potGroup = new THREE.Group();
    potGroup.name = 'MatkiPot';

    // Round belly of the pot
    const bellyGeo = new THREE.SphereGeometry(0.55, 20, 20);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.75,
    });
    const belly = new THREE.Mesh(bellyGeo, potMat);
    belly.castShadow = true;
    potGroup.add(belly);

    // Neck of the pot
    const neckGeo = new THREE.CylinderGeometry(0.32, 0.42, 0.28, 16);
    const neck = new THREE.Mesh(neckGeo, potMat);
    neck.position.y = 0.52;
    potGroup.add(neck);

    // Pot rim
    const rimGeo = new THREE.TorusGeometry(0.34, 0.06, 8, 20);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, potMat);
    rim.position.y = 0.65;
    potGroup.add(rim);

    // Overflowing Fresh White Butter (Makhan)
    const butterGeo = new THREE.SphereGeometry(0.34, 16, 16);
    butterGeo.scale(1, 0.5, 1);
    const butter = new THREE.Mesh(butterGeo, this.materials.butter);
    butter.position.y = 0.62;
    potGroup.add(butter);

    // Drips of butter running down the earthen pot
    for (let d = 0; d < 4; d++) {
      const dripAngle = (d / 4) * Math.PI * 2 + 0.3;
      const dripGeo = new THREE.CapsuleGeometry(0.045, 0.22, 6, 8);
      const drip = new THREE.Mesh(dripGeo, this.materials.butter);
      drip.position.set(Math.cos(dripAngle) * 0.44, 0.25, Math.sin(dripAngle) * 0.44);
      drip.rotation.z = -Math.cos(dripAngle) * 0.3;
      potGroup.add(drip);
    }

    // Decorative traditional red & gold thread around matki neck
    const threadGeo = new THREE.TorusGeometry(0.38, 0.03, 8, 20);
    threadGeo.rotateX(Math.PI / 2);
    const thread = new THREE.Mesh(threadGeo, this.materials.marigoldOrange);
    thread.position.y = 0.46;
    potGroup.add(thread);

    this.matkiGroup.add(potGroup);

    // Butter Splashes (created when interacted)
    this.matkiButterSplashes = new THREE.Group();
    this.matkiButterSplashes.visible = false;
    for (let i = 0; i < 12; i++) {
      const dropGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.05, 8, 8);
      const drop = new THREE.Mesh(dropGeo, this.materials.butter);
      drop.position.set(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8
      );
      this.matkiButterSplashes.add(drop);
    }
    this.matkiGroup.add(this.matkiButterSplashes);

    this.group.add(this.matkiGroup);
  }

  private createCows() {
    // 1. Mother Sacred Cow (Gomati)
    this.cowGroup = new THREE.Group();
    this.cowGroup.name = 'SacredCow';
    this.cowGroup.position.set(3.4, 0, 1.4);
    this.cowGroup.rotation.y = -0.75;

    // Body (chubby rounded capsule)
    const bodyGeo = new THREE.CapsuleGeometry(0.55, 1.2, 10, 16);
    bodyGeo.rotateZ(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, this.materials.cowWhite);
    body.position.y = 0.95;
    body.castShadow = true;
    this.cowGroup.add(body);

    // Cute brown spot on body
    const spotGeo = new THREE.SphereGeometry(0.28, 8, 8);
    spotGeo.scale(1.2, 0.4, 0.8);
    const spotMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });
    const spot = new THREE.Mesh(spotGeo, spotMat);
    spot.position.set(0.1, 1.25, 0.35);
    this.cowGroup.add(spot);

    // Four cute legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.65, 8);
    const legPositions = [
      [-0.45, 0.35, 0.35],
      [0.45, 0.35, 0.35],
      [-0.45, 0.35, -0.35],
      [0.45, 0.35, -0.35],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, this.materials.cowWhite);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      this.cowGroup.add(leg);

      // Dark hooves
      const hoofGeo = new THREE.CylinderGeometry(0.11, 0.12, 0.1, 8);
      const hoofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
      const hoof = new THREE.Mesh(hoofGeo, hoofMat);
      hoof.position.set(lx, 0.05, lz);
      this.cowGroup.add(hoof);
    });

    // Tail
    const tailGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.7, 6);
    tailGeo.rotateX(0.4);
    const tail = new THREE.Mesh(tailGeo, this.materials.cowWhite);
    tail.position.set(-0.7, 0.8, 0);
    this.cowGroup.add(tail);

    // Cow Head Group (can pivot on interaction)
    this.cowHead = new THREE.Group();
    this.cowHead.position.set(0.75, 1.2, 0);

    // Head base
    const headGeo = new THREE.SphereGeometry(0.38, 14, 14);
    headGeo.scale(1.1, 0.9, 0.85);
    const head = new THREE.Mesh(headGeo, this.materials.cowWhite);
    this.cowHead.add(head);

    // Soft pink muzzle/snout
    const muzzleGeo = new THREE.SphereGeometry(0.24, 12, 12);
    muzzleGeo.scale(1.1, 0.7, 0.8);
    const muzzle = new THREE.Mesh(muzzleGeo, this.materials.cowMuzzle);
    muzzle.position.set(0.3, -0.12, 0);
    this.cowHead.add(muzzle);

    // Cute curved horns
    const hornGeo = new THREE.ConeGeometry(0.065, 0.35, 8);
    const leftHorn = new THREE.Mesh(hornGeo, this.materials.cowHorns);
    leftHorn.position.set(-0.05, 0.38, 0.22);
    leftHorn.rotation.set(-0.4, 0, -0.3);
    this.cowHead.add(leftHorn);

    const rightHorn = leftHorn.clone();
    rightHorn.position.set(-0.05, 0.38, -0.22);
    rightHorn.rotation.set(0.4, 0, -0.3);
    this.cowHead.add(rightHorn);

    // Cute ears (can twitch)
    const earGeo = new THREE.ConeGeometry(0.08, 0.32, 6);
    earGeo.scale(1, 1, 0.4);

    const leftEar = new THREE.Mesh(earGeo, this.materials.cowWhite);
    leftEar.position.set(-0.15, 0.18, 0.34);
    leftEar.rotation.set(-1.1, 0.2, -0.3);
    this.cowHead.add(leftEar);
    this.cowEars.push(leftEar as unknown as THREE.Group);

    const rightEar = leftEar.clone();
    rightEar.position.set(-0.15, 0.18, -0.34);
    rightEar.rotation.set(1.1, -0.2, -0.3);
    this.cowHead.add(rightEar);
    this.cowEars.push(rightEar as unknown as THREE.Group);

    // Big peaceful gentle eyes
    const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.18, 0.1, 0.28);
    this.cowHead.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.set(0.18, 0.1, -0.28);
    this.cowHead.add(rightEye);

    // Bell necklace around cow's neck
    const collarGeo = new THREE.TorusGeometry(0.38, 0.04, 8, 16);
    collarGeo.rotateY(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, this.materials.marigoldOrange);
    collar.position.set(-0.25, -0.15, 0);
    this.cowHead.add(collar);

    const bellGeo = new THREE.CylinderGeometry(0.07, 0.12, 0.16, 8);
    const bell = new THREE.Mesh(bellGeo, this.materials.gold);
    bell.position.set(-0.25, -0.45, 0);
    this.cowHead.add(bell);

    this.cowGroup.add(this.cowHead);
    this.group.add(this.cowGroup);

    // 2. Cute Little Calf resting near mother
    this.calfGroup = new THREE.Group();
    this.calfGroup.name = 'CuteCalf';
    this.calfGroup.position.set(4.6, 0, 2.3);
    this.calfGroup.rotation.y = -1.8;

    const calfBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.65, 8, 12).rotateZ(Math.PI / 2),
      this.materials.cowWhite
    );
    calfBody.position.y = 0.42;
    this.calfGroup.add(calfBody);

    this.calfHead = new THREE.Group();
    this.calfHead.position.set(0.42, 0.62, 0);
    const calfHeadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), this.materials.cowWhite);
    this.calfHead.add(calfHeadMesh);

    const calfMuzzle = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), this.materials.cowMuzzle);
    calfMuzzle.position.set(0.18, -0.06, 0);
    this.calfHead.add(calfMuzzle);

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
    // Sacred Yamuna river curved basin along the back & side
    const riverGeo = new THREE.PlaneGeometry(36, 12, 32, 16);
    riverGeo.rotateX(-Math.PI / 2);
    this.waterMesh = new THREE.Mesh(riverGeo, this.materials.water);
    this.waterMesh.position.set(0, -0.15, -12);
    this.group.add(this.waterMesh);

    // Lotus Blossoms floating on Yamuna
    const lotusPositions = [
      [-4.5, -0.12, -10],
      [-1.8, -0.12, -11.5],
      [2.2, -0.12, -9.5],
      [5.4, -0.12, -12.2],
      [-7.2, -0.12, -13],
    ];

    lotusPositions.forEach(([lx, ly, lz]) => {
      const lotus = this.createLotusBlossom();
      lotus.position.set(lx, ly, lz);
      this.lotusBlossoms.push(lotus);
      this.group.add(lotus);
    });
  }

  private createLotusBlossom(): THREE.Group {
    const lotus = new THREE.Group();

    // Large green lily pad
    const padGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.02, 16);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.01;
    lotus.add(pad);

    // Pink petals radiating outwards
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(0.16, 6, 6).scale(0.5, 0.3, 1.2);
      const petal = new THREE.Mesh(petalGeo, this.materials.lotusPink);
      petal.position.set(Math.cos(angle) * 0.22, 0.08, Math.sin(angle) * 0.22);
      petal.rotation.y = -angle;
      petal.rotation.x = 0.35;
      lotus.add(petal);
    }

    // Golden pollen center
    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), this.materials.marigoldYellow);
    center.position.y = 0.08;
    lotus.add(center);

    // Floating leaf Diya with warm flame
    const miniDiya = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 8), this.materials.diyaFlame);
    miniDiya.position.set(0.12, 0.15, 0.05);
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

    // 5. Yamuna water gentle surface ripple
    if (this.waterMesh) {
      this.waterMesh.position.y = -0.15 + Math.sin(time * 1.4) * 0.03;
    }

    // 6. Lotus gentle bobbing
    this.lotusBlossoms.forEach((lotus, idx) => {
      lotus.position.y = -0.12 + Math.sin(time * 1.6 + idx) * 0.02;
      lotus.rotation.y += 0.001;
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
