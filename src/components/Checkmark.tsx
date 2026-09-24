export function Checkmark() {
  return (
    <svg className="check-wrap" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--brand-glow)" />
        </linearGradient>
      </defs>
      <circle className="check-circle" cx="50" cy="50" r="45" fill="none" stroke="url(#g1)" strokeWidth="5" strokeLinecap="round" />
      <path className="check-mark" d="M30 52 L45 67 L72 38" fill="none" stroke="url(#g1)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
