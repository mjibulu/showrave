import type { ReactNode } from 'react';
import type { CoverId } from '../state/types';

export function BrowserFrame({ url, children, className = '' }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={`browser ${className}`}>
      <div className="browser-bar" aria-hidden="true">
        <span className="browser-dots"><i /><i /><i /></span>
        <span className="browser-url">{url}</span>
      </div>
      <div className="browser-body">{children}</div>
    </div>
  );
}

export function PhoneFrame({ children, className = '', dark = false }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={`phone ${dark ? 'phone--dark' : ''} ${className}`}>
      <div className="phone-status" aria-hidden="true">
        <span>9:41</span>
        <span className="phone-notch" />
        <span>5G</span>
      </div>
      <div className="phone-body">{children}</div>
    </div>
  );
}

export const COVERS: { id: CoverId; label: string }[] = [
  { id: 'neon', label: 'Neon' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'gold', label: 'Gold' },
];

export function Cover({ cover, children, className = '' }: { cover: CoverId; children?: ReactNode; className?: string }) {
  return (
    <div className={`cover cover--${cover} ${className}`}>
      <svg className="cover-art" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="330" cy="40" r="120" className="cover-orb cover-orb--a" />
        <circle cx="60" cy="230" r="140" className="cover-orb cover-orb--b" />
        <g className="cover-lines">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M-20 ${200 - i * 18} Q 200 ${120 - i * 22} 420 ${190 - i * 16}`} />
          ))}
        </g>
      </svg>
      {children && <div className="cover-content">{children}</div>}
    </div>
  );
}
