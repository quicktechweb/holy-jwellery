/** Shell (sidebar/topbar) thake, shudhu content area te skeleton dekhay - spinner e puro page dhaka porbe na */
const bar = 'animate-pulse rounded-lg bg-[#ebe8f1]';

export default function Loading() {
  return (
    <div className="py-6" role="status" aria-label="Loading">
      <div className={`${bar} h-8 w-56`} />
      <div className={`${bar} mt-2 h-4 w-80 max-w-full`} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="border-ed-line h-[104px] rounded-xl border bg-white p-4"><div className={`${bar} h-3 w-24`} /><div className={`${bar} mt-4 h-7 w-20`} /></div>)}
      </div>
      <div className="border-ed-line mt-5 rounded-xl border bg-white p-4">
        <div className={`${bar} h-10 w-full max-w-[320px]`} />
        <div className="mt-4 space-y-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className={`${bar} h-11 w-full`} />)}</div>
      </div>
    </div>
  );
}
