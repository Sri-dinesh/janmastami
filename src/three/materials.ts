import * as THREE from 'three';

export const COLORS = {
  krishnaSkin: 0x4794e6,
  krishnaHair: 0x18181b,
  dhotiYellow: 0xf59e0b,
  sashSaffron: 0xea580c,
  gold: 0xfbbf24,
  peacockTeal: 0x0d9488,
  peacockBlue: 0x1d4ed8,
  peacockPurple: 0x581c87,
  mudWall: 0xb46b38,
  mudWallDark: 0x8c4b20,
  clayRoof: 0x9a3412,
  wood: 0x663311,
  butterCream: 0xfffbeb,
  cowWhite: 0xf8fafc,
  cowMuzzle: 0xfbcfe8,
  cowHorns: 0x475569,
  grassGreen: 0x1e3a1e,
  treeGreen: 0x166534,
  yamunaWater: 0x0284c7,
  lotusPink: 0xf472b6,
  marigoldOrange: 0xf97316,
  marigoldYellow: 0xfacc15,
  diyaClay: 0x9a3412,
  diyaFlame: 0xffa500,
  moonGlow: 0xfff7ed,
  nightSky: 0x070b19,
};

export const createStandardMaterials = () => {
  return {
    krishnaSkin: new THREE.MeshStandardMaterial({
      color: COLORS.krishnaSkin,
      roughness: 0.45,
      metalness: 0.05,
    }),
    krishnaHair: new THREE.MeshStandardMaterial({
      color: COLORS.krishnaHair,
      roughness: 0.8,
    }),
    dhoti: new THREE.MeshStandardMaterial({
      color: COLORS.dhotiYellow,
      roughness: 0.5,
    }),
    sash: new THREE.MeshStandardMaterial({
      color: COLORS.sashSaffron,
      roughness: 0.6,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      roughness: 0.25,
      metalness: 0.85,
    }),
    peacockTeal: new THREE.MeshStandardMaterial({
      color: COLORS.peacockTeal,
      roughness: 0.35,
      metalness: 0.2,
    }),
    peacockBlue: new THREE.MeshStandardMaterial({
      color: COLORS.peacockBlue,
      roughness: 0.4,
    }),
    mudWall: new THREE.MeshStandardMaterial({
      color: COLORS.mudWall,
      roughness: 0.9,
    }),
    clayRoof: new THREE.MeshStandardMaterial({
      color: COLORS.clayRoof,
      roughness: 0.85,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: COLORS.wood,
      roughness: 0.8,
    }),
    butter: new THREE.MeshStandardMaterial({
      color: COLORS.butterCream,
      roughness: 0.3,
    }),
    cowWhite: new THREE.MeshStandardMaterial({
      color: COLORS.cowWhite,
      roughness: 0.6,
    }),
    cowMuzzle: new THREE.MeshStandardMaterial({
      color: COLORS.cowMuzzle,
      roughness: 0.7,
    }),
    cowHorns: new THREE.MeshStandardMaterial({
      color: COLORS.cowHorns,
      roughness: 0.5,
      metalness: 0.2,
    }),
    grass: new THREE.MeshStandardMaterial({
      color: COLORS.grassGreen,
      roughness: 0.9,
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: COLORS.treeGreen,
      roughness: 0.8,
    }),
    marigoldOrange: new THREE.MeshStandardMaterial({
      color: COLORS.marigoldOrange,
      roughness: 0.6,
    }),
    marigoldYellow: new THREE.MeshStandardMaterial({
      color: COLORS.marigoldYellow,
      roughness: 0.6,
    }),
    lotusPink: new THREE.MeshStandardMaterial({
      color: COLORS.lotusPink,
      roughness: 0.5,
    }),
    diyaFlame: new THREE.MeshBasicMaterial({
      color: 0xffedd5,
    }),
    diyaGlow: new THREE.MeshBasicMaterial({
      color: 0xff9900,
      transparent: true,
      opacity: 0.4,
    }),
    diyaClay: new THREE.MeshStandardMaterial({
      color: COLORS.diyaClay,
      roughness: 0.85,
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.06,
      metalness: 0.22,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    }),
    terracotta: new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.72,
      metalness: 0.05,
    }),
    jute: new THREE.MeshStandardMaterial({
      color: 0xc8965a,
      roughness: 0.92,
      metalness: 0.05,
    }),
    brassGold: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25,
    }),
    sandstone: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.88,
      metalness: 0.02,
    }),
  };
};
