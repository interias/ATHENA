import Image from "next/image";
import { Curriculum } from "../components/Curriculum";
import { SiteHeader } from "../components/SiteHeader";

export default function Home() {
  return (
    <main>
      <SiteHeader current="home" />

      <section className="home-intro" aria-labelledby="hero-title">
        <div className="home-intro-copy">
          <p className="eyebrow">Willkommen in deiner Bibliothek</p>
          <h1 id="hero-title">Training verstehen. Klarer beobachten.</h1>
          <p>
            Ein persönlicher Lernort für Sportwissenschaft – mit nachvollziehbaren
            Quellen, ehrlichen Grenzen und Raum für die eigene Erklärung.
          </p>
        </div>
        <div className="home-banner">
          <Image src="/images/scene-pompeii.png" alt="" fill priority sizes="(max-width: 1120px) calc(100vw - 32px), 1080px" unoptimized />
        </div>
      </section>

      <section className="home-library" id="inhalt" aria-labelledby="curriculum-title">
        <div className="section-intro">
          <p className="eyebrow">Dein Lernpfad</p>
          <h2 id="curriculum-title">Kapitelübersicht</h2>
          <p>Die veröffentlichten Lektionen kannst du frei öffnen. Weitere Einheiten folgen.</p>
        </div>
        <Curriculum />
      </section>

      <footer>
        <p>Recherchegestütztes Lernstudio · keine persönliche Trainingsplanung</p>
      </footer>
    </main>
  );
}
