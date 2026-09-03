import * as THREE from 'three';
import { KrishnaCharacter } from './KrishnaModel.ts';
import { VillageEnvironment } from './VillageElements.ts';
import { FestivalParticles } from './ParticleSystems.ts';
import { soundEngine } from '../utils/audio.ts';

export interface CameraWaypoint {
  id: number;
  title: string;
  subtitle: string;
  quote: string;
  tagline: string;
  camPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  lightWarmth: number; // 0 to 1
}

export const SCENES: CameraWaypoint[] = [
  {
    id: 0,
    title: "The Night Begins",
    subtitle: "Midnight in sacred Gokul",
    quote: "Under the silvery embrace of the Janmashtami moon, a tranquil village awaits its divine play.",
    tagline: "Scroll or explore through Krishna's little world",
    camPos: new THREE.Vector3(0, 7.5, 12.0),
    targetPos: new THREE.Vector3(0, 1.5, 0),
    lightWarmth: 0.35,
  },
  {
    id: 1,
    title: "Enter Gokul",
    subtitle: "The Sacred Pathway",
    quote: "Mud-plastered cottages, terracotta eaves, and earthen paths scented with rain and kadamba blossoms.",
    tagline: "Follow the stone pathway into the courtyard",
    camPos: new THREE.Vector3(-1.8, 3.2, 7.2),
    targetPos: new THREE.Vector3(-0.4, 1.4, 0.5),
    lightWarmth: 0.5,
  },
  {
    id: 2,
    title: "Little Krishna",
    subtitle: "The Enchanting Boy of Vrindavan",
    quote: "Adorned with the iridescent peacock feather and a golden bansuri whose sweet notes mesmerize the three worlds.",
    tagline: "Click Krishna to hear the melodious bansuri",
    camPos: new THREE.Vector3(0, 2.2, 2.6),
    targetPos: new THREE.Vector3(0, 1.8, 0),
    lightWarmth: 0.7,
  },
  {
    id: 3,
    title: "Makhan Chor",
    subtitle: "The Sweet Butter Heist",
    quote: "High above the floor hangs the earthen matki, brimming with churned white butter irresistible to little Kanha.",
    tagline: "Tap the Matki to wobble and steal butter!",
    camPos: new THREE.Vector3(-2.2, 2.7, 3.4),
    targetPos: new THREE.Vector3(-2.2, 2.5, 1.2),
    lightWarmth: 0.65,
  },
  {
    id: 4,
    title: "Sacred Gomati & Calf",
    subtitle: "Loving Companions of Gokul",
    quote: "With gentle eyes and tinkling bells, the sacred cows rest peacefully listening to Krishna's tune.",
    tagline: "Touch the gentle cow to offer affection",
    camPos: new THREE.Vector3(3.6, 1.8, 3.8),
    targetPos: new THREE.Vector3(3.6, 1.1, 1.6),
    lightWarmth: 0.6,
  },
  {
    id: 5,
    title: "By the Sacred Yamuna",
    subtitle: "Waters of Devotion",
    quote: "Soft moonbeams ripple across serene blue currents, carrying floating lotus blooms and glowing prayer diyas.",
    tagline: "Watch the water ripples and floating lotuses",
    camPos: new THREE.Vector3(0, 2.8, -7.5),
    targetPos: new THREE.Vector3(0, 0.2, -12),
    lightWarmth: 0.45,
  },
  {
    id: 6,
    title: "The Vrindavan Jhula",
    subtitle: "Cute Bal Krishna on the Swing",
    quote: "Adorned with sweet marigolds and jasmine, cute Little Kanha sways joyously in the Vrindavan evening breeze.",
    tagline: "Tap the swing or Cute Krishna to gently sway the Jhula",
    camPos: new THREE.Vector3(0, 2.5, -2.4),
    targetPos: new THREE.Vector3(0, 2.0, -4.8),
    lightWarmth: 0.8,
  },
  {
    id: 7,
    title: "Auspicious Rangoli",
    subtitle: "Floor of Festivity",
    quote: "Sacred patterns drawn in vibrant natural pigments and encircled by radiant clay lamps.",
    tagline: "Move your cursor to witness the divine glow",
    camPos: new THREE.Vector3(0, 4.2, 2.2),
    targetPos: new THREE.Vector3(0, 0.1, 0.2),
    lightWarmth: 0.8,
  },
  {
    id: 8,
    title: "Janmashtami 2026",
    subtitle: "Happy Krishna Janmashtami",
    quote: "The divine moment of celebration. May joy, righteousness, and pure love illuminate every home.",
    tagline: "Click 'Flower Shower' to shower marigold petals",
    camPos: new THREE.Vector3(0, 2.8, 4.5),
    targetPos: new THREE.Vector3(0, 1.8, 0),
    lightWarmth: 0.9,
  },
  {
    id: 9,
    title: "One Little Blessing",
    subtitle: "A Message from Kanha",
    quote: "May your life resonate with the sweetness of Krishna's flute and the boundless grace of love.",
    tagline: "Click 'Receive Blessing' for a personal gift of grace",
    camPos: new THREE.Vector3(0, 2.05, 1.9),
    targetPos: new THREE.Vector3(0, 2.05, 0.2),
    lightWarmth: 1.0,
  },
];

