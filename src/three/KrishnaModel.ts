import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createStandardMaterials, COLORS } from './materials.ts';

export class KrishnaCharacter {
  public group: THREE.Group;
  public glbGroup: THREE.Group;
  public proceduralGroup: THREE.Group;
  public isGlbLoaded: boolean = false;
  private materials = createStandardMaterials();

  // Animatable parts
  private headGroup: THREE.Group;
  private torsoMesh: THREE.Mesh;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private fluteGroup: THREE.Group;
  private featherGroup: THREE.Group;
  private leftEyelid: THREE.Mesh;
  private rightEyelid: THREE.Mesh;
  private smileMesh: THREE.Mesh;

  // Divine decorations for GLB
  private lotusPedestal: THREE.Group;
  private divineAuraRing: THREE.Mesh;
  private auraPointLight: THREE.PointLight;

  private blinkTimer: number = 0;
  private isBlinking: boolean = false;
  private blessingActive: boolean = false;
  private blessingProgress: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'KrishnaCharacter';

    this.proceduralGroup = new THREE.Group();
    this.proceduralGroup.name = 'ProceduralKrishna';
    this.group.add(this.proceduralGroup);

    this.glbGroup = new THREE.Group();
    this.glbGroup.name = 'KrishnaFluteGLB';
    this.group.add(this.glbGroup);

    // 0. Padmasana (Sacred Golden Lotus Pedestal)
    this.lotusPedestal = new THREE.Group();
    const pedestalBaseGeo = new THREE.CylinderGeometry(1.1, 1.25, 0.22, 32);
    const pedestalBase = new THREE.Mesh(pedestalBaseGeo, this.materials.gold);
    pedestalBase.receiveShadow = true;
    this.lotusPedestal.add(pedestalBase);

