# Design Guidelines: Conversation Deck Builder

## Design Approach

**Selected Approach: Hybrid (Reference + System)**

**Primary References:**
- **Stripe** - Premium feel, restrained elegance, trust-building
- **Linear** - Clean typography, purposeful spacing, sophisticated interactions
- **Notion** - Approachable complexity, clear information hierarchy

**Design System Foundation:**
- Base structure inspired by refined Material Design principles
- Custom Rive-enhanced components for gamification
- Emphasis on emotional resonance and premium positioning

**Core Design Principles:**
1. **Calm Confidence** - Users should feel guided, not rushed
2. **Premium Simplicity** - Sophisticated without being sterile
3. **Progressive Disclosure** - Reveal complexity as needed
4. **Emotional Resonance** - Design reflects intimacy and connection

---

## Typography System

**Font Stack:**
- **Primary (Headings):** Inter or Clash Display (via Google Fonts)
  - Hero: 3.5rem - 4.5rem, weight 600-700, tight letter spacing (-0.02em)
  - H1: 2.5rem - 3rem, weight 600
  - H2: 1.75rem - 2rem, weight 600
  - H3: 1.25rem - 1.5rem, weight 500

- **Secondary (Body):** Inter or Söhne (fallback: system-ui)
  - Large body: 1.125rem, weight 400, line-height 1.7
  - Body: 1rem, weight 400, line-height 1.6
  - Small: 0.875rem, weight 400, line-height 1.5

- **Accent (Labels/UI):** Inter, uppercase, weight 500-600, letter-spacing 0.05em

**Hierarchy Rules:**
- Section headings: Large, generous spacing above (3-4rem)
- Body text: Max-width 65ch for readability
- UI labels: Compact, uppercase, subtle
- CTA text: Medium weight, slightly larger than body

---

## Layout System

**Spacing Primitives (Tailwind units):**
- **Core set:** 2, 4, 6, 8, 12, 16, 20, 24, 32
- **Micro spacing:** Use 2, 4 for tight groupings
- **Component spacing:** Use 6, 8, 12 for component internals
- **Section spacing:** Use 16, 20, 24, 32 for page sections

**Grid Structure:**
- **Container:** max-w-7xl (1280px) for wide sections
- **Content:** max-w-4xl (896px) for focused content
- **Text:** max-w-2xl (672px) for reading comfort

**Breakpoint Strategy:**
- Mobile-first approach
- Single column on mobile (base)
- Strategic 2-column splits at md: (768px)
- Full complexity at lg: (1024px)

---

## Page-Specific Layouts

### Landing Page (index.html)

**Hero Section (100vh):**
- Full-height centered hero with large typography
- Primary CTA prominently placed below headline
- Subtle background treatment (no image - use gradient or texture)
- Trust indicator ("Trusted by 10,000+ couples") positioned below CTA

**Features Section (py-24):**
- 3-column grid (lg:grid-cols-3, md:grid-cols-2, base:grid-cols-1)
- Icon + heading + description pattern
- Generous vertical spacing between rows
- Use Heroicons for feature icons

**How It Works (py-24):**
- Horizontal step indicator (numbered 1-5)
- 2-column alternating layout: visual left, description right (then swap)
- Use mockup images of the interface at each step

**Social Proof (py-20):**
- 3-column testimonial grid
- Include customer photos (circular avatars)
- Quote text + name + relationship type

**Final CTA (py-32):**
- Centered, focused section
- Large heading + supporting text
- Primary CTA button
- Secondary link ("Learn more about the cards")

### Customize Page (customize.html)

**Layout Structure:**
- Header: Step indicator (12-16 units tall)
- Main: Split layout (60/40 or 55/45)
  - Left: Category bins (drag-drop area)
  - Right: Progress panel (sticky)
- Footer: Navigation (Previous/Next buttons)

**Category Bins:**
- 5 distinct sections stacked vertically
- Each bin: Icon + category name + counter + add/subtract controls
- Visual density: Comfortable padding (p-6 to p-8)
- Clear visual separation between bins

**Progress Panel (Sticky):**
- Fixed width (320-400px)
- Card count visualization (large number display)
- Circular progress indicator
- "52/52 Complete" state celebration
- Visual breakdown of current mix

**Button Placement:**
- Floating "Next" button (bottom-right, fixed position)
- Only appears when total === 52
- Disabled state when incomplete

### Card Back Selection (card-back.html)

**Carousel Layout:**
- Centered canvas area (600-800px wide, 400-500px tall)
- Card back preview dominates the view
- Navigation arrows (left/right) positioned outside canvas
- Selected design label below canvas

**Design Options:**
- Horizontal row of thumbnail previews below carousel
- 5-7 options visible at once
- Active selection highlighted
- Click thumbnail to jump to that design

