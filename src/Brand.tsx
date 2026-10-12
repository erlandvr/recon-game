import ReconMark from './ReconMark.tsx';

export default function Brand({ subtitle, onClick }: { subtitle: string; onClick: () => void }) {
  return <button className="brand" aria-label="Recon logo" onClick={onClick}><ReconMark /><span><strong>recon <span>/ game</span></strong><small>{subtitle}</small></span></button>;
}
