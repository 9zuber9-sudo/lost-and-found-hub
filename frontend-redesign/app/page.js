import Link from "next/link";
import Hero from "../components/Hero";
import CategoryMarquee from "../components/CategoryMarquee";
import Reveal from "../components/Reveal";
import Stats from "../components/Stats";
import LatestItems from "../components/LatestItems";

const STEPS = [
  { emoji: "📸", title: "1. Post it", text: "Add a photo, where and when. Found something? Add a secret detail only the real owner would know." },
  { emoji: "🔍", title: "2. Search and match", text: "Filter by type, category and status to spot your item in seconds." },
  { emoji: "🤝", title: "3. Return it", text: "Contact the poster, meet up safely, then mark the item as returned." },
];

// Home page = Hero + categories strip + how it works + stats + latest items + call to action
export default function Home() {
  return (
    <>
      <Hero />
      <CategoryMarquee />

      <section id="how" className="lf-section">
        <Reveal>
          <div className="lf-eyebrow">How it works</div>
          <h2 className="lf-h2">Three steps. That’s all.</h2>
          <p className="lf-sub">Built for phones, because that’s where students already are.</p>
        </Reveal>
        <div className="lf-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="lf-card" style={{ height: "100%" }}>
                <div className="lf-num" aria-hidden="true">{s.emoji}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal y={16}><div style={{ marginTop: 28 }}><Stats /></div></Reveal>
      </section>

      <section id="latest" className="lf-section">
        <LatestItems />
      </section>

      <Reveal>
        <div className="lf-band" style={{ margin: "0 20px" }}>
          <h2>Your lost item is someone’s “found” post.</h2>
          <p>Join your campus and help a classmate get something important back.</p>
          <Link href="/items/new" className="lf-btn">Post an item →</Link>
        </div>
      </Reveal>

      <footer className="lf-footer">Made with care for TechSpace BuildLab ’26</footer>
    </>
  );
}
