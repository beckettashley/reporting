# UI/UX Design Principles
### A Reference for Building World-Class Software Interfaces

This document is a canonical reference for designing and evaluating software interfaces. It is intended for use by AI agents (Claude Code and others) generating mockups, UI specifications, and frontend implementations.

Every principle is grounded in established design canon — Jakob Nielsen's 10 Usability Heuristics, Don Norman's *The Design of Everyday Things*, the Laws of UX (lawsofux.com), and WCAG accessibility standards. These are not preferences — they are the rules that leading design teams use to build software that earns trust and gets out of the way.

**How to use this document:**
- Apply these principles when generating any UI, mockup, or component
- Use the examples as the quality bar to meet or exceed
- When two principles conflict, use context and user goal to arbitrate
- Flag explicitly when a design decision violates a principle

---

## 1. Clarity Beats Cleverness
*Sources: Nielsen Heuristic #2 — Match Between System and Real World; Norman, The Design of Everyday Things*

The user's mental model is the only model that matters. If someone has to think about how to use your interface, you've already lost. Clever solutions that require explanation are not solutions. Design for the person who will never read documentation.

**In practice:** Label things what they are. Use verbs on buttons. Avoid metaphors that don't translate across cultures or contexts. Never name a button after a system concept when a plain verb will do ("Submit" → "Save Changes"; "Execute" → "Run Report").

**Example — Stripe Dashboard:**
Stripe's payment dashboard labels every action in plain transactional language: "Refund", "Dispute", "Send invoice." No internal jargon, no abstract icons without labels. A first-time user can perform a refund without documentation. The UI spec equivalent: every interactive element has a visible text label that describes the outcome, not the mechanism.

---

## 2. Hierarchy Is Communication
*Sources: Nielsen Heuristic #8 — Aesthetic and Minimalist Design; Gestalt principles of visual perception*

Visual hierarchy *is* information architecture made visible. The eye lands where contrast, size, and spacing direct it. If everything is equally prominent, nothing is. A flat design with no hierarchy is noise.

**In practice:** Every screen has one dominant element. Ask: "What is the single most important thing a user should see first?" Then ruthlessly subordinate everything else. Use size, weight, contrast, and whitespace — not color alone — to establish rank.

**Example — Linear (linear.app):**
Linear's issue view establishes immediate hierarchy: issue title at largest weight, status and assignee as secondary metadata in muted type, description in readable body size, and comments subordinated below a visual divider. The user's eye follows a clear path from "what is this" → "what state is it in" → "what's the detail." Every level of information has a distinct visual treatment. Nothing competes. UI spec equivalent: define 4 typographic levels (display, heading, body, meta) and never deviate — every element must be assigned to one of them.

---

## 3. Friction Is a Design Decision
*Sources: Nielsen Heuristic #3 — User Control and Freedom; Fogg Behavior Model*

Every click, form field, and confirmation dialog is a tax you're charging the user. Sometimes friction is intentional and appropriate (destructive actions, financial transactions). But most friction is accidental — the result of not asking "is this step necessary?"

**In practice:** Audit every user flow. Every step that exists for the system's convenience, not the user's, should be eliminated or hidden. If a form asks for information not used immediately, cut it. If a confirmation dialog fires for reversible actions, remove it.

**Example — Notion's slash command:**
Notion eliminated the friction of toolbar navigation entirely. Instead of requiring users to reach for a toolbar, click a dropdown, and select a content type, a single "/" keystroke opens an inline command palette exactly where the user is already working. The action cost dropped from 3 interactions to 1. UI spec equivalent: for any action a user performs more than twice per session, find a way to invoke it without leaving the current context.

---

## 4. States Are Part of the Design
*Sources: Nielsen Heuristic #1 — Visibility of System Status*

Empty state. Loading state. Error state. Zero results. Partial data. Offline. These are not edge cases — they are the full surface area of your product. Designing only the happy path is designing half a product.

**In practice:** For every component, design: empty, loading, error, and populated states before the happy path. For live or frequently refreshed data, always show a "Last updated" timestamp — users need to know if they're looking at now or an hour ago.

**Example — GitHub Actions:**
GitHub's CI pipeline view handles every state with equal design care. A running job shows a animated progress indicator with elapsed time. A failed job surfaces the exact failing step in red with a direct link to the log line — not just "build failed." An empty state (no workflows yet) shows a contextual prompt to create one, not a blank screen. Each state communicates clearly and moves the user forward. UI spec equivalent: before writing happy-path markup, list every state the component can be in and spec each one explicitly.

