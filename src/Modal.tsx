import {useEffect,useRef,type ReactNode} from 'react';
export default function Modal({ title, children, onDismiss, className = '' }: { title: string; children: ReactNode; onDismiss: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; const previous = document.activeElement as HTMLElement | null; dialog.showModal(); return () => { dialog.close(); previous?.focus(); }; }, []);
  return <dialog ref={ref} className={`modal ${className}`} aria-label={title} onCancel={e => { e.preventDefault(); onDismiss(); }} onKeyDown={e => {
    if (e.key !== 'Tab') return;
    const controls = Array.from(ref.current!.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')).filter(el => el.getClientRects().length > 0);
    const first = controls[0]; const last = controls[controls.length - 1];
    if (first && (e.shiftKey ? document.activeElement === first : document.activeElement === last)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
  }}><h2>{title}</h2>{children}</dialog>;
}

