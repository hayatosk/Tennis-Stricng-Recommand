// Shared UI primitives for the String Logbook pages

export const PAGE_SHELL = 'min-h-screen bg-[#0d0d0d] text-white';
export const CONTENT_WRAP = 'max-w-2xl mx-auto px-4 py-10';
export const CARD_CLS = 'rounded-2xl bg-white/5 border border-white/10';
export const BACK_LINK_CLS = 'text-sm text-white/40 hover:text-white/70 transition-colors';
export const EYEBROW_CLS = 'text-xs text-emerald-400 tracking-widest uppercase mb-1';

export function SectionCard({ title, children }) {
  return (
    <div className={`${CARD_CLS} p-5 mb-4`}>
      <div className="text-xs text-white/30 tracking-widest uppercase mb-3">{title}</div>
      {children}
    </div>
  );
}

export function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  );
}
