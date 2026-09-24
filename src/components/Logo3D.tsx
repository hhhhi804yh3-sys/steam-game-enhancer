type Props = { size?: number; className?: string };

export function Logo3D({ size = 200, className = "" }: Props) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/cysaw-fox.png"
        alt="Cysaw fox logo"
        width={size}
        height={size}
        className="fox-mark select-none drop-shadow-[0_0_25px_rgba(157,190,249,0.35)] transition duration-300 hover:scale-105"
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    </div>
  );
}

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/cysaw-fox.png"
      alt="Cysaw"
      width={size}
      height={size}
      className={`select-none drop-shadow-[0_0_10px_rgba(157,190,249,0.3)] ${className}`}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