---

## 5. Progressive Disclosure Respects Attention
*Sources: Nielsen Heuristic #8 — Aesthetic and Minimalist Design; Miller's Law — lawsofux.com*

Show only what a user needs for the current task. Surface advanced options, detailed data, and secondary actions only when requested. An interface that exposes everything at once trains users to see nothing.

**In practice:** Identify the 20% of features used 80% of the time and make those immediately visible. Put the rest one deliberate step away — a "More options" toggle, an expanded row, a detail panel. Complexity should be available, not ambient.

**Example — Figma's properties panel:**
Figma shows only the most-used properties (position, size, fill, stroke) in the default panel. Advanced options (blend modes, constraints, auto layout overrides) are revealed contextually — they appear only when relevant to the selected element. A user who never needs blend modes never sees them. A user who does can access them in one click. UI spec equivalent: group all settings into "primary" (always visible) and "secondary" (revealed on expand or contextual trigger), and default to showing primary only.

---

## 6. Defaults Are Decisions
*Sources: Norman, The Design of Everyday Things — chapter on constraints and affordances; Thaler & Sunstein, Nudge*

The default state of any control, form, or setting will be the choice for the majority of users. Defaults are not neutral — they encode values, assumptions, and incentives. A pre-checked opt-in is a manipulation. A sensible default is a gift.

**In practice:** Set defaults to what most users actually want, not what serves your metrics. Pre-fill forms with the most common value. Set toggles to the safe state. Choose the conservative action as the default for irreversible operations.

**Example — Apple's iPhone setup:**
During iPhone setup, Apple defaults location services to "While Using" (not "Always"), defaults app tracking to off, and defaults iCloud backup to on. Each default reflects what is genuinely best for most users — privacy-protective defaults are on, convenience defaults (backup) are on. The friction of changing a default is deliberately higher than accepting it, which means defaults must be set responsibly. UI spec equivalent: for every toggle, dropdown, and form field, explicitly state the default value and the justification for it.

---

## 7. Typography Does Most of the Work
*Sources: Bringhurst, The Elements of Typographic Style; WCAG 1.4.3 — Contrast Minimum*

Color and imagery get the attention; typography carries the load. Readable type at the right scale, weight, and line-height will do more for a design than any visual embellishment. Poor type makes everything feel broken regardless of how good everything else is.

**In practice:** Use 2 typefaces maximum. Set body type at 16–18px base. Line height 1.5–1.65 for body copy. Never set long-form text in all-caps or low-weight on low-contrast backgrounds. Establish a type scale (e.g. 12/14/16/20/24/32/48px) and apply it without deviation.

**Example — Stripe's documentation:**
Stripe's docs site is a masterclass in typographic hierarchy. A single sans-serif typeface (with a monospace for code) handles everything. The type scale is strict: page title, section header, body, caption, code — each level is visually distinct but part of the same system. Line length is capped at ~75 characters. Reading a Stripe doc feels effortless because the typography creates no friction. UI spec equivalent: define the full type scale before designing any component, assign every text element to a scale level, and enforce max line-length of 65–75 characters for body text.

---

## 8. Color Has One Job Per Use
*Sources: Nielsen Heuristic #4 — Consistency and Standards; WCAG 1.4.1 — Use of Color*

Color should serve a purpose: indicate state, encode category, create hierarchy, or establish identity. When color is decorative everywhere, it can't be functional anywhere. Reserve high-saturation color for signal.

**In practice:** Define a semantic color system before an aesthetic one. Establish: error (red), success (green), warning (amber), action/primary (brand), neutral (gray scale). Never use color as the only differentiator — always pair with icon, label, or pattern for accessibility.

**Example — Vercel's deployment dashboard:**
Vercel uses color with surgical precision. Green means deployed and live. Red means build failed. Yellow means building. Gray means cancelled. These four states are used consistently across every surface — the deployment list, the commit history, the branch view. A user learns the system once and applies it everywhere. Color is never decorative on this interface; every use is load-bearing. UI spec equivalent: create a color token system (--color-success, --color-error, --color-warning, --color-action) and prohibit any use of those hues outside their defined semantic role.

---

## 9. Consistency Reduces Cognitive Load
*Sources: Nielsen Heuristic #4 — Consistency and Standards; Jakob's Law — lawsofux.com*

