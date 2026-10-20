import ReconMark from './ReconMark.tsx';

export default function Brand({ subtitle, onClick, label = 'game' }: { subtitle: string; onClick: () => void; label?: string }) {
  return <button className="brand" aria-label="Recon logo" onClick={onClick}><ReconMark /><span><strong>recon <span>/ {label}</span></strong><small>{subtitle}</small></span></button>;
}
