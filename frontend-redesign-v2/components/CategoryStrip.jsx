import Link from "next/link";
import Reveal from "./Reveal";
import { CATEGORIES } from "../lib/categories";

// Quick links: each one opens /items already filtered by that category
export default function CategoryStrip() {
  return (
    <section className="lf-section" style={{ paddingBlock: 24 }}>
      <Reveal>
        <p className="lf-hand" style={{ margin: 0 }}>looking for something specific?</p>
        <div className="lf-cats">
          {CATEGORIES.map((c) => (
            <Link key={c.name} href={`/items?category=${encodeURIComponent(c.name)}`} className="lf-cat">
              {c.name}
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
