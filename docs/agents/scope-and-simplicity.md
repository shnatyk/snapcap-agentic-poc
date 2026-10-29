# Scope and simplicity

Build what the ticket asks for, in the most obvious way that works. The trade is deliberate: a few more small bugs, found in QA and fixed as they come, in exchange for shipping sooner.

- **Take the simpler of two working solutions.** If it has a known gap, name the gap and move on.
- **Don't build for a case nobody has reported.**
- **Defensive coding stays low.** No guards, fallbacks or validation for states this app can't reach. Handle an edge case only when it's cheap and sits directly in the change's path.
- **Prefer deleting to guarding.** A fix that needs a special case to stay safe is usually the wrong shape.
- **Flag what is out of scope, don't fix it.**

This is about breadth, not care. The part the ticket does cover gets finished properly: typechecked, tested where there is a pure seam to test, and built.