export class JanmashtamiWorld {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Scene components
  public krishna: KrishnaCharacter;
  public village: VillageEnvironment;
  public particles: FestivalParticles;

  // Lights
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private festivePointLight: THREE.PointLight;
  private moonSpotLight: THREE.SpotLight;
  private krishnaMoonRimLight: THREE.PointLight;
  private moonBeamMesh: THREE.Mesh;

  // Camera & Navigation
  private currentSceneIndex: number = 0;
  private targetCamPos = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();
  private currentLookAt = new THREE.Vector3();
  private parallaxOffset = new THREE.Vector2();

  // Free Orbit mode
  public isOrbitMode: boolean = false;
  private isPointerDown: boolean = false;
  private previousPointerPos = { x: 0, y: 0 };
  private orbitSpherical = new THREE.Spherical(5, Math.PI / 3, 0);

  // Raycaster & Interactivity
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(-999, -999);
  private hoveredObjectName: string | null = null;
  private onInteractionCallback?: (name: string, message: string) => void;
  private onSceneChangeCallback?: (index: number) => void;

  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();
  private resizeObserver: ResizeObserver;

  constructor(
    container: HTMLElement,
    callbacks?: {
      onInteraction?: (name: string, message: string) => void;
      onSceneChange?: (index: number) => void;
    }
  ) {
    this.container = container;
    this.onInteractionCallback = callbacks?.onInteraction;
    this.onSceneChangeCallback = callbacks?.onSceneChange;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070b19);
    this.scene.fog = new THREE.FogExp2(0x070b19, 0.024);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const initialWaypoint = SCENES[0];
    this.camera.position.copy(initialWaypoint.camPos);
    this.targetCamPos.copy(initialWaypoint.camPos);
    this.targetLookAt.copy(initialWaypoint.targetPos);
    this.currentLookAt.copy(initialWaypoint.targetPos);
    this.camera.lookAt(this.currentLookAt);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // 4. Add 3D Objects
    this.village = new VillageEnvironment();
    this.scene.add(this.village.group);

    this.krishna = new KrishnaCharacter();
    this.krishna.group.position.set(0, 0, 0);
    this.scene.add(this.krishna.group);

    this.particles = new FestivalParticles();
    this.scene.add(this.particles.group);

    // 5. Lighting Setup (utilizes village and krishna positions)
    this.setupLighting();

    // 6. Event Listeners
    this.setupEvents();

    // 7. Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // 8. Start Loop
    this.animate();
  }

  private setupLighting() {
    // 1. Village ambient light (soft twilight with slight warm saffron undertone)
    this.ambientLight = new THREE.AmbientLight(0x38bdf8, 0.45);
    this.scene.add(this.ambientLight);

    const moonPos = this.village.moonPos; // Sacred Moon position in the sky (4.2, 9.8, -15)
    const krishnaTargetPos = new THREE.Vector3(0, 1.45, 0);

    // 2. Global Directional moonlight originating from the Moon
    this.dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.35);
    this.dirLight.position.copy(moonPos);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 45;
    this.dirLight.shadow.camera.left = -14;
    this.dirLight.shadow.camera.right = 14;
    this.dirLight.shadow.camera.top = 14;
    this.dirLight.shadow.camera.bottom = -14;
    this.dirLight.shadow.bias = -0.001;
    this.scene.add(this.dirLight);

    // 3. Dedicated Celestial Spotlight emitted directly from the Moon onto Lord Krishna
    this.moonSpotLight = new THREE.SpotLight(0xdbeafe, 4.5, 40, 0.32, 0.75, 1.0);
    this.moonSpotLight.position.copy(moonPos);
    this.moonSpotLight.target = this.krishna.group;
    this.moonSpotLight.castShadow = true;
    this.moonSpotLight.shadow.mapSize.width = 1024;
    this.moonSpotLight.shadow.mapSize.height = 1024;
    this.moonSpotLight.shadow.bias = -0.0008;
    this.scene.add(this.moonSpotLight);

    // 4. Ethereal Moon Rim Light accentuating Lord Krishna's divine form with silvery-blue lunar brilliance
    this.krishnaMoonRimLight = new THREE.PointLight(0xa5f3fc, 2.6, 6.5);
    this.krishnaMoonRimLight.position.set(1.2, 2.6, -0.6);
    this.scene.add(this.krishnaMoonRimLight);

    // 5. Volumetric Ethereal Moonlight Beam cascading from the celestial Moon straight down to Lord Krishna
    const dist = moonPos.distanceTo(krishnaTargetPos);
    const beamGeo = new THREE.CylinderGeometry(1.4, 3.2, dist, 28, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
    });
    this.moonBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.moonBeamMesh.position.copy(moonPos.clone().lerp(krishnaTargetPos, 0.5));

    // Align cylinder with vector from Moon to Krishna
    const dir = krishnaTargetPos.clone().sub(moonPos).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    this.moonBeamMesh.setRotationFromQuaternion(quat);
    this.scene.add(this.moonBeamMesh);

    // 6. Golden festive point light near Krishna & courtyard (balances moonlight with sacred diya warmth)
    this.festivePointLight = new THREE.PointLight(0xf59e0b, 1.8, 12);
    this.festivePointLight.position.set(0, 3.2, 1.5);
    this.scene.add(this.festivePointLight);
  }

  private setupEvents() {
    const el = this.container;

    // Mouse / Touch Move for Parallax and Raycasting
    const onMove = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      this.mouse.set(x, y);

      if (!this.isOrbitMode) {
        // Subtle Parallax
        this.parallaxOffset.set(x * 0.35, y * 0.25);
      } else if (this.isPointerDown) {
        // Free Orbit calculation
        const deltaX = clientX - this.previousPointerPos.x;
        const deltaY = clientY - this.previousPointerPos.y;
        this.orbitSpherical.theta -= deltaX * 0.008;
        this.orbitSpherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, this.orbitSpherical.phi - deltaY * 0.008));
        this.previousPointerPos = { x: clientX, y: clientY };
      }
    };

    el.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    el.addEventListener('touchmove', (e) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    });

    el.addEventListener('mousedown', (e) => {
      this.isPointerDown = true;
      this.previousPointerPos = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => {
      this.isPointerDown = false;
    });

    // Click / Tap Raycasting for 3D Interactions
    el.addEventListener('click', (e) => {
      this.handlePointerInteraction(e.clientX, e.clientY);
    });
  }

  private handlePointerInteraction(clientX: number, clientY: number) {
    const rect = this.container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.mouse.set(x, y);

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      let hitObj: THREE.Object3D | null = intersects[0].object;

      // Climb parent chain to find recognizable named interactables
      while (hitObj && hitObj !== this.scene) {
        const name = hitObj.name;

        if (name === 'MatkiPot' || name.includes('Matki') || hitObj === this.village.matkiGroup) {
          this.village.triggerMatkiPop();
          soundEngine.playButterPop();
          this.onInteractionCallback?.('matki', 'Makhan chor spotted! Delicious fresh butter spilled!');
          return;
        }

        if (name === 'SacredCow' || name === 'CuteCalf' || hitObj === this.village.cowGroup || hitObj === this.village.calfGroup) {
          this.village.triggerCowPet();
          soundEngine.playCowBell();
          this.particles.showerPetals();
          this.onInteractionCallback?.('cow', 'Gomati blinks peacefully and receives your gentle love.');
          return;
        }

        let isJhulaClick = false;
        let testObj: THREE.Object3D | null = hitObj;
        while (testObj) {
          if (
            testObj.name === 'JanmashtamiJhula' ||
            testObj.name === 'CuteKrishnaJhula' ||
            testObj.name === 'CuteKrishnaGLBModel' ||
            testObj.name === 'ProceduralBalKrishna' ||
            testObj === this.village.jhulaSeat ||
            testObj === this.village.cuteKrishnaGroup
          ) {
            isJhulaClick = true;
            break;
          }
          testObj = testObj.parent;
        }

        if (isJhulaClick) {
          this.village.pushJhula();
          soundEngine.playTempleBell();
          this.particles.showerPetals();
          this.onInteractionCallback?.('jhula', 'Cute Bal Krishna sways joyously on the floral Vrindavan Jhula! 🌸✨');
          return;
        }

        if (name === 'KrishnaCharacter' || hitObj === this.krishna.group) {
          this.krishna.triggerBlessing();
          soundEngine.playFlutePhrase();
          this.particles.showerPetals();
          this.onInteractionCallback?.('krishna', 'Little Krishna smiles radiantly and plays a sweet bansuri melody.');
          return;
        }

        if (name.startsWith('Diya_')) {
          soundEngine.playTempleBell();
          this.particles.showerPetals();
          this.onInteractionCallback?.('diya', 'Auspicious terracotta diya brightens the village courtyard.');
          return;
        }

        hitObj = hitObj.parent;
      }
    }

    // If clicked empty space while in Krishna or Matki scene
    if (this.currentSceneIndex === 2 || this.currentSceneIndex === 8) {
      this.particles.showerPetals();
    }
  }

  public setSceneIndex(index: number) {
    if (index < 0 || index >= SCENES.length) return;
    this.currentSceneIndex = index;
    const waypoint = SCENES[index];
    this.targetCamPos.copy(waypoint.camPos);
    this.targetLookAt.copy(waypoint.targetPos);

    // Adapt light warmth smoothly
    const warmth = waypoint.lightWarmth;
    this.ambientLight.color.setHex(warmth > 0.6 ? 0xfef08a : 0x38bdf8);
    this.ambientLight.intensity = 0.4 + warmth * 0.3;
    this.festivePointLight.intensity = 1.0 + warmth * 1.5;

    // Trigger specific scene audio chime
    if (index === 2) soundEngine.playFlutePhrase();
    if (index === 3) soundEngine.playButterPop();
    if (index === 6) this.village.pushJhula();
    if (index === 8) this.particles.showerPetals();

    this.onSceneChangeCallback?.(index);
  }

  public getCurrentSceneIndex(): number {
    return this.currentSceneIndex;
  }

  public nextScene() {
    if (this.currentSceneIndex < SCENES.length - 1) {
      this.setSceneIndex(this.currentSceneIndex + 1);
    }
  }

  public prevScene() {
    if (this.currentSceneIndex > 0) {
      this.setSceneIndex(this.currentSceneIndex - 1);
    }
  }

  public triggerFlowerShower() {
    this.particles.showerPetals();
    soundEngine.playTempleBell();
    this.krishna.triggerBlessing();
  }

  public triggerBlessing() {
    this.setSceneIndex(9); // Go to blessing scene
    this.krishna.triggerBlessing();
    this.particles.showerPetals();
    soundEngine.playBlessingChime();
  }

  public toggleOrbitMode(): boolean {
    this.isOrbitMode = !this.isOrbitMode;
    if (this.isOrbitMode) {
      // Set spherical coordinate center to Krishna
      this.orbitSpherical.setFromVector3(
        this.camera.position.clone().sub(this.currentLookAt)
      );
    } else {
      // Re-align with current scene waypoint
      const wp = SCENES[this.currentSceneIndex];
      this.targetCamPos.copy(wp.camPos);
      this.targetLookAt.copy(wp.targetPos);
    }
    return this.isOrbitMode;
  }

  private handleResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const time = this.clock.getElapsedTime();

    // 1. Update 3D entities
    this.krishna.update(time);
    this.village.update(time);
    this.particles.update(time);

    // 1b. Animate celestial moonbeam shimmer and spotlight radiance
    if (this.moonBeamMesh) {
      (this.moonBeamMesh.material as THREE.MeshBasicMaterial).opacity = 0.11 + Math.sin(time * 1.5) * 0.025;
    }
    if (this.moonSpotLight) {
      this.moonSpotLight.intensity = 4.2 + Math.sin(time * 1.5) * 0.35;
    }

    // 2. Camera Motion
    if (!this.isOrbitMode) {
      // Smooth interpolation to current scene waypoint + subtle parallax
      const desiredPos = this.targetCamPos.clone().add(
        new THREE.Vector3(this.parallaxOffset.x, this.parallaxOffset.y, 0)
      );
      this.camera.position.lerp(desiredPos, 0.045);

      const desiredLookAt = this.targetLookAt.clone().add(
        new THREE.Vector3(this.parallaxOffset.x * 0.4, this.parallaxOffset.y * 0.4, 0)
      );
      this.currentLookAt.lerp(desiredLookAt, 0.05);
      this.camera.lookAt(this.currentLookAt);
    } else {
      // Orbit camera around current center
      const offset = new THREE.Vector3().setFromSpherical(this.orbitSpherical);
      this.camera.position.copy(this.currentLookAt).add(offset);
      this.camera.lookAt(this.currentLookAt);
    }

    // 3. Render
    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.resizeObserver.disconnect();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
