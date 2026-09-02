/**
 * The landing hero.
 *
 * The claim this product has to land is a difference between two things, so the hero shows the
 * difference rather than describing it: the same sentence of real government prose on the left as it
 * arrives, and on the right as ReadEasy leaves it. Both halves are excerpts of actual IRS EITC
 * eligibility copy — the left is verbatim, the right is what the product's own plain-language pass
 * produces from it.
 *
 * A reader who leaves after one viewport should be able to describe this comparison an hour later.
 */
export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <h1 id="hero-heading">The web, made readable for every reader.</h1>
        <p className="hero-lede">
          Paste a page link, or the page text itself. ReadEasy clears away the clutter and rewrites what is
          left in plain language, with deadlines pulled out into a simple checklist.
        </p>
        <ul className="hero-affordances">
          <li>Plain language, never invented facts</li>
          <li>Focus, Dyslexia, Action, Listen and ADHD views</li>
          <li>Your text size, spacing and theme, remembered</li>
        </ul>
      </div>

      <figure className="hero-proof">
        <div className="proof-pane proof-before">
          <p className="proof-label">A real tax page</p>
          <p className="proof-text">
            You were legally separated according to your state law under a written separation agreement or a
            decree of separate maintenance and you didn&rsquo;t live in the same household as your spouse at
            the end of the tax year.
          </p>
          <p className="proof-meta">Graduate reading level</p>
        </div>

        <div className="proof-pane proof-after">
          <p className="proof-label">The same page, in ReadEasy</p>
          <p className="proof-text">
            You count as separated if a court or a written agreement says so, and you did not live with your
            spouse at the end of the year.
          </p>
          <p className="proof-meta">Grade 6 reading level</p>
        </div>
      </figure>
    </section>
  );
}
