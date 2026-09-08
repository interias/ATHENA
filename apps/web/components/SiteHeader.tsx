import Link from "next/link";

export function SiteHeader({ current }: { current: "home" | "lesson" }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="wordmark" href="/" aria-label="ATHENA Kapitelübersicht">
          <span className="wordmark-mark" aria-hidden="true">A</span>
          <span className="wordmark-copy">
            <strong>ATHENA</strong>
            <small>Persönliches Lernstudio</small>
          </span>
        </Link>
        <nav className="site-navigation" aria-label="Hauptnavigation">
          <Link href="/" aria-current={current === "home" ? "page" : undefined}>Kapitelübersicht</Link>
          <span className="local-badge">Lokal · ohne Anmeldung</span>
        </nav>
      </div>
    </header>
  );
}
