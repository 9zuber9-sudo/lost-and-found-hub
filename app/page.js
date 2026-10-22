import Link from "next/link";
import Hero from "../components/Hero";
import CategoryStrip from "../components/CategoryStrip";
import Reveal from "../components/Reveal";
import LatestItems from "../components/LatestItems";

// Written in plain, friendly words on purpose
const STEPS = [
  { n: "1", title: "Post it", text: "Add a photo and say where and when. If you found something, keep one detail secret so only the real owner can claim it." },
  { n: "2", title: "Look around", text: "Search, or filter by lost / found and by category. Maybe someone already posted your thing." },
  { n: "3", title: "Get it back", text: "Message the poster, meet somewhere public on campus, then mark the post as returned." },
];

// Home page = Hero + categories + how it works + latest items + call to action
export default function Home() {
  return (
    <>
      <Hero />
      <CategoryStrip />

      <section id="how" className="lf-section">
        <Reveal>
          <p className="lf-hand" style={{ margin: 0 }}>how it works</p>
          <h2 className="lf-h2">Pretty simple, honestly.</h2>
        </Reveal>
        <div className="lf-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="lf-step">
                <span className="lf-step-num" aria-hidden="true">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="latest" className="lf-section">
        <LatestItems />
      </section>

      <section className="lf-section lf-cta-section">
        <Reveal>
          <div className="lf-band">
            <h2>Found something just now?</h2>
            <p>Put it on the board before you forget. It only takes about a minute.</p>
            <Link href="/items/new?type=found" className="lf-btn">Post it</Link>
          </div>
        </Reveal>
      </section>

      <footer className="lf-footer">
        <span className="lf-footer-note">made by Zuber, for students</span>
        <br />
        TechSpace BuildLab ’26
      </footer>
    </>
  );
}
