# debug-layout

**Auto-trigger keywords:** width, padding, margin, spacing, gutter, narrow, wide, cramped, breathing room, alignment, container, maxWidth, layout

**Purpose:** Systematically diagnose and fix layout/spacing issues by inspecting the full render chain BEFORE making changes.

---

## Activation

This skill automatically activates when the user mentions:
- Spacing issues (padding, margin, gutter)
- Width/size issues (narrow, wide, cramped, maxWidth)
- Alignment issues
- Container layout problems

## Workflow

### 1. STOP and Inspect First

Before making ANY code changes, gather visual context:

**Ask the user for ONE of the following:**

**Option A - DevTools HTML (Preferred):**
```
"Let me inspect the actual rendered HTML first. Can you:
1. Right-click the [specific element] → Inspect
2. Copy the outer 2-3 nested divs showing style attributes
3. Paste here

This shows me the real constraints (maxWidth, padding, nesting)."
```

**Option B - Measurements:**
```
"Let me get precise measurements first:
1. What's your viewport width? (browser width in px)
2. What's the current content width? (right-click element → Inspect → look at computed width)
3. What width do you want it to be?

This lets me calculate exact changes needed."
```

**Option C - Visual Reference:**
```
"Can you share a screenshot showing:
1. Current state (what looks wrong)
2. Browser viewport visible so I can see scale

Or describe: 'Content should span X% of screen' or 'Like [website example]'"
```

### 2. Analyze Container Hierarchy

Once you have the data, systematically check:

```
✓ Outer container maxWidth?
✓ Outer container padding/margin?
✓ Inner container maxWidth?
✓ Inner container padding/margin?
✓ Grid/component padding?
✓ Cell padding?
```

**Map the full nesting chain** before changing anything:

```
Page / Layout wrapper
  style: { ... }
    ↓
  Content container
    style: { maxWidth: ???, padding: ??? }
      ↓
    Component
      style: { padding: ??? }
        ↓
      Inner elements
        style: { ... }
```

### 3. Identify the Real Constraint

Ask yourself:
- Is the issue padding or maxWidth?
- Which container is actually limiting width?
- Are there conflicting styles at multiple levels?

**State this explicitly to the user:**
```
"The real constraint is [maxWidth: 1092px / padding: 40px / nested container], not [what we initially thought].

Here's the calculation:
- Viewport: 1920px
- maxWidth: 1092px
- Padding: 40px × 2 = 80px
- Actual content: 1012px
- Wasted space: ~908px (47% of screen)

To get content to [target width], we need to change [specific property]."
```

### 4. Make Informed Changes

Now that you understand the constraint:

1. **Change the right property** (not trial and error)
2. **Update ALL related instances** (navbar, footer, sticky elements)
3. **Provide calculations**: "This makes content X px wide on a Y px screen"

### 5. Verify Completeness

Check for cascade effects:

```
✓ Layout containers (pages, sections)
✓ Navbar (if exists)
✓ Sidebar (if exists)
✓ Footer (if exists)
✓ Any custom maxWidth containers
```

---

## Example Invocations

### Bad (Old Way):
```
User: "Content feels cramped, add more space"
Assistant: [Changes padding from 40px to 64px]
User: "That made it worse"
Assistant: [Changes to 32px]
User: "Still doesn't look different"
Assistant: [Finally discovers maxWidth constraint]
```

### Good (With This Skill):
```
User: "Content feels cramped, add more space"
Assistant: "Let me inspect first. Can you right-click the content area → Inspect and paste the HTML showing nested divs with styles? Or tell me your viewport width and what the current content width is?"

User: "<div style='max-width: 1092px; padding: 0 40px'>..."
Assistant: "Found it - the constraint is maxWidth: 1092px, not padding. On a 1920px screen, this caps content at 1092px, leaving ~800px unused.

To make content feel wider, I'll increase maxWidth from 1092px to 1600px. This gives you 508px more usable width.

Making changes to the relevant layout components.

[Makes changes]

This should now span 83% of your screen instead of 57%."
```

---

## Clarity Check: Ambiguous Terms

When user says ambiguous things, **clarify immediately**:

| User says | Could mean | Ask |
|-----------|------------|-----|
| "More space on sides" | More content width OR more whitespace | "Do you want content WIDER (less padding) or more whitespace (more padding)?" |
| "Add breathing room" | More padding OR more gap | "Between which elements? Section edges, grid gap, or cell spacing?" |
| "Make it wider" | Increase maxWidth OR decrease padding | "Current content is Xpx. How wide should it be?" |
| "Feels cramped" | Could be 5+ different constraints | "Can you share DevTools HTML so I see the actual constraint?" |

---

## File Checklist

When making layout width changes, search for these patterns in the codebase:

```bash
# Search for container constraints
grep -rn "maxWidth\|max-width\|max-w-" components/ app/
grep -rn "padding\|gutter" components/ app/
```

---

## Principle

**Never make layout changes blind.**

If you can't see the actual rendered output, GET DATA FIRST:
- DevTools HTML
- Measurements
- Screenshots
- Viewport context

One round of inspection saves 5 rounds of trial-and-error.
