"use client";

/**
 * Placeholder body for a Mode that is registered but not yet built. Ticket 06–08 and 11 each
 * replace their own renderer file; nothing else changes.
 */
export default function ComingSoon({ name }: { name: string }) {
  return (
    <div className="coming-soon">
      <p>
        <strong>{name} mode is coming soon.</strong>
      </p>
      <p>The other modes above are ready to use.</p>
    </div>
  );
}
