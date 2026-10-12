# Architecture decision records

**ADRs live in this directory — `docs/adr/`. There is no second place.** There used to be: the
aiflow template created `docs/architecture/adr/` with a meta-ADR in it while every decision this
project actually took was numbered here. An architect agent following the old instructions would
have written the next ADR there and started again at a number already taken, which is how two
different ADR 0002 come to exist (`enigma2_player-5y2`). The arc42 document stays in
`docs/architecture/arc42.md`; its §9 lists the decisions and links here.

## Why ADRs at all

A durable, reviewable record of why the architecture is the way it is, so agents and humans
respect prior decisions instead of relitigating them. Decisions are greppable and versioned with
the code they constrain.

## The rules

- **One file per decision**, `NNNN-kebab-title.md`, numbered strictly sequentially across this
  directory. Take the next free number — never reuse one, not even for a withdrawn draft.
- **Nothing is edited into a past ADR except its status.** A new decision supersedes an old one
  explicitly, and both say so: the new one links the superseded file, the old one gets
  `Superseded by NNNN`. A superseded ADR is not wrong and is not deleted — its constraints often
  still bind (ADR 0001 is the example).
- **Record the decision, not the design.** Context (what forced the choice), Decision (what was
  chosen, in the imperative), Consequences (what this now costs and what it rules out). If the
  decision has a boundary — "this exception covers X and nothing else" — the boundary is the most
  important sentence in the file; write it explicitly (ADR 0003 is the example).
- **Date it, and say who decided.** A decision with no date cannot be superseded in order.
- **Register it in `docs/architecture/arc42.md` §9** in the same commit, with one line saying
  whether it is current or superseded. An ADR nobody can find from the architecture document is a
  file, not a decision.

## Current set

| ADR | Subject | Status |
| --- | --- | --- |
| [0004](0004-site-architecture-rules.md) | Architecture rules for the site (Rule zero, `AGENTS.md §2b`) | Accepted |
| [0003](0003-public-shop-api-key-stays-tracked.md) | The shop's public API key stays in the tracked site data | Accepted |
| [0002](0002-product-site-angular-prerender.md) | Product site on Angular 22, prerendered | Accepted; supersedes 0001 |
| [0001](0001-static-site-astro.md) | Static site on Astro | Superseded by 0002; its constraints still bind |
