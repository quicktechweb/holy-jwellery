export function GlowBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'radial-gradient(60% 45% at 50% 0%, rgba(120,30,140,0.28), transparent 70%),' +
          'radial-gradient(40% 40% at 8% 100%, rgba(120,30,140,0.25), transparent 70%),' +
          'radial-gradient(35% 35% at 95% 15%, rgba(236,42,139,0.14), transparent 70%)',
      }}
    />
  );
}
