import Link from "next/link";

export const AppLogo = () => {
  return (
    <Link
      href="/"
      aria-label="Codex 홈으로 이동"
      className="group inline-flex items-center gap-3"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-black uppercase tracking-tight text-primary-foreground shadow-sm transition group-hover:scale-105">
        CX
      </div>
    </Link>
  );
};