    // Lotus petals ring
    const petalGeo = new THREE.ConeGeometry(0.16, 0.38, 5);
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, this.materials.sash);
      petal.position.set(Math.cos(angle) * 1.05, 0.12, Math.sin(angle) * 1.05);
      petal.rotation.x = Math.PI / 3;
      petal.rotation.y = -angle + Math.PI / 2;
      this.lotusPedestal.add(petal);
    }
    this.lotusPedestal.position.y = 0.11;
    this.group.add(this.lotusPedestal);

    this.divineAuraRing = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({ visible: false })
    );

    this.auraPointLight = new THREE.PointLight(0xf59e0b, 1.6, 7);
    this.auraPointLight.position.set(0, 2.35, 0.7);
    this.group.add(this.auraPointLight);

    // Load the 3D GLB Model (krishna+radha+3d+model.glb)
    this.loadGlbModel();

    // 1. Torso & Dhoti (Procedural Fallback)
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.9, 16);
    this.torsoMesh = new THREE.Mesh(torsoGeo, this.materials.krishnaSkin);
    this.torsoMesh.position.y = 1.35;
    this.torsoMesh.castShadow = true;
    this.proceduralGroup.add(this.torsoMesh);

    // Yellow Dhoti (lower body)
    const dhotiGeo = new THREE.CylinderGeometry(0.45, 0.52, 0.95, 16);
    const dhotiMesh = new THREE.Mesh(dhotiGeo, this.materials.dhoti);
    dhotiMesh.position.y = 0.5;
    dhotiMesh.castShadow = true;
    this.proceduralGroup.add(dhotiMesh);

    // Dhoti fold pleats
    const pleatGeo = new THREE.BoxGeometry(0.24, 0.85, 0.18);
    const pleatMesh = new THREE.Mesh(pleatGeo, this.materials.sash);
    pleatMesh.position.set(0, 0.45, 0.45);
    this.proceduralGroup.add(pleatMesh);

    // Saffron waist sash (Kamarbandh)
    const sashTorus = new THREE.TorusGeometry(0.48, 0.08, 12, 24);
    const sashMesh = new THREE.Mesh(sashTorus, this.materials.sash);
    sashMesh.rotation.x = Math.PI / 2;
    sashMesh.position.y = 0.95;
    this.proceduralGroup.add(sashMesh);

    // Cute little feet
    const footGeo = new THREE.CapsuleGeometry(0.12, 0.22, 8, 12);
    const leftFoot = new THREE.Mesh(footGeo, this.materials.krishnaSkin);
    leftFoot.rotation.x = Math.PI / 2;
    leftFoot.position.set(-0.2, 0.08, 0.1);
    this.proceduralGroup.add(leftFoot);

    const rightFoot = leftFoot.clone();
    rightFoot.position.set(0.2, 0.08, 0.1);
    this.proceduralGroup.add(rightFoot);

    // Golden anklets (Payal)
    const ankletGeo = new THREE.TorusGeometry(0.16, 0.025, 8, 16);
    const leftAnklet = new THREE.Mesh(ankletGeo, this.materials.gold);
    leftAnklet.rotation.x = Math.PI / 2;
    leftAnklet.position.set(-0.2, 0.12, 0);
    this.proceduralGroup.add(leftAnklet);

    const rightAnklet = leftAnklet.clone();
    rightAnklet.position.set(0.2, 0.12, 0);
    this.proceduralGroup.add(rightAnklet);

    // Golden necklace (Kaustubha / Haar) - Procedural
    const necklaceGeo = new THREE.TorusGeometry(0.32, 0.04, 8, 20, Math.PI);
    const necklaceMesh = new THREE.Mesh(necklaceGeo, this.materials.gold);
    necklaceMesh.rotation.x = Math.PI / 2.8;
    necklaceMesh.position.set(0, 1.62, 0.22);
    this.proceduralGroup.add(necklaceMesh);

    const pendantGeo = new THREE.OctahedronGeometry(0.08, 0);
    const pendantMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.2,
      metalness: 0.6,
    });
    const pendantMesh = new THREE.Mesh(pendantGeo, pendantMat);
    pendantMesh.position.set(0, 1.44, 0.36);
    this.proceduralGroup.add(pendantMesh);

    // 2. Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 2.05, 0);

    // Head sphere (cute rounded face)
    const headGeo = new THREE.SphereGeometry(0.48, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, this.materials.krishnaSkin);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Chubby cheeks
    const cheekGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0x5ba4e6,
      roughness: 0.5,
    });
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.3, -0.1, 0.32);
    this.headGroup.add(leftCheek);
    const rightCheek = leftCheek.clone();
    rightCheek.position.set(0.3, -0.1, 0.32);
    this.headGroup.add(rightCheek);

    // Curly Hair Bun (Topknot / Juda)
    const topknotGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const topknotMesh = new THREE.Mesh(topknotGeo, this.materials.krishnaHair);
    topknotMesh.position.set(0.08, 0.52, -0.05);
    this.headGroup.add(topknotMesh);

    // Curly hair masses around back & sides
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 1.3 - 0.5;
      const curlGeo = new THREE.SphereGeometry(0.16 + (i % 2) * 0.03, 12, 12);
      const curlMesh = new THREE.Mesh(curlGeo, this.materials.krishnaHair);
      curlMesh.position.set(
        Math.cos(angle) * 0.44,
        0.18 + Math.sin(angle) * 0.1,
        -Math.sin(angle) * 0.35 - 0.15
      );
      this.headGroup.add(curlMesh);
    }

    // Golden Crown Band (Mukut)
    const crownBandGeo = new THREE.CylinderGeometry(0.49, 0.51, 0.12, 24);
    const crownBandMesh = new THREE.Mesh(crownBandGeo, this.materials.gold);
    crownBandMesh.position.set(0, 0.35, 0);
    this.headGroup.add(crownBandMesh);

    const crownTipGeo = new THREE.ConeGeometry(0.14, 0.28, 4);
    const crownTipMesh = new THREE.Mesh(crownTipGeo, this.materials.gold);
    crownTipMesh.position.set(0, 0.55, 0.4);
    crownTipMesh.rotation.x = 0.2;
    this.headGroup.add(crownTipMesh);

    // Peacock Feather (Mor Pankh) attached to hair bun
    this.featherGroup = new THREE.Group();
    this.featherGroup.position.set(0.16, 0.65, 0.02);
    this.featherGroup.rotation.z = -0.4;
    this.featherGroup.rotation.y = 0.2;

    // Feather quill stem
    const quillGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.55, 8);
    const quillMat = new THREE.MeshStandardMaterial({ color: 0x064e3b });
    const quillMesh = new THREE.Mesh(quillGeo, quillMat);
    quillMesh.position.y = 0.25;
    this.featherGroup.add(quillMesh);

    // Feather outer fan (Teal)
    const featherFanGeo = new THREE.SphereGeometry(0.2, 12, 12);
    featherFanGeo.scale(0.8, 1.4, 0.1);
    const featherFanMesh = new THREE.Mesh(featherFanGeo, this.materials.peacockTeal);
    featherFanMesh.position.y = 0.42;
    this.featherGroup.add(featherFanMesh);

    // Peacock Eye outer blue ring
    const eyeOuterGeo = new THREE.SphereGeometry(0.12, 10, 10);
    eyeOuterGeo.scale(0.9, 1.2, 0.12);
    const eyeOuterMesh = new THREE.Mesh(eyeOuterGeo, this.materials.peacockBlue);
    eyeOuterMesh.position.set(0, 0.44, 0.02);
    this.featherGroup.add(eyeOuterMesh);

    // Peacock Eye inner golden-orange center
    const eyeCenterGeo = new THREE.SphereGeometry(0.065, 8, 8);
    eyeCenterGeo.scale(1, 1, 0.15);
    const eyeCenterMesh = new THREE.Mesh(eyeCenterGeo, this.materials.gold);
    eyeCenterMesh.position.set(0, 0.45, 0.04);
    this.featherGroup.add(eyeCenterMesh);

    this.headGroup.add(this.featherGroup);

    // Forehead Tilak (Urdhva Pundra - sacred white crescent & red saffron line)
    const tilakUGeo = new THREE.BoxGeometry(0.08, 0.18, 0.02);
    const tilakUMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const tilakUMesh = new THREE.Mesh(tilakUGeo, tilakUMat);
    tilakUMesh.position.set(0, 0.18, 0.47);
    this.headGroup.add(tilakUMesh);

    const tilakDotGeo = new THREE.BoxGeometry(0.03, 0.14, 0.025);
    const tilakDotMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const tilakDotMesh = new THREE.Mesh(tilakDotGeo, tilakDotMat);
    tilakDotMesh.position.set(0, 0.16, 0.48);
    this.headGroup.add(tilakDotMesh);

    // Big cute eyes
    const eyeWhiteGeo = new THREE.SphereGeometry(0.1, 12, 12);
    eyeWhiteGeo.scale(1.2, 1.4, 0.4);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeWhite.position.set(-0.18, 0.04, 0.42);
    this.headGroup.add(leftEyeWhite);

    const rightEyeWhite = leftEyeWhite.clone();
    rightEyeWhite.position.set(0.18, 0.04, 0.42);
    this.headGroup.add(rightEyeWhite);

    // Pupil
    const pupilGeo = new THREE.SphereGeometry(0.06, 10, 10);
    pupilGeo.scale(1, 1.2, 0.4);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.18, 0.03, 0.46);
    this.headGroup.add(leftPupil);

    const rightPupil = leftPupil.clone();
    rightPupil.position.set(0.18, 0.03, 0.46);
    this.headGroup.add(rightPupil);

    // Eye catchlights (sparkles in Krishna's eyes)
    const glintGeo = new THREE.SphereGeometry(0.022, 6, 6);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftGlint = new THREE.Mesh(glintGeo, glintMat);
    leftGlint.position.set(-0.16, 0.06, 0.485);
    this.headGroup.add(leftGlint);

    const rightGlint = leftGlint.clone();
    rightGlint.position.set(0.2, 0.06, 0.485);
    this.headGroup.add(rightGlint);

    // Blinking eyelids (semi-spheres animated during blink)
    const eyelidGeo = new THREE.SphereGeometry(0.11, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    eyelidGeo.scale(1.2, 1.4, 0.4);
    this.leftEyelid = new THREE.Mesh(eyelidGeo, this.materials.krishnaSkin);
    this.leftEyelid.position.set(-0.18, 0.06, 0.44);
    this.leftEyelid.rotation.x = -Math.PI / 2;
    this.leftEyelid.scale.set(1, 0.01, 1); // open
    this.headGroup.add(this.leftEyelid);

    this.rightEyelid = this.leftEyelid.clone();
    this.rightEyelid.position.set(0.18, 0.06, 0.44);
    this.headGroup.add(this.rightEyelid);

    // Cute sweet smile
    const smileCurve = new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8);
    const smileMat = new THREE.MeshBasicMaterial({ color: 0xbe185d });
    this.smileMesh = new THREE.Mesh(smileCurve, smileMat);
    this.smileMesh.rotation.z = Math.PI / 2;
    this.smileMesh.position.set(0, -0.22, 0.44);
    this.headGroup.add(this.smileMesh);

    // Golden earrings (Kundal)
    const earringGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
    const leftEarring = new THREE.Mesh(earringGeo, this.materials.gold);
    leftEarring.position.set(-0.48, -0.05, 0);
    this.headGroup.add(leftEarring);

    const rightEarring = leftEarring.clone();
    rightEarring.position.set(0.48, -0.05, 0);
    this.headGroup.add(rightEarring);

    this.proceduralGroup.add(this.headGroup);

    // 3. Arms & Flute (Bansuri)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.42, 1.6, 0);

    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.65, 10);
    const leftArm = new THREE.Mesh(armGeo, this.materials.krishnaSkin);
    leftArm.position.set(0.15, -0.2, 0.25);
    leftArm.rotation.set(0.9, -0.5, 0.8);
    this.leftArmGroup.add(leftArm);

    // Golden armlet
    const armlet = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 12), this.materials.gold);
    armlet.position.set(0.05, -0.1, 0.1);
    this.leftArmGroup.add(armlet);
    this.proceduralGroup.add(this.leftArmGroup);

    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.42, 1.6, 0);
    const rightArm = new THREE.Mesh(armGeo, this.materials.krishnaSkin);
    rightArm.position.set(-0.15, -0.2, 0.25);
    rightArm.rotation.set(0.8, 0.4, -0.9);
    this.rightArmGroup.add(rightArm);
    this.proceduralGroup.add(this.rightArmGroup);

    // Flute (Bansuri) Group
    this.fluteGroup = new THREE.Group();
    this.fluteGroup.position.set(0.05, 1.88, 0.48);
    this.fluteGroup.rotation.set(0.15, 0.1, -0.32);

    // Flute body (golden bamboo cylinder)
    const fluteGeo = new THREE.CylinderGeometry(0.035, 0.032, 1.4, 16);
    fluteGeo.rotateZ(Math.PI / 2);
    const fluteMesh = new THREE.Mesh(fluteGeo, this.materials.gold);
    fluteMesh.castShadow = true;
    this.fluteGroup.add(fluteMesh);

    // Flute finger holes
    const holeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.075, 8);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x78350f });
    for (let i = 0; i < 6; i++) {
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.set(-0.35 + i * 0.13, 0.03, 0);
      this.fluteGroup.add(hole);
    }

    // Hanging silk tassel & pearl on flute tip
    const tasselGeo = new THREE.ConeGeometry(0.05, 0.16, 8);
    const tasselMesh = new THREE.Mesh(tasselGeo, this.materials.sash);
    tasselMesh.position.set(0.68, -0.15, 0);
    this.fluteGroup.add(tasselMesh);

    const pearlGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const pearlMesh = new THREE.Mesh(pearlGeo, this.materials.butter);
    pearlMesh.position.set(0.68, -0.06, 0);
    this.fluteGroup.add(pearlMesh);

    this.proceduralGroup.add(this.fluteGroup);
  }

  private loadGlbModel() {
    const loader = new GLTFLoader();
    const applyGlb = (gltf: any) => {
      const root = gltf.scene;

      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Enlarged central Krishna flute statue: targetHeight 2.95 units
      const targetHeight = 2.95;
      const scale = targetHeight / (size.y || 1);
      root.scale.set(scale, scale, scale);

      // Center on X and Z, position atop the golden lotus pedestal
      root.position.x = -center.x * scale;
      root.position.z = -center.z * scale;
      root.position.y = -box.min.y * scale + 0.22;

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
                m.roughness = Math.max(0.28, m.roughness);
                m.envMapIntensity = 1.35;
              }
            });
          }
        }
      });

      this.glbGroup.add(root);
      this.isGlbLoaded = true;
      // Hide procedural fallback once GLB model has arrived
      this.proceduralGroup.visible = false;
    };

    loader.load(
      '/krisha-flute.glb',
      applyGlb,
      undefined,
      (err) => {
        console.warn('Retrying krisha-flute.glb from local path:', err);
        loader.load(
          'krisha-flute.glb',
          applyGlb,
          undefined,
          (err2) => {
            console.warn('Using procedural Krishna fallback:', err2);
            this.proceduralGroup.visible = true;
          }
        );
      }
    );
  }

  public triggerBlessing() {
    this.blessingActive = true;
    this.blessingProgress = 0;
  }

  public update(time: number, isHovered: boolean = false) {
    // 1. If GLB Model is loaded
    if (this.isGlbLoaded) {
      // Gentle floating / breathing
      const breath = Math.sin(time * 1.8) * 0.025;
      this.glbGroup.position.y = breath;

      // Lotus pedestal slow divine rotation
      this.lotusPedestal.rotation.y = time * 0.04;

      // Blessing gesture
      if (this.blessingActive) {
        this.blessingProgress += 0.015;
        const t = Math.sin(this.blessingProgress * Math.PI);
        this.glbGroup.position.y = breath + t * 0.08;
        this.auraPointLight.intensity = 1.5 + t * 3.0;
        if (this.blessingProgress >= 1) {
          this.blessingActive = false;
          this.auraPointLight.intensity = 1.5;
        }
      }
    } else {
      // Procedural fallback animation
      const breath = Math.sin(time * 2.2) * 0.03;
      this.torsoMesh.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);

      const headSway = Math.sin(time * 1.8) * 0.06;
      const headNod = Math.cos(time * 1.4) * 0.04;
      this.headGroup.rotation.z = headSway;
      this.headGroup.rotation.x = headNod;

      this.featherGroup.rotation.z = -0.4 + Math.sin(time * 3.5) * 0.08;
      this.featherGroup.rotation.x = Math.cos(time * 2.8) * 0.06;

      this.fluteGroup.rotation.z = -0.32 + Math.sin(time * 2.2) * 0.04;
      this.fluteGroup.position.y = 1.88 + Math.cos(time * 2.2) * 0.015;

      this.blinkTimer += 0.016;
      if (this.blinkTimer > 3.8) {
        this.isBlinking = true;
        if (this.blinkTimer > 4.0) {
          this.blinkTimer = 0;
          this.isBlinking = false;
        }
      }

      const eyelidScaleY = this.isBlinking ? 1.0 : (isHovered ? 0.2 : 0.01);
      this.leftEyelid.scale.y = THREE.MathUtils.lerp(this.leftEyelid.scale.y, eyelidScaleY, 0.3);
      this.rightEyelid.scale.y = THREE.MathUtils.lerp(this.rightEyelid.scale.y, eyelidScaleY, 0.3);

      if (this.blessingActive) {
        this.blessingProgress += 0.015;
        const t = Math.sin(this.blessingProgress * Math.PI);
        this.headGroup.rotation.x = headNod + t * 0.15;
        this.fluteGroup.position.y = 1.88 - t * 0.18;
        this.smileMesh.scale.x = 1 + t * 0.4;
        if (this.blessingProgress >= 1) {
          this.blessingActive = false;
        }
      }
    }
  }
}
