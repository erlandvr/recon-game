export default function SpeedControl({ speed, onToggle }: { speed: 1 | 2; onToggle: () => void }) {
  return <button className="speed-control" aria-label="Double speed" aria-pressed={speed === 2} title={`Switch to ${speed === 1 ? 'double' : 'normal'} speed. All game timers and income scale together.`} onClick={onToggle}>{speed}×</button>;
}
