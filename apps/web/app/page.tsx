import { Curriculum } from "../components/Curriculum";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#inhalt" aria-label="ATHENA Startseite">
          <span className="wordmark-mark" aria-hidden="true">A</span>
          <span>
            <strong>ATHENA</strong>
            <small>Persönliches Lernstudio</small>
          </span>
        </a>
        <span className="local-badge">Lokal · ohne Anmeldung</span>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Willkommen in deiner Bibliothek</p>
          <h1 id="hero-title">Training verstehen. Klarer beobachten.</h1>
          <p>
            Ein persönlicher Lernort für Sportwissenschaft – mit nachvollziehbaren
            Quellen, ehrlichen Grenzen und Raum für die eigene Erklärung.
          </p>
          <a className="hero-link" href="#inhalt">Zum Kapitel</a>
        </div>
        <div className="domus-stage" aria-hidden="true">
          <span className="sun" />
          <span className="arch arch-left" />
          <span className="arch arch-center" />
          <span className="arch arch-right" />
          <span className="floor-line floor-line-one" />
          <span className="floor-line floor-line-two" />
          <span className="laurel">✦</span>
        </div>
      </section>

      <section className="reader" id="inhalt" aria-labelledby="curriculum-title">
        <div className="section-intro">
          <p className="eyebrow">Dein Lernpfad</p>
          <h2 id="curriculum-title">Kapitelübersicht</h2>
          <p>Die erste Lektion ist verfügbar. Weitere Lektionen sind geplant.</p>
          <aside className="development-note">
            Der Lesebereich ist noch in Vorbereitung. Deshalb führt diese Übersicht noch nicht auf eine leere Lektionsseite.
          </aside>
        </div>
        <Curriculum />
      </section>

      <footer>
        <p>Recherchegestütztes Lernstudio · keine persönliche Trainingsplanung</p>
      </footer>
    </main>
  );
}
