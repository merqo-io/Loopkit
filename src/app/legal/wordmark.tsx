// Rendered inside the link LegalPage and AcceptTermsPage own, so it must not be
// a link itself. The visible mark is hidden from assistive tech so the link's
// name reads "loopkit home" instead of the split "L", "oo" and "pKit".
export function LegalWordmark() {
  return (
    <>
      <span
        aria-hidden="true"
        className="font-display inline-flex items-baseline text-2xl font-semibold tracking-tight"
      >
        L<span className="text-gold">oo</span>pKit
      </span>
      <span className="sr-only">loopkit home</span>
    </>
  );
}