Every time a user encounters a familiar pattern, they can apply prior learning for free. Every inconsistency forces a micro-decision. A design system is not bureaucracy — it's compression of cognitive load at scale. Jakob's Law adds a critical implication: users spend most of their time in *other* products, so your interface should meet the expectations those products have already established.

**In practice:** Document every interaction pattern. When you break a pattern, have an explicit reason. Don't invent a new component when an existing pattern covers the need. Inconsistency without intent is just noise.

**Example — Linear's keyboard shortcuts:**
Linear's entire interface is governed by a consistent interaction model: `G` then a letter navigates globally (G+I = Inbox, G+M = My Issues), `C` always creates, `E` always edits. This system is consistent across every context. Once a user learns the model, every new surface is immediately familiar. There is no "how do I do X here" because the answer is always the same answer. UI spec equivalent: define interaction patterns as reusable components and explicitly prohibit one-off implementations that diverge from the system.

---

## 10. Recognition Over Recall
*Sources: Nielsen Heuristic #6 — Recognition Rather Than Recall; Miller's Law — lawsofux.com*

Don't make users remember things. If a user has to recall information from one part of the interface to use another, the design has failed. Visible options, persistent labels, and in-context help all reduce memory burden. Recognition — seeing the right option and selecting it — is cognitively cheaper than recall, which requires retrieval from scratch.

**In practice:** Keep navigation labels visible, not hidden behind unlabeled icons. Show field labels even after a field is filled. Surface recent items, saved states, and relevant defaults so users can recognize the right path rather than reconstruct it.

**Example — VS Code's Command Palette:**
VS Code's `Cmd+Shift+P` command palette means users never have to remember where a feature lives in a menu. They type what they want in plain language — "format document," "toggle terminal," "rename symbol" — and the system matches it. The interface offloads the memory burden to the machine. No menu archaeology, no keyboard shortcut memorization required. UI spec equivalent: for any feature more than 2 levels deep in navigation, provide a search or command interface as an alternative access path.

---

## 11. Feedback Is a Contract
*Sources: Nielsen Heuristic #1 — Visibility of System Status; Doherty Threshold — lawsofux.com*

Every user action implies a system response. Clicking a button, submitting a form, dragging an element — the system must acknowledge it. Silence after an action creates anxiety. The Doherty Threshold establishes that system response under 400ms feels seamless; above that, explicit feedback is required.

**In practice:** Under 100ms: no indicator needed. 100–400ms: subtle animation or spinner. Over 400ms: explicit progress indicator. Over 10s: progress with estimated time. Errors must explain what happened and what to do next — never just "Something went wrong."

**Example — Superhuman's send flow:**
When you send an email in Superhuman, the message animates out of the compose window with a satisfying motion, a green "Sent" confirmation appears briefly, and the interface immediately advances to the next item. The feedback is instant, specific, and non-blocking. It confirms the action completed, communicates the outcome, and gets out of the way — all within ~200ms. UI spec equivalent: every destructive or async action requires a defined feedback state: (1) immediate acknowledgment, (2) in-progress state, (3) success confirmation, (4) error with recovery path.

---

## 12. Accessibility Is Not Optional
*Sources: WCAG 2.2 AA — w3.org/TR/WCAG22; Nielsen Heuristic #4 — Consistency and Standards*

Designing for disability benefits everyone. High contrast helps in sunlight. Large touch targets help fatigued users. Keyboard navigation helps power users. Accessible design is good design that happens to be inclusive. WCAG 2.2 AA is the minimum standard — not a ceiling.

**In practice:** 4.5:1 contrast ratio minimum for body text (3:1 for large text). All interactive elements keyboard-navigable with visible focus states. No information conveyed by color alone. Touch targets minimum 44×44px. Semantic HTML with ARIA labels where native semantics are insufficient.

**Example — GOV.UK Design System:**
The UK government's design system is the global benchmark for accessible UI. Every component ships with full keyboard support, screen reader annotations, high-contrast mode, and documented ARIA patterns. The focus state is a thick yellow outline — deliberately unfashionable, impossible to miss. Their rationale: millions of users depend on this interface for essential services, so accessibility is a hard requirement, not an enhancement. UI spec equivalent: every component specification must include keyboard interaction model, focus state design, and ARIA role/label requirements before it is considered complete.

---