**Confirm Section:**
- Below previews: Design name + description
- "Select This Design" CTA button (full width on mobile, centered on desktop)

### Preview Page (preview.html)

**Summary Layout:**
- Two-column split (md: and above)
- Left: Category breakdown (bar chart visualization)
- Right: Card back preview (large visual)

**Category Breakdown:**
- Vertical list of categories
- Horizontal bars showing distribution
- Numbers displayed (e.g., "Romantic: 20 cards")
- Total count emphasized at bottom

**Card Back Display:**
- Large preview of selected design
- Label: "Your Selected Card Back"
- Option to change (link back to card-back.html)

**Action:**
- "Proceed to Checkout" CTA (bottom-right or centered)

### Checkout Page (checkout.html)

**Form Layout:**
- Two-column on desktop (md:grid-cols-2)
  - Left: Shipping form
  - Right: Order summary (sticky)
- Single column on mobile

**Order Summary Panel:**
- Product name + quantity
- Category breakdown (compact list)
- Card back preview (small thumbnail)
- Price breakdown
- Total (emphasized)

**Form Design:**
- Generous field spacing (mb-6)
- Labels above inputs
- Clear focus states
- Error messages below fields

### Success Page (success.html)

**Celebration Layout:**
- Centered content (max-w-2xl)
- Large success icon/Rive animation (200-300px)
- Headline: "Your Deck is On Its Way!"
- Order confirmation details
- Shipping timeline
- Email confirmation notice

**Next Steps Section:**
- What happens next (3-step timeline)
- Support contact information
- Social sharing options

---

## Component Library

### Buttons

**Primary Button:**
- Large (py-3 px-8), medium weight text (font-medium)
- Rounded corners (rounded-lg)
- Shadow on hover (shadow-lg)
- Transform on active (scale-[0.98])

**Secondary Button:**
- Similar size, outlined style
- Subtle hover state

**Button on Images:**
- Background blur (backdrop-blur-md)
- Semi-transparent background
- No custom hover/active states (use default)

### Cards

**Feature Card:**
- Padding: p-8
- Rounded: rounded-xl
- Border: subtle outline
- Icon at top (mb-4)
- Heading (mb-2)
- Description text

**Testimonial Card:**
- Padding: p-6
- Avatar at top (circular, 48-64px)
- Quote text (italic, medium size)
- Attribution (name + relationship)

### Form Inputs

**Text Input:**
- Height: h-12
- Padding: px-4
- Rounded: rounded-lg
- Border width: 2px (focus state)

**Select Dropdown:**
- Same dimensions as text input
- Custom arrow indicator

### Navigation

**Step Indicator (Rive Component):**
- Horizontal layout
- 5 steps with connecting lines
- Active step emphasized
- Completed steps marked with checkmark

**Page Header:**
- Minimal, logo left, support link right
- Height: 16-20 units

---

## Animations & Motion

**Rive Integration Points:**
- Step indicator: State changes on navigation
- Customize page: Bin hover/success/error feedback
- Progress bar: Fill animation as count approaches 52
- Card back carousel: Smooth transitions between designs
- Success page: Celebration animation on load

**Motion Principles:**
- Calm, purposeful animations (300-500ms duration)
- Ease-out timing for most transitions
- No bounce effects (Apple-like restraint)
- Reduced motion respected (Rive boolean input)

---

## Images Strategy

**Landing Page:**
- **Hero:** No image - use sophisticated gradient or texture
- **How It Works:** Interface mockups (customize dashboard, card back selection, preview screen)
- **Social Proof:** Customer photos (authentic, circular crops)
- **Product Shot:** Physical deck box and cards spread (before final CTA)

**Customize Page:**
- Icons for each category (Heroicons or custom SVG)

**Card Back Page:**
- High-res previews of each card back design

**Preview Page:**
- Selected card back design (large preview)

**Success Page:**
- Optional: Shipping box illustration or photo

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column layouts
- Stacked components
- Full-width buttons
- Reduced typography scale (0.9x)

**Tablet (768-1024px):**
- 2-column grids where appropriate
- Maintain core spacing
- Optimize for touch targets

**Desktop (>1024px):**
- Full multi-column layouts
- Maximum spacing and comfort
- Utilize horizontal space strategically

---

## Accessibility Foundations

- Keyboard navigation for all interactive elements
- Focus indicators (ring-2, visible offset)
- ARIA labels for Rive canvas elements
- Alt text for all images
- Semantic HTML structure
- Sufficient contrast ratios (WCAG AA minimum)
- Form validation with clear error messages

---

**Design Completeness:**
All pages feature comprehensive, polished layouts with 5-8 purposeful sections. No sparse, minimal designs—every page demonstrates professional depth and attention to detail appropriate for a premium product.