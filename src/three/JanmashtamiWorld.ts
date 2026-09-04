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
    camPos: new THREE.Vector3(0, 8.0, 13.5),
    targetPos: new THREE.Vector3(0, 1.5, 0),
    lightWarmth: 0.35,
  },
  {
    id: 1,
    title: "Enter Gokul",
    subtitle: "The Sacred Pathway",
    quote: "Mud-plastered cottages, terracotta eaves, and earthen paths scented with rain and kadamba blossoms.",
    tagline: "Follow the stone pathway into the courtyard",
    camPos: new THREE.Vector3(-2.2, 3.5, 8.5),
    targetPos: new THREE.Vector3(-0.4, 1.4, 0.5),
    lightWarmth: 0.5,
  },
  {
    id: 2,
    title: "Little Krishna",
    subtitle: "The Enchanting Boy of Vrindavan",
    quote: "Adorned with the iridescent peacock feather and a golden bansuri whose sweet notes mesmerize the three worlds.",
    tagline: "Click Krishna to hear the melodious bansuri",
    camPos: new THREE.Vector3(0, 2.2, 3.8),
    targetPos: new THREE.Vector3(0, 1.45, 0),
    lightWarmth: 0.7,
  },
  {
    id: 3,
    title: "Makhan Chor",
    subtitle: "The Sweet Butter Heist",
    quote: "High above the floor hangs the earthen matki, brimming with churned white butter irresistible to little Kanha.",
    tagline: "Tap the Matki to wobble and steal butter!",
    camPos: new THREE.Vector3(-2.2, 2.6, 5.0),
    targetPos: new THREE.Vector3(-2.2, 2.35, 1.2),
    lightWarmth: 0.65,
  },
  {
    id: 4,
    title: "Sacred Gomati & Calf",
    subtitle: "Loving Companions of Gokul",
    quote: "With gentle eyes and tinkling bells, the sacred cows rest peacefully listening to Krishna's tune.",
    tagline: "Touch the gentle cow to offer affection",
    camPos: new THREE.Vector3(5.2, 2.5, 5.4),
    targetPos: new THREE.Vector3(3.9, 0.95, 1.8),
    lightWarmth: 0.6,
  },
  {
    id: 5,
    title: "By the Sacred Yamuna",
    subtitle: "Waters of Devotion",
    quote: "Soft moonbeams ripple across serene blue currents, carrying floating lotus blooms and glowing prayer diyas.",
    tagline: "Watch the water ripples and floating lotuses",
    camPos: new THREE.Vector3(0, 4.4, -4.6),
    targetPos: new THREE.Vector3(0, 0.2, -16.0),
    lightWarmth: 0.45,
  },
  {
    id: 6,
    title: "The Vrindavan Jhula",
    subtitle: "Cute Bal Krishna on the Swing",
    quote: "Adorned with sweet marigolds and jasmine, cute Little Kanha sways joyously in the Vrindavan evening breeze.",
    tagline: "Tap the swing or Cute Krishna to gently sway the Jhula",
    camPos: new THREE.Vector3(0, 2.6, -0.6),
    targetPos: new THREE.Vector3(0, 2.1, -4.8),
    lightWarmth: 0.8,
  },
  {
    id: 7,
    title: "Auspicious Rangoli",
    subtitle: "Floor of Festivity",
    quote: "Sacred patterns drawn in vibrant natural pigments and encircled by radiant clay lamps.",
    tagline: "Move your cursor to witness the divine glow",
    camPos: new THREE.Vector3(0, 5.0, 3.0),
    targetPos: new THREE.Vector3(0, 0.05, 0.1),
    lightWarmth: 0.8,
  },
  {
    id: 8,
    title: "Janmashtami 2026",
    subtitle: "Happy Krishna Janmashtami",
    quote: "The divine moment of celebration. May joy, righteousness, and pure love illuminate every home.",
    tagline: "Click 'Flower Shower' to shower marigold petals",
    camPos: new THREE.Vector3(0, 2.7, 5.6),
    targetPos: new THREE.Vector3(0, 1.5, 0),
    lightWarmth: 0.9,
  },
  {
    id: 9,
    title: "One Little Blessing",
    subtitle: "A Message from Kanha",
    quote: "May your life resonate with the sweetness of Krishna's flute and the boundless grace of love.",
    tagline: "Click 'Receive Blessing' for a personal gift of grace",
    camPos: new THREE.Vector3(0, 2.1, 3.0),
    targetPos: new THREE.Vector3(0, 1.7, 0.1),
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
  private moonBeamGroup: THREE.Group;
  private moonBeamMat?: THREE.ShaderMaterial;
  private moonBeamDust?: THREE.Points;
  private moonDustPositions?: Float32Array;

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
    this.scene.fog = new THREE.FogExp2(0x070b19, 0.013);

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
    this.renderer.toneMappingExposure = 1.28;
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
    // 1. Village ambient light (luminous celestial twilight for clean, clear visibility across all models)
    this.ambientLight = new THREE.AmbientLight(0x7dd3fc, 0.68);
    this.scene.add(this.ambientLight);

    const moonPos = this.village.moonPos; // Sacred Moon position in the sky (4.2, 9.8, -15)
    const krishnaTargetPos = new THREE.Vector3(0, 1.45, 0);

    // 2. Global Directional moonlight originating from the Moon
    this.dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.45);
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

    // 3. Left Village Flank Fill Light (warm saffron golden glow illuminating cottages, Matki, and left perimeter)
    const leftSideLight = new THREE.DirectionalLight(0xfef3c7, 0.95);
    leftSideLight.position.set(-16, 9, 8);
    this.scene.add(leftSideLight);

    // 4. Right Village Flank Fill Light (luminous pastoral glow illuminating Gomati cow, calf, and right cottages)
    const rightSideLight = new THREE.DirectionalLight(0xe0f2fe, 0.85);
    rightSideLight.position.set(16, 8, 7);
    this.scene.add(rightSideLight);

    // 5. Front Courtyard Fill Light (clean illumination eliminating harsh shadows on Krishna, Rangoli, and pathways)
    const frontFillLight = new THREE.DirectionalLight(0xfffbeb, 0.70);
    frontFillLight.position.set(0, 6, 12);
    this.scene.add(frontFillLight);

    // 6. Side Village Periphery Warm Point Lights (ensures village outskirts are vibrant and luminous)
    const leftVillageGlow = new THREE.PointLight(0xfbbf24, 1.3, 16);
    leftVillageGlow.position.set(-7.5, 3.2, 1.0);
    this.scene.add(leftVillageGlow);

    const rightVillageGlow = new THREE.PointLight(0xf59e0b, 1.3, 16);
    rightVillageGlow.position.set(7.5, 3.2, 1.0);
    this.scene.add(rightVillageGlow);

    // 7. Dedicated Celestial Spotlight emitted directly from the Moon onto Lord Krishna (100% soft penumbra)
    this.moonSpotLight = new THREE.SpotLight(0xdbeafe, 3.8, 45, 0.42, 1.0, 1.2);
    this.moonSpotLight.position.copy(moonPos);
    this.moonSpotLight.target = this.krishna.group;
    this.moonSpotLight.castShadow = true;
    this.moonSpotLight.shadow.mapSize.width = 1024;
    this.moonSpotLight.shadow.mapSize.height = 1024;
    this.moonSpotLight.shadow.bias = -0.0008;
    this.scene.add(this.moonSpotLight);

    // 8. Ethereal Moon Rim Light accentuating Lord Krishna's divine form with silvery-blue lunar brilliance
    this.krishnaMoonRimLight = new THREE.PointLight(0xa5f3fc, 2.6, 6.5);
    this.krishnaMoonRimLight.position.set(1.2, 2.6, -0.6);
    this.scene.add(this.krishnaMoonRimLight);

    // 5. Volumetric Ethereal Moonlight Rays cascading from the celestial Moon straight down to Lord Krishna
    // Multi-angle intersecting soft-feathered fan planes with analytical Gaussian blur
    // Completely eliminates ANY cylinder shape, sharp edges, or polygon outlines!
    const dist = moonPos.distanceTo(krishnaTargetPos);
    const dir = krishnaTargetPos.clone().sub(moonPos).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const beamCenter = moonPos.clone().lerp(krishnaTargetPos, 0.5);

    this.moonBeamGroup = new THREE.Group();
    this.moonBeamGroup.position.copy(beamCenter);
    this.moonBeamGroup.setRotationFromQuaternion(quat);

    const softRayVertexShader = `
      varying vec2 vUv;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vec3 pos = position;
        // Natural conical expansion: narrow near Moon (vUv.y=0), wider near Krishna (vUv.y=1)
        float expansion = mix(0.45, 1.45, vUv.y);
        pos.x *= expansion;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const softRayFragmentShader = `
      uniform vec3 uColor;
      uniform vec3 uCoreColor;
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPosition;

      void main() {
        // 1. Analytical Gaussian lateral blur: falls off smoothly to 0 before geometric edge
        float xDist = abs(vUv.x - 0.5) * 2.0; // 0 at center, 1 at edge
        float lateralBlur = exp(-pow(xDist * 2.6, 2.0)) * smoothstep(1.0, 0.45, xDist);

        // 2. Soft longitudinal fade: softly blooms from the moon and softly dissolves before ground
        float topFade = smoothstep(0.0, 0.22, vUv.y);
        float bottomFade = smoothstep(1.0, 0.52, vUv.y);
        float lengthFade = topFade * bottomFade;

        // 3. Multi-frequency crepuscular God-ray light shafts (celestial moonbeam streamers)
        float shaft1 = sin((vUv.x + uTime * 0.035) * 26.0) * 0.22;
        float shaft2 = cos((vUv.x - uTime * 0.02 + vUv.y * 0.35) * 15.0) * 0.18;
        float shaft3 = sin((vUv.x * 2.0 + uTime * 0.06) * 8.0) * 0.14;
        float godRays = clamp(0.72 + shaft1 + shaft2 + shaft3, 0.0, 1.35);

        // 4. Subtle shimmer pulse
        float shimmer = 0.94 + 0.06 * sin(uTime * 1.6 + vUv.y * 3.1415);

        float alpha = uOpacity * lateralBlur * lengthFade * godRays * shimmer;

        // Radiant luminous core blending to misty lunar cyan-blue
        vec3 col = mix(uColor, uCoreColor, clamp(lateralBlur * 1.3 - 0.2, 0.0, 1.0));

        gl_FragColor = vec4(col, alpha);
      }
    `;

    this.moonBeamMat = new THREE.ShaderMaterial({
      vertexShader: softRayVertexShader,
      fragmentShader: softRayFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(0x93c5fd) },
        uCoreColor: { value: new THREE.Color(0xffffff) },
        uOpacity: { value: 0.24 },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
    });

    // 8 intersecting fan planes spanning 180 degrees create a seamless, blurred volumetric ray shaft from every angle
    const rayPlaneGeo = new THREE.PlaneGeometry(5.6, dist, 1, 32);
    for (let i = 0; i < 8; i++) {
      const plane = new THREE.Mesh(rayPlaneGeo, this.moonBeamMat);
      plane.rotation.y = (i / 8) * Math.PI;
      this.moonBeamGroup.add(plane);
    }

    // Celestial moonlight dust motes slowly drifting inside the rays
    const dustCount = 36;
    const dustGeo = new THREE.BufferGeometry();
    this.moonDustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const radius = 0.3 + Math.random() * 1.8;
      const angle = Math.random() * Math.PI * 2;
      this.moonDustPositions[i * 3] = Math.cos(angle) * radius;
      this.moonDustPositions[i * 3 + 1] = (Math.random() - 0.5) * dist;
      this.moonDustPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(this.moonDustPositions, 3));

    // Canvas particle texture for smooth soft circular motes
    const moteCanvas = document.createElement('canvas');
    moteCanvas.width = 32;
    moteCanvas.height = 32;
    const moteCtx = moteCanvas.getContext('2d');
    if (moteCtx) {
      const grad = moteCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.4, 'rgba(219, 234, 254, 0.5)');
      grad.addColorStop(1, 'rgba(147, 197, 253, 0)');
      moteCtx.fillStyle = grad;
      moteCtx.beginPath();
      moteCtx.arc(16, 16, 16, 0, Math.PI * 2);
      moteCtx.fill();
    }
    const moteTex = new THREE.CanvasTexture(moteCanvas);

    const dustMat = new THREE.PointsMaterial({
      size: 0.18,
      map: moteTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.45,
    });
    this.moonBeamDust = new THREE.Points(dustGeo, dustMat);
    this.moonBeamGroup.add(this.moonBeamDust);

    this.scene.add(this.moonBeamGroup);

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

        if (
          name === 'KrishnaFlute' ||
          name === 'KrishnaFluteAltar' ||
          name === 'KrishnaFluteModel' ||
          name === 'KrishnaFluteMini' ||
          name === 'KrishnaFluteJhula' ||
          name === 'KrishnaFluteJhulaWrap' ||
          name.includes('Flute') ||
          hitObj === this.village.fluteGroup
        ) {
          soundEngine.playFlutePhrase();
          this.particles.showerPetals();
          this.onInteractionCallback?.(
            'flute',
            "The divine melody of Krishna's sacred bansuri fills Vrindavan with eternal bliss! 🎶✨"
          );
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
    this.ambientLight.color.setHex(warmth > 0.6 ? 0xfef3c7 : 0x7dd3fc);
    this.ambientLight.intensity = 0.62 + warmth * 0.22;
    this.festivePointLight.intensity = 1.3 + warmth * 1.5;

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

    // 1b. Animate celestial moonbeam shimmer, drifting dust motes, and soft spotlight
    if (this.moonBeamMat) {
      this.moonBeamMat.uniforms.uTime.value = time;
      this.moonBeamMat.uniforms.uOpacity.value = 0.24 + Math.sin(time * 1.4) * 0.035;
    }
    if (this.moonBeamDust && this.moonDustPositions) {
      const posAttr = this.moonBeamDust.geometry.attributes.position as THREE.BufferAttribute;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i);
        y -= 0.012; // slow drift downwards towards Krishna
        if (y < -9.0) y = 9.0;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
    if (this.moonSpotLight) {
      this.moonSpotLight.intensity = 3.8 + Math.sin(time * 1.5) * 0.3;
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