## 13. Motion Communicates, Not Decorates
*Sources: Nielsen Heuristic #1 — Visibility of System Status; WCAG 2.3.3 — Animation from Interactions*

Animation should orient (where did that element go?), provide feedback (this action worked), or create delight without slowing anything down. Animation that exists purely for aesthetics trains users to ignore it — and then meaningful animations get ignored too. Always respect `prefers-reduced-motion`.

**In practice:** Duration under 200ms feels snappy. 200–500ms for transitions. Over 500ms starts to feel slow. Use easing curves that reflect physics (ease-out for elements entering, ease-in for elements leaving). Every animation should be removable without losing functionality.

**Example — Craft's drag and drop:**
When you drag a block in Craft, the surrounding content gently makes room as you move — other elements animate out of the way in real time with a spring physics curve. When you drop, the block settles with a subtle deceleration. The motion is doing communicative work: it shows you exactly where the item will land before you commit. There is no animation that doesn't carry meaning. UI spec equivalent: for every animation, write a one-sentence description of what information it communicates to the user. If you can't write that sentence, cut the animation.

---

## 14. Test With Real People, Not Hypothetical Ones
*Sources: Nielsen — Why You Only Need to Test with 5 Users (nngroup.com); Norman, The Design of Everyday Things*

Every designer has a blind spot: knowledge of how the thing is supposed to work. Watch one real person use your product for 20 minutes and you will learn more than a week of internal review. The map is not the territory. Five users will surface the majority of critical usability problems.

**In practice:** Test early — on paper prototypes, wireframes, or rough builds — not on polished finals. Test the task, not the design ("Can you find your most recent invoice?" not "What do you think of this page?"). Observe without intervening. What users do is data; what they say is opinion.

**Example — Airbnb's early testing:**
Airbnb's founders famously flew to New York to photograph listings personally after noticing that low-quality photos were killing conversions. They didn't A/B test their way to that insight — they watched real users react to real listings. The fix cost nothing except time and yielded a step-change in revenue. The principle: get out of the building before optimizing the artifact. UI spec equivalent: before finalizing any user-facing flow, define the key task a real user would attempt and specify what success looks like — not from the system's perspective, but from the user's.

---

## 15. Design for Forgiveness
*Sources: Nielsen Heuristic #3 — User Control and Freedom; Nielsen Heuristic #5 — Error Prevention*

Users make mistakes. They misunderstand. They click the wrong thing. An interface that punishes error is a bad interface. Undo, confirmation prompts for destructive actions, and clear recovery paths are not afterthoughts — they are trust infrastructure. The goal is to make it easy to do the right thing and hard to do the wrong thing — and recoverable when the wrong thing happens anyway.

**In practice:** Prefer reversible actions over irreversible ones. If an action cannot be undone, say so clearly *before* it executes, not after. Provide undo for any action that deletes, archives, or modifies data. Confirmation dialogs should be reserved for truly destructive, irreversible actions — not used as friction for everything.

**Example — Gmail's "Undo Send":**
Gmail's undo send is a masterclass in designed forgiveness. It doesn't actually delay anything technically — it holds the message locally for a configurable window (5–30 seconds) before transmitting. The interface shows a brief "Message sent. Undo" toast. One click recovers the email fully. The cost of the mistake drops to zero. No confirmation dialog, no warning, no friction on send — just a safety net that catches the regret that follows every action. UI spec equivalent: for every destructive action in the system, define: (1) is it reversible? (2) if yes, what is the undo mechanism and window? (3) if no, what is the confirmation copy and what does it say the consequence is?

---

## 16. Hick's Law — Reduce the Decision Surface
*Sources: Hick's Law — lawsofux.com; Miller's Law — lawsofux.com*

The time it takes to make a decision increases with the number and complexity of choices. Doubling the number of options does not double decision time — it increases it logarithmically. Every option you add to a menu, a toolbar, or a settings page imposes a cost on every user, every time.

**In practice:** Navigation menus: 5–7 items maximum. Dropdown options: group and limit. Onboarding flows: one decision per screen. If a user must choose between more than 7 options, introduce grouping, search, or progressive filtering to reduce the visible set.

**Example — Apple TV's remote:**
The original Apple TV remote had 78 buttons. The redesign reduced it to 6. Every button removal forced a decision about what was truly essential. The result was a device that new users could operate without instructions, where the original required a mental map. The same principle applies to software: fewer, better-labeled options outperform comprehensive option sets. UI spec equivalent: for every navigation menu, toolbar, and settings panel, document the number of visible options. Flag any set exceeding 7 items for review.

