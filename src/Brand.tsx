export default function Brand({ subtitle, onClick }: { subtitle: string; onClick: () => void }) {
  return <button className="brand" aria-label="Recon logo" onClick={onClick}><span className="brand-mark" aria-hidden="true">r.</span><span><strong>recon <span>/ game</span></strong><small>{subtitle}</small></span></button>;
}
