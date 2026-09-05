/**
 * The landing hero.
 *
 * The claim this product has to land is a difference between two things, so the hero shows the
 * difference rather than describing it: the same sentence of real government prose on the left as it
 * arrives, and on the right as ReadEasy leaves it. Both halves are excerpts of actual IRS EITC
 * eligibility copy — the left is verbatim, the right is what the product's own plain-language pass
 * produces from it.
 *
 * Set as one editorial page rather than a column of boxes: headline, standfirst, then the comparison
 * as two columns of different paper divided by a rule. The rule is doing the work a card border used
 * to do, which leaves the type free to carry the emphasis.
 *
 * A reader who leaves after one viewport should be able to describe this comparison an hour later.
 */

/** The turn from one column to the other, drawn rather than typed as a glyph. */
function TurnArrow() {
  return (
    <svg className="proof-turn" viewBox="0 0 40 24" aria-hidden="true" focusable="false">
      <path
        d="M2 12h32M26 4l8 8-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const AFFORDANCES = [
  "Plain language, never invented facts",
  "Focus, Dyslexia, Action, Listen and ADHD views",
  "Your text size, spacing and theme, remembered"
];

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading">The web, made readable for every reader.</h1>
      <p className="hero-lede">
        Paste a page link, or the page text itself. ReadEasy clears away the clutter and rewrites what is
        left in plain language, with deadlines pulled out into a simple checklist.
      </p>

      <ul className="hero-affordances">
        {AFFORDANCES.map((affordance) => (
          <li key={affordance}>{affordance}</li>
        ))}
      </ul>

      <figure className="proof">
        <figcaption className="proof-caption">One sentence, from a real tax page</figcaption>

        <div className="proof-pair">
          <div className="proof-side proof-before">
            <p className="proof-label">As published</p>
            <p className="proof-text">
              You were legally separated according to your state law under a written separation agreement or
              a decree of separate maintenance and you didn&rsquo;t live in the same household as your spouse
              at the end of the tax year.
            </p>
            <p className="proof-meta">Graduate reading level</p>
          </div>

          <TurnArrow />

          <div className="proof-side proof-after">
            <p className="proof-label">In ReadEasy</p>
            <p className="proof-text">
              You count as separated if a court or a written agreement says so, and you did not live with
              your spouse at the end of the year.
            </p>
            <p className="proof-meta">Grade 6 reading level</p>
          </div>
        </div>
      </figure>
    </section>
  );
}