---

## 17. Fitts's Law — Size and Distance Are Usability Variables
*Sources: Fitts's Law — lawsofux.com; WCAG 2.5.5 — Target Size*

The time to reach and activate a target is a function of its size and the distance to it. Small targets far from the user's current position are slow and error-prone. This is a mathematical law, not a preference — it applies equally to mouse and touch interfaces.

**In practice:** Primary actions (submit, save, confirm) should be large and close to where the user's attention already is. Destructive actions (delete, remove) should be small and distant or require deliberate navigation. Touch targets: 44×44px minimum (Apple HIG), 48×48dp (Google Material). Never place opposing actions (Save / Delete) adjacent to each other.

**Example — iOS action sheets:**
iOS places the primary action at the bottom of the screen — the closest point to the user's thumb in a natural grip. The cancel action is also at the bottom but visually separated. Destructive actions appear in red above cancel, requiring the user to move their thumb upward deliberately. The entire layout is a Fitts's Law implementation: the safest and most common action is the easiest to reach, and the most dangerous is the hardest. UI spec equivalent: on every screen, map the primary, secondary, and destructive actions and verify that their size and position reflect their intended frequency and risk level.

---

## 18. Peak-End Rule — The Last Impression Is the Lasting One
*Sources: Peak-End Rule — lawsofux.com; Kahneman, Thinking, Fast and Slow*

Users judge an experience by its peak (most intense moment, positive or negative) and its end — not the average. A smooth 10-step flow with a confusing final screen will be remembered as confusing. A frustrating process with a delightful, reassuring completion state will be remembered more favorably than it deserves.

**In practice:** Invest disproportionate design effort in: (1) the moment of highest stakes or emotion (payment confirmation, account deletion, first successful action), and (2) the end state of every significant flow. Completion screens, success states, and offboarding moments are not afterthoughts — they are the last thing the user carries with them.

**Example — Duolingo's lesson completion:**
When you complete a Duolingo lesson, the app delivers an animated celebration: confetti, a character animation, a streak counter update, and a progress summary. It is more elaborate than anything in the lesson itself. Duolingo understands that the end moment sets the emotional memory of the entire session. Users don't remember each individual exercise — they remember how they felt when they finished. UI spec equivalent: for every multi-step flow, explicitly design the final success state as a named deliverable, not a default confirmation message.

---

## 19. Miller's Law — Chunk Everything
*Sources: Miller's Law — lawsofux.com; Cognitive Load — lawsofux.com*

The average person can hold approximately 7 (±2) items in working memory at once. Interfaces that present more than this simultaneously force users to externalize memory — writing things down, re-reading, losing place. Chunking — grouping related information into meaningful units — reduces the effective count and improves both comprehension and recall.

**In practice:** Navigation: max 7 top-level items. Form sections: group related fields with clear headers. Tables: limit default visible columns to the most critical. Long processes: break into named steps with a progress indicator. Phone numbers, account numbers, and codes should be visually chunked (XXX-XXX-XXXX, not XXXXXXXXXX).

**Example — Stripe's onboarding checklist:**
When a new Stripe account is created, the dashboard shows a checklist of exactly 5 setup steps — never the full complexity of the platform. Each step is a single task with a clear outcome. The user is never looking at more items than working memory can comfortably hold. Once steps are complete, they collapse. The interface reveals complexity incrementally, matching the user's growing mental model. UI spec equivalent: any list, menu, or set of options exceeding 7 items must be grouped, paginated, or filtered before rendering. Document the grouping rationale.

---

*These principles are in tension with each other and with real constraints. That's the job. When they conflict, the tiebreaker is always: what serves the user's actual goal in this specific context?*

---

### Canonical Sources
| Source | Reference |
|---|---|
| Nielsen's 10 Usability Heuristics | https://www.nngroup.com/articles/ten-usability-heuristics/ |
| Laws of UX | https://lawsofux.com |
| WCAG 2.2 | https://www.w3.org/TR/WCAG22/ |
| Don Norman — The Design of Everyday Things | Basic Books, 2013 |
| Kahneman — Thinking, Fast and Slow | Farrar, Straus and Giroux, 2011 |
| Bringhurst — The Elements of Typographic Style | Hartley & Marks, 2004 |
