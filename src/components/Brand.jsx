import { ShieldCheck } from "lucide-react";

export default function Brand({ compact = false }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="/login" aria-label="DonaChain beranda">
      <span className="brand__mark"><ShieldCheck size={18} strokeWidth={2.5} /></span>
      <span>DonaChain</span>
    </a>
  );
}