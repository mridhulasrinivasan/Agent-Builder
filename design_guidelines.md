# AI Agent Workflow Builder - Design Guidelines

## Design Approach
**System-Based:** Fluent Design + Linear aesthetic - balancing enterprise functionality with modern productivity tool polish. Reference: Zapier's workflow patterns, Linear's information hierarchy, Notion's component clarity.

## Core Design Principles
1. **Canvas-First Architecture:** Central workspace dominates with supporting panels
2. **Progressive Disclosure:** Complex settings hidden until needed
3. **Visual Feedback:** Immediate state changes for all interactions
4. **Spatial Clarity:** Clear zones for different functions

## Typography
- **Primary Font:** Inter (via Google Fonts CDN)
- **Headings:** 600 weight, sizes: 2xl (workflow names), lg (panel headers), base (node titles)
- **Body:** 400 weight, size: sm for descriptions, xs for metadata
- **Code/Technical:** JetBrains Mono 400 weight for API endpoints, JSON snippets

## Layout System
**Spacing Units:** Consistent use of 2, 3, 4, 6, 8, 12 (e.g., p-4, gap-6, mb-8)

**Application Structure:**
```
[Header: h-16] - Logo, workflow name, save/test/publish controls
[Main Layout: flex h-[calc(100vh-4rem)]]
  ├─ [Left Sidebar: w-64] - Node library, triggers, actions (collapsible)
  ├─ [Canvas: flex-1] - Workflow workspace with infinite pan/zoom
  └─ [Right Panel: w-96] - Node settings, configuration (context-sensitive)
[Toast Area] - Bottom-right for notifications
```

## Component Library

### Navigation & Structure
- **Top Bar:** Fixed navigation with workflow breadcrumb, action buttons (Save, Test, Publish), user avatar
- **Sidebar:** Categorized node library with search, collapsible sections, drag handles on items
- **Canvas Toolbar:** Floating toolbar with zoom controls, fit-to-screen, minimap toggle, grid snap

### Workflow Canvas
- **Background:** Subtle dot grid pattern for spatial reference
- **Nodes:** Rounded rectangles (rounded-lg) with 3px border, min-w-64, shadow-sm on hover
  - Header section with icon + title + status indicator
  - Compact body showing key configuration
  - Connection ports (circles) on left/right edges
- **Connections:** Curved bezier paths (2px stroke), animated dots showing data flow direction
- **Selection State:** 2px solid border, subtle glow effect, resize handles on corners

### Node Types Visual Distinction
- **Trigger Nodes:** Rounded-full left edge, distinct icon treatment
- **Action Nodes:** Standard rounded-lg
- **Logic Nodes:** Hexagonal icon containers, distinct structural appearance
- **End Nodes:** Rounded-full right edge

### Settings Panel (Right Side)
- **Header:** Node icon + name, close button
- **Tabs:** For Configuration, Testing, Logs (if applicable)
- **Form Groups:** Clear spacing (space-y-6), labeled sections with dividers
- **Input Fields:** Consistent height (h-10), proper label/input pairing
- **Advanced Options:** Collapsible accordion sections

### Controls & Inputs
- **Primary Button:** px-6 py-2.5, rounded-md, 600 weight text
- **Secondary Button:** Same sizing, outlined variant
- **Icon Buttons:** 40x40px touch target, rounded-md
- **Toggle Switches:** Standard 44px width for accessibility
- **Dropdowns:** Full-width in forms, min-h-10, searchable for long lists
- **Code Editors:** Monaco editor integration for JSON/API configuration

### Data Display
- **Execution Timeline:** Left-aligned vertical timeline showing step execution
- **Variable Pills:** Inline insertable tokens with distinct styling (rounded-full, px-3, py-1)
- **Status Badges:** Rounded-full, px-2.5, py-0.5, uppercase text-xs tracking-wide
- **Data Preview:** Monospace JSON viewer with syntax highlighting, collapsible sections

### Overlays & Modals
- **Template Gallery:** Grid of workflow templates (3 columns), preview on hover, use this workflow CTA
- **Testing Panel:** Slide-out from bottom (h-80), split view (input | output), run button prominent
- **Confirmation Dialogs:** Centered modal (max-w-md), clear action hierarchy

## Interaction Patterns
- **Drag & Drop:** Clear drop zones, ghost preview while dragging, snap-to-grid option
- **Connection Drawing:** Click port → drag → highlight valid targets → release to connect
- **Multi-Select:** Cmd/Ctrl+click for multiple nodes, drag select with marquee box
- **Quick Actions:** Right-click context menu on nodes and canvas

## Information Hierarchy
1. **Primary Focus:** Workflow canvas - largest area, minimal visual noise
2. **Secondary:** Active node settings panel - detailed when needed
3. **Tertiary:** Node library sidebar - easily scannable, iconography-driven
4. **Supporting:** Execution status, notifications - non-intrusive placement

## Icons
**Library:** Heroicons (outline for sidebar/navigation, solid for active states)
- CDN: https://cdn.jsdelivr.net/npm/heroicons@2.0.18/
- Consistent 20px size in UI, 16px in compact areas, 24px for node headers

## Responsive Behavior
- **Desktop (1440px+):** Full three-column layout as described
- **Laptop (1024-1439px):** Collapsible sidebars, canvas remains focus
- **Tablet/Mobile:** Not primary target - show simplified list view of workflow steps instead of canvas

## Images
**No hero images** - This is a productivity tool, not a marketing page. Use illustrative empty states:
- Empty canvas: Centered illustration + "Start by dragging a trigger" text
- No workflows: Grid placeholder with "Create your first agent" prompt