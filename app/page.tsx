import {
  ArrowDown,
  ArrowUpRight,
  Anchor,
  BookOpen,
  UtensilsCrossed,
  Plus,
  Sparkles,
} from "lucide-react";
import { Chapter, Header, Hero, Seal } from "@/components/church";
import {
  Confession,
  EasterEgg,
  Gallery,
  RestMeter,
  WordOfJack,
} from "@/components/rituals";
import { jack, observances, sayings } from "@/data/church";
import { disciples } from "@/data/disciples";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#gospel">
        Skip to content
      </a>
      <Header />
      <main>
        <Hero />
        <div className="creed-strip" aria-label="The founding principles">
          <span>REST IS THE DOCTRINE</span>
          <span>✦</span>
          <span>REPETITION IS THE RITUAL</span>
          <span>✦</span>
          <span>CONFUSION IS THE TRADITION</span>
        </div>
        <section id="gospel" className="paper section gospel">
          <div className="container gospel-layout">
            <div>
              <Chapter number="01">THE GOSPEL OF JACK</Chapter>
              <h2>
                In the beginning,
                <br />
                there was <em>enough.</em>
              </h2>
              <p className="body-copy">
                Welcome to an institution devoted to the ordinary wisdom of{" "}
                {jack.name}. Born of friendship, sustained by repetition, and
                administered with wholly unnecessary solemnity.
              </p>
              <p className="body-copy">
                He is from Trinidad and Tobago. He lives in Tempe, Arizona. He
                loves his job a little too much. To the Church, this is more
                than sufficient material for a canon.
              </p>
              <a className="underlined-link" href="#sayings">
                Explore the sayings <ArrowDown size={16} />
              </a>
            </div>
            <article className="manuscript">
              <div className="manuscript-top">
                <BookOpen size={20} />
                <span>THE BOOK OF REST</span>
                <span>I : I</span>
              </div>
              <span className="manuscript-cross" aria-hidden="true">
                ✦
              </span>
              <blockquote>
                “Look to
                <br />
                <em>rest yourself.</em>”
              </blockquote>
              <div className="ornament" aria-hidden="true">
                <span />✦<span />
              </div>
              <p>
                Let mankind’s endless pursuit of productivity eventually give
                way to sitting down.
              </p>
              <footer>
                JACK 1:1 <span>·</span> THE FOUNDATIONAL DOCTRINE
              </footer>
              <span className="page-corner" />
            </article>
          </div>
        </section>
        <section id="sayings" className="section sayings">
          <div className="container">
            <div className="section-heading">
              <div>
                <Chapter number="02">THE {sayings.length} SAYINGS</Chapter>
                <h2>
                  A small canon.
                  <br />
                  <em>An infinite discussion.</em>
                </h2>
              </div>
              <p>
                Every word preserved.
                <br />
                Every interpretation wildly overqualified.
              </p>
            </div>
            <div className="sayings-grid">
              {sayings.map((s, i) => (
                <article className={`saying saying-${i}`} key={s.numeral}>
                  <div className="saying-top">
                    <span>{s.numeral}</span>
                    <span>JACK 1:{i + 1}</span>
                  </div>
                  <div className="saying-body">
                    <span className="eyebrow">{s.title}</span>
                    <blockquote lang={i === 1 ? "fr" : undefined}>
                      “{s.quote}”
                    </blockquote>
                    <p>{s.interpretations[0]}</p>
                  </div>
                  <div className="saying-bottom">
                    <span>THE DOCTRINE OF {s.theme.toUpperCase()}</span>
                    <Plus size={15} />
                  </div>
                </article>
              ))}
            </div>
            <WordOfJack />
          </div>
        </section>
        <section id="doctrine" className="section paradox-section">
          <div className="container">
            <div className="paradox-layout">
              <div className="paradox-art">
                <div className="paradox-orbit orbit-one" />
                <div className="paradox-orbit orbit-two" />
                <div className="paradox-symbol">
                  <UtensilsCrossed size={44} strokeWidth={1} />
                  <span>FEAST</span>
                  <div className="paradox-axis" />
                  <span>REST</span>
                  <span className="what-symbol">?</span>
                </div>
                <span className="diagram-label">
                  FIG. I — THE CIRCLE OF LUNCH
                </span>
              </div>
              <div>
                <Chapter number="03">THE GOSPEL OF SECOND HELPINGS</Chapter>
                <h2>
                  Eat.
                  <br />
                  Rest.
                  <br />
                  <em>Repeat.</em>
                </h2>
                <p className="body-copy">
                  The Church recognizes three essential food groups:
                  the first plate, the second plate, and a little something for later.
                </p>
                <div className="paradox-note">
                  <span className="eyebrow">THE DESSERT EXCEPTION</span>
                  <p>
                    Being full is a temporary opinion. The dessert menu is new evidence.
                  </p>
                </div>
              </div>
            </div>
            <div className="stress-footnote">
              <span className="eyebrow">AN ADDENDUM ON INNER PEACE</span>
              <p>
                He preaches rest.
                <br />
                Work keeps filing an objection.
              </p>
              <span>The matter is adjourned for lunch.</span>
            </div>
          </div>
        </section>
        <section id="shipping" className="paper section contracts">
          <div className="container">
            <div className="section-heading">
              <div>
                <Chapter number="04">THE MARITIME DOCTRINE</Chapter>
                <h2>
                  In the beginning
                  <br />
                  was <em>the Contract.</em>
                </h2>
              </div>
              <div className="job-label">
                <Anchor size={24} />
                <span>
                  {jack.name}
                  <strong>{jack.job}</strong>
                  <small>The Book of Clauses.</small>
                </span>
              </div>
            </div>
            <div className="contract-layout">
              <div>
                <p className="body-copy">
                  Jack’s devotion to work is matched only by his stress about
                  it. Naturally, the Church has elevated paperwork to a
                  spiritual practice.
                </p>
                <div className="clause-list">
                  {[
                    ["01", "The clause", "Scripture, with subparagraphs."],
                    [
                      "02",
                      "The amendment",
                      "A revelation. Please refer to the latest version.",
                    ],
                    [
                      "03",
                      "The signature",
                      "The ritual is incomplete without it.",
                    ],
                  ].map(([n, title, copy]) => (
                    <div key={n}>
                      <span>{n}</span>
                      <h3>{title}</h3>
                      <p>{copy}</p>
                    </div>
                  ))}
                </div>
                <div className="shipping-mark">
                  <div className="container-lines" aria-hidden="true" />
                  <span>
                    SACRED CARGO
                    <br />
                    HANDLE WITH EXCESSIVE SERIOUSNESS
                  </span>
                </div>
              </div>
              <Confession />
            </div>
          </div>
        </section>
        <section id="tempe" className="section tempe">
          <div className="container">
            <div className="section-heading">
              <div>
                <Chapter number="05">THE TEMPE EXILE</Chapter>
                <h2>
                  An ocean apart.
                  <br />
                  <em>Still asking, “What.”</em>
                </h2>
              </div>
              <p>
                While the disciples remain in Trinidad,
                <br />
                the Jack dwells in Tempe, Arizona.
              </p>
            </div>
            <div className="route-diagram">
              <div className="route-origin">
                <span className="route-pin trinidad-pin" />
                <span className="eyebrow">THE DISCIPLES</span>
                <h3>
                  Trinidad
                  <br />& Tobago
                </h3>
                <p>Those who remained behind.</p>
              </div>
              <div className="route-line" aria-hidden="true">
                <span className="route-endpoint" />
                <span className="route-dash" />
                <Anchor size={22} />
                <span className="route-dash" />
                <span className="route-endpoint" />
              </div>
              <div className="route-destination">
                <span className="desert-sun" aria-hidden="true" />
                <span className="eyebrow">HIS RESTFULNESS</span>
                <h3>
                  Tempe,
                  <br />
                  Arizona
                </h3>
                <p>Same Jack. Different landscape.</p>
              </div>
              <span className="route-caption">
                FROM THE DISCIPLES TO HIS RESTFULNESS
              </span>
            </div>
            <div id="disciples" className="disciples">
              <div>
                <Chapter number="06">THE DISCIPLES OF TRINIDAD</Chapter>
                <h3>
                  The faithful.
                  <br />
                  <em>The geographically inconvenient.</em>
                </h3>
              </div>
              <div>
                <p>
                  Friends back in Trinidad and Tobago, united by a shared
                  familiarity with the man behind the doctrine.
                </p>
                {disciples.length ? (
                  <div className="disciple-list">
                    {disciples.map((person) => (
                      <article key={person.name}>
                        {person.image && (
                          <img
                            src={person.image}
                            alt={person.name}
                            width={80}
                            height={80}
                            loading="lazy"
                          />
                        )}
                        <h4>{person.name}</h4>
                        {person.churchTitle && <p>{person.churchTitle}</p>}
                        {person.rank && <small>{person.rank}</small>}
                        {person.quote && (
                          <blockquote>“{person.quote}”</blockquote>
                        )}
                        {person.description && <p>{person.description}</p>}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="registry-note">
                    <span>✦</span>
                    <p>
                      <strong>The register remains uninscribed.</strong>
                      <br />
                      Names will be entered when the disciples are revealed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <section id="anime" className="manga-section">
          <div className="container manga-layout">
            <div className="manga-panel" aria-hidden="true">
              <span className="manga-panel-label">
                THE ILLUSTRATED SCRIPTURES
              </span>
              <div className="manga-speedlines" />
              <span className="manga-what">
                WHAT<span>.</span>
              </span>
              <span className="manga-caption">ONE WORD. AN ENTIRE ARC.</span>
            </div>
            <div>
              <Chapter number="07">THE ILLUSTRATED SCRIPTURES</Chapter>
              <h2>
                Some texts
                <br />
                come with <em>panels.</em>
              </h2>
              <p className="body-copy">
                Jack loves anime and manga, including <i>Chainsaw Man</i>. The
                Church respectfully recognizes that some reading material is
                more compelling than a contract.
              </p>
              <p className="body-copy">
                Whether this conflicts with the Maritime Doctrine has been
                referred to the Committee on Illustrated Doctrine.
              </p>
              <div className="manga-tags">
                <span>ANIME</span>
                <span>MANGA</span>
                <span>CHAINSAW MAN</span>
              </div>
            </div>
          </div>
        </section>
        <section id="archives" className="section archives">
          <div className="container">
            <div className="section-heading">
              <div>
                <Chapter number="08">THE SACRED ARCHIVES</Chapter>
                <h2>
                  Behold <em>the Jack.</em>
                </h2>
              </div>
              <p>
                Images preserved in the sacred archives.
                <br />
                Artistic reverence. Questionable restraint.
              </p>
            </div>
            <Gallery />
          </div>
        </section>
        <section id="rest" className="section paper rest-section">
          <div className="container rest-layout">
            <div>
              <Chapter number="09">THE PRACTICE OF REST</Chapter>
              <h2>
                How rested
                <br />
                is <em>thy soul?</em>
              </h2>
              <p className="body-copy">
                Close the inbox. Finish the snack. Sit down with the authority
                of someone whose calendar says unavailable.
              </p>
              <p className="body-copy">
                Move the Restfulness Index to discover your current standing
                with the Church.
              </p>
              <div className="rest-seal">
                <Seal />
                <span>
                  NO CONTRACT REQUIRED.
                  <br />
                  NO REPLY EXPECTED.
                  <br />
                  JUST REST.
                </span>
              </div>
            </div>
            <RestMeter />
          </div>
        </section>
        <section id="calendar" className="section calendar">
          <div className="container">
            <div className="section-heading">
              <div>
                <Chapter number="10">THE JACKIAN CALENDAR</Chapter>
                <h2>
                  No dates.
                  <br />
                  <em>Only occasions.</em>
                </h2>
              </div>
              <p>
                The sacred observances happen
                <br />
                whenever the situation calls for them.
              </p>
            </div>
            <div className="observances">
              {observances.map((item) => (
                <article key={item.numeral}>
                  <span className="observance-number">{item.numeral}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.when}</p>
                  </div>
                  <p>{item.note}</p>
                  <Sparkles size={22} strokeWidth={1} />
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="closing">
          <div className="container">
            <span className="eyebrow">
              YOU HAVE REACHED THE END OF THE REVELATION
            </span>
            <h2>
              Look to <em>rest yourself.</em>
            </h2>
            <a href="#home" className="underlined-link">
              Return to the beginning <ArrowUpRight size={17} />
            </a>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <a className="brand" href="#home">
              <Seal small />
              <span>
                THE CHURCH<span>OF JACK</span>
              </span>
            </a>
            <nav aria-label="Footer navigation">
              <a href="#gospel">The Gospel</a>
              <a href="#shipping">The Contract</a>
              <a href="#tempe">Tempe</a>
              <a href="#anime">Anime</a>
              <a href="#rest">Receive Rest</a>
            </nav>
          </div>
          <div className="footer-bottom">
            <p>Look to rest yourself. Rock Back Heavy.</p>
            <span>
              Made with affection. And far too much ceremony.
            </span>
          </div>
        </div>
      </footer>
      <EasterEgg />
    </>
  );
}
