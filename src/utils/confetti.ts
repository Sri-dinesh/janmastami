import confetti from 'canvas-confetti';

/**
 * Fires vibrant festive flower petal confetti across the screen
 * with marigold saffron, golden yellow, lotus rose pink, and jasmine white tones.
 */
export function firePetalConfetti() {
  const colors = ['#f59e0b', '#fbbf24', '#f43f5e', '#ec4899', '#fb7185', '#ffffff', '#eab308'];

  // Left cannon launch
  confetti({
    particleCount: 35,
    angle: 60,
    spread: 55,
    origin: { x: 0.05, y: 0.75 },
    colors,
    gravity: 0.75,
    scalar: 1.1,
    ticks: 240,
  });

  // Right cannon launch
  confetti({
    particleCount: 35,
    angle: 120,
    spread: 55,
    origin: { x: 0.95, y: 0.75 },
    colors,
    gravity: 0.75,
    scalar: 1.1,
    ticks: 240,
  });

  // Center graceful flower cascade
  confetti({
    particleCount: 50,
    spread: 80,
    origin: { x: 0.5, y: 0.45 },
    colors,
    gravity: 0.65,
    scalar: 1.25,
    ticks: 260,
    drift: 0.05,
  });
}
