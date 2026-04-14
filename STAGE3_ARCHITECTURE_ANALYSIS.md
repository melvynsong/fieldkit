# Stage 3 (Build & Iterate) Architecture Analysis

**Document Version**: 1.0  
**Analysis Date**: April 15, 2026  
**Coverage**: Complete Stage 3 workflow, AI chat integration, data models, and system constraints

---

## 1. High-Level Architecture Overview

Stage 3 transforms generated screens from Stage 2 into an **interactive prototype experience** with real-time visual feedback, device simulation, and AI-powered refinement capabilities.

### Key Components
- **BuildWorkspace** (main container) - 3-column layout orchestrating the entire prototype experience
- **InteractiveScreenPreview** - Realistic UI rendering with interactive navigation
- **ScreenListNavigator** - Visual screen selection sidebar
- **DeviceModeSelector** - Mobile/desktop preview modes
- **StageAssistantDock** - AI chat interface for iterative refinement
- **useWorkflowStore** (Zustand) - Centralized state management across all stages

### Data Flow Architecture
```
Stage 2 Output (GeneratedScreen[])
    ↓
    └─→ workflowStore.generatedScreens (ScreenGenerationResult)
        ↓
        └─→ hydrateBuildScreens() [screen-content-generator.ts]
            ↓
            └─→ BuildScreen[] (with sections, actions, metadata)
                ↓
                ├─→ BuildWorkspace (display orchestration)
                │   ├─→ ScreenListNavigator (navigation UI)
                │   ├─→ InteractiveScreenPreview (main preview)
                │   └─→ Design Controls Panel (refinement)
                │
                └─→ AI Chat Updates
                    ├─→ applyBuildChatPrompt() [in store]
                    ├─→ /api/generate-screens [POST]
                    ├─→ Regenerate with chat instruction
                    └─→ Re-hydrate BuildScreens
```

---

## 2. Complete File Structure & Key Paths

### Core Components

| File | Lines | Purpose |
|------|-------|---------|
| [components/BuildWorkspace.tsx](components/BuildWorkspace.tsx) | 1-600+ | Main Stage 3 container; 3-column layout (navigator, preview, controls) |
| [components/InteractiveScreenPreview.tsx](components/InteractiveScreenPreview.tsx) | 1-800+ | Renders realistic UI screens with domain-specific content |
| [components/ScreenListNavigator.tsx](components/ScreenListNavigator.tsx) | 1-60 | Visual screen list with current selection highlighting |
| [components/DeviceModeSelector.tsx](components/DeviceModeSelector.tsx) | 1-40 | Mobile/desktop mode toggle with viewport support inference |
| [components/StageAssistantDock.tsx](components/StageAssistantDock.tsx) | 1-120 | AI chat dock for Stage 2 & Stage 3 refinement |

### State Management & Business Logic

| File | Lines | Purpose |
|------|-------|---------|
| [lib/workflowStore.ts](lib/workflowStore.ts) | 1-1200+ | Zustand store with complete workflow state and actions |
| [lib/screen-content-generator.ts](lib/screen-content-generator.ts) | 1-130 | `generateBuildScreens()` - converts GeneratedScreen → BuildScreen |
| [lib/interaction-engine.ts](lib/interaction-engine.ts) | 1-70 | `applyBuildInteraction()` - handles screen navigation & state changes |
| [lib/screen-generator.ts](lib/screen-generator.ts) | 1-150 | `buildGenerateScreensPrompt()` - constructs AI prompt for screen generation |

### API Routes

| Route | File | Purpose |
|-------|------|---------|
| `/api/generate-screens` | [app/api/generate-screens/route.ts](app/api/generate-screens/route.ts) | Called by Stage 2 and applyBuildChatPrompt(); generates/refines screens |
| `/api/design-chat` | [app/api/design-chat/route.ts](app/api/design-chat/route.ts) | Design refinement endpoint (Stage 2 specific) |

### Type Definitions

| File | Key Types |
|------|-----------|
| [types/index.ts](types/index.ts) | `BuildScreen`, `BuildScreenSection`, `BuildScreenAction`, `BuildDesignControls`, `BuildDesignTokens`, `GeneratedScreen`, `ScreenGenerationResult` |

---

## 3. Data Models & Flow

### BuildScreen (Primary Prototype Unit)
```typescript
interface BuildScreen {
  id: string;                          // Unique identifier
  sourceScreenId: string;              // Links back to GeneratedScreen
  screenName: string;                  // "Dashboard", "Payment", etc.
  title: string;                       // Display title with tone prefix
  subtitle: string;                   // Purpose/contribution to flow
  description: string;                // Design reasoning + density hints
  sections: BuildScreenSection[];     // Content areas (2+ per screen)
  chips: string[];                   // Metadata tags (style, tone, density, rhythm)
  primaryAction: BuildScreenAction;   // Main CTA (Continue/Confirm)
  secondaryActions: BuildScreenAction[]; // Back, View Details, etc.
}

interface BuildScreenSection {
  id: string;                    // "screen-1-section-1"
  heading: string;              // "Overview", "Details", "Action"
  body: string;                 // Descriptive text
  bullets: string[];           // Key points
  fieldLabel?: string;         // Form field label if applicable
  fieldPlaceholder?: string;   // Form field placeholder
}

interface BuildScreenAction {
  id: string;                    // action identifier
  label: string;                // "Continue", "Back", "View Details"
  intent: "next" | "back" | "jump" | "toggle" | "confirm";
  targetIndex?: number;         // Screen index for jump actions
  stateKey?: string;           // State toggle key
}
```

### GeneratedScreen (AI Output)
```typescript
interface GeneratedScreen {
  id: string;                    // e.g., "screen-1"
  screenName: string;
  userAction: string;           // What the user does
  purpose: string;              // What it accomplishes
  plannedUserAction: string;    // From SolutionPlan mapping
  plannedPurpose: string;       // From SolutionPlan mapping
  keySections: string[];        // Section names
  contentTypes: string[];       // ["text", "list", "actions"]
}

interface ScreenGenerationResult {
  screens: GeneratedScreen[];
  navigation: string[];         // Available nav paths
  notes: string[];             // Generation notes
}
```

### Data Transformation Pipeline

```
GeneratedScreen (from AI in Stage 2)
    ↓
buildSections()
├─ Uses: screen.keySections, screen.plannedUserAction, problem context
├─ Outputs: BuildScreenSection[]
├─ Key: Include field labels for forms first section
└─ LIMITATION: `.slice(0, 2)` in BuildWorkspace limits section editing UI
    ↓
buildActions()
├─ Uses: screen index, total screens
├─ Outputs: primaryAction + secondaryActions[]
├─ Primary: "Continue" (next) → "Confirm" (last screen)
└─ Secondary: "Back", "View Details" (toggle)
    ↓
generateBuildScreens()
├─ Calls buildSections() for each GeneratedScreen
├─ Calls buildActions() for each GeneratedScreen
├─ Adds tone prefix, description, chips
└─ Returns: BuildScreen[]
    ↓
hydrateBuildScreens()
├─ Called whenever: controls change, AI chat updates, workflow resets
├─ Maintains: current screen index (with bounds checking)
└─ Output: UI-ready BuildScreen[]
```

### Build Design Controls & Tokens

```typescript
interface BuildDesignControls {
  appStyle: "transactional" | "media" | "hybrid";
  tone: "professional" | "playful" | "premium" | "friendly";
  density: "compact" | "comfortable" | "spacious";
  emphasis: "content" | "actions" | "balanced";
  visualWeight: "light" | "balanced" | "bold";
}

interface BuildDesignTokens {
  spacingScale: "tight" | "standard" | "airy";
  typographyPreset: "neutral" | "expressive" | "luxury" | "approachable";
  hierarchy: "content-led" | "action-led" | "balanced";
  weight: "light" | "balanced" | "bold";
  layoutRhythm: "dense" | "moderate" | "open";
}
```

**Flow**: Controls → Tokens via `buildDesignTokensFromControls()`  
**Application**: Applied to design system via `applyControlsToDesignSystem()`

---

## 4. AI Chat Integration (applyBuildChatPrompt)

### Function Signature
```typescript
applyBuildChatPrompt: (message: string) => Promise<void>
// Location: lib/workflowStore.ts:619
```

### Execution Flow

```
User types message in StageAssistantDock
    ↓
submit(message) → applyBuildChatPrompt(trimmed)
    ↓
Store action: applyBuildChatPrompt
├─ Validate: designSystem exists && generatedScreens.screens.length > 0
├─ Set: isApplyingBuildChat = true
├─ Add: user message to chatHistory
└─ Call: POST /api/generate-screens
    ↓
POST /api/generate-screens
├─ Body includes:
│  ├─ message: trimmed user input
│  ├─ problem: snapshot.problemDiscovery
│  ├─ design: snapshot.designSystem
│  ├─ plannedScreens: mapped from solutionPlan
│  └─ chatInstruction: trimmed (used in prompt)
│
├─ OpenAI API call:
│  ├─ Endpoint: https://api.openai.com/v1/responses
│  ├─ Model: process.env.OPENAI_MODEL (default: gpt-4.1-mini)
│  ├─ Prompt: buildGenerateScreensPrompt() with chat instruction
│  └─ Temperature: 0.2 (low variance, focused outputs)
│
└─ Response parsing:
   ├─ JSON extraction via parseJsonSafe()
   ├─ Normalization via normalizeScreenGeneration()
   └─ Return: WorkflowApiResult<ScreenGenerationResult>
    ↓
Back in Store: applyBuildChatPrompt (continues)
├─ traceGeneratedScreens()
│  └─ Maps AI output back to plannedScreens for consistency
├─ hydrateBuildScreens()
│  └─ Regenerates BuildScreen[] from updated generatedScreens
├─ Update state:
│  ├─ generatedScreens: traced
│  ├─ buildScreens: newly hydrated
│  ├─ buildCurrentScreenIndex: reset to 0
│  ├─ buildNavigationHistory: cleared
│  ├─ buildAiHistory: append message
│  └─ chatHistory: add assistant response
└─ Set: isApplyingBuildChat = false
```

### Prompt Construction

**File**: [lib/screen-generator.ts](lib/screen-generator.ts)  
**Function**: `buildGenerateScreensPrompt(problem, design, plannedScreens, chatInstruction)`

**Structure**:
1. System message: "product flow planner and prototype scaffolding assistant"
2. JSON schema expectation: `{ screens[], navigation[], notes[] }`
3. Rules: "tie to problem", "preserve planned intent", "keep minimal", "apply tone/density"
4. Context: Full problem discovery + design system JSON
5. Chat instruction: Appended as `Chat Instruction: ${chatInstruction || "N/A"}`

**Key Behavior**: The prompt includes planned screens as an "editable checkpoint" - AI refines rather than regenerates from scratch.

---

## 5. Interactive Features & State Management

### Navigation System

```typescript
// buildCurrentScreenIndex: number (0-based)
// buildNavigationHistory: number[] (stack of visited indices)

Navigation Pattern:
├─ goToNextBuildScreen()
│  ├─ Increment: currentIndex = min(currentIndex + 1, maxIndex)
│  ├─ Push: history.push(previous index)
│  └─ Clear: navigationHistory when jumping screens
│
├─ goToPreviousBuildScreen()
│  ├─ Peek history: fromHistory = history[history.length - 1]
│  ├─ Pop from history if exists
│  └─ Fallback: currentIndex - 1
│
├─ setBuildCurrentScreenIndex(index)
│  └─ Direct: bounded within [0, buildScreens.length - 1]
│
└─ triggerBuildAction(action)
   └─ Delegates: applyBuildInteraction() from interaction-engine.ts
```

### UI State

```typescript
// buildUiState: Record<string, boolean>
// Tracks: toggle states, visibility flags, form states

Examples:
├─ `details-${screenName}`: Toggle "View Details" visibility
├─ `showForm`: Form section visibility
├─ `showList`: List section visibility
├─ `showCards`: Card grid visibility
└─ `confirmationComplete`: Completion flag

Action Intent Mapping:
├─ "next" → increment index
├─ "back" → pop from history or decrement
├─ "jump" → set absolute index
├─ "toggle" → flip uiState[stateKey]
└─ "confirm" → set uiState.confirmationComplete = true
```

### Screen Editing State

```typescript
// Local state in BuildWorkspace
// screenEdits: Record<string, ScreenEditState>

interface ScreenEditState {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabels?: Record<string, string>;  // per-action labels
  sectionHeadings?: Record<string, string>;  // per-section titles
  showForm?: boolean;
  showList?: boolean;
  showCards?: boolean;
}

Note: These are LOCAL edits, NOT synced to store (draft state only)
```

### Device Mode Support

```typescript
// Device inference based on screen metadata
function inferDeviceSupport(screen: BuildScreen): { mobile: boolean; desktop: boolean }
├─ Parse: screenName + title + subtitle + description
├─ Mobile hints: "mobile", "onboarding", "checkout", "search", "feed"
├─ Desktop hints: "dashboard", "table", "admin", "analytics", "workspace"
└─ Return: supported viewport modes

Mobile Frame Styling:
├─ Border: slate-900 (thick black bezel)
├─ Notch: Simulated at top
├─ Aspect ratio: Mobile-appropriate
└─ Padding: Reduced (phones have less real estate)
```

### Play Flow Feature

```typescript
// isPlayFlowRunning: boolean (local state in BuildWorkspace)

Behavior:
├─ Start: setBuildCurrentScreenIndex(0) + toggle state
├─ Each screen: 850ms dwell time (useEffect with timer)
├─ Auto-advance: currentIndex++ until last screen
├─ Stop: Manually toggle or reach end
└─ Reset: Go back to start when stopped
```

---

## 6. Design Controls & Token Application

### Controls → Tokens Mapping

```typescript
buildDesignTokensFromControls(controls):
├─ density → spacingScale
│  ├─ "compact" → "tight"
│  ├─ "spacious" → "airy"
│  └─ else → "standard"
├─ tone → typographyPreset
│  ├─ "premium" → "luxury"
│  ├─ "playful" → "expressive"
│  ├─ "friendly" → "approachable"
│  └─ else → "neutral"
├─ emphasis → hierarchy
│  ├─ "actions" → "action-led"
│  ├─ "content" → "content-led"
│  └─ else → "balanced"
├─ visualWeight → weight (pass-through)
└─ density → layoutRhythm
   ├─ "compact" → "dense"
   ├─ "spacious" → "open"
   └─ else → "moderate"
```

### Control Application Flow

```
updateBuildDesignControls(patch) [UI change]
    ↓
applyBuildDesignControls() [User clicks Apply]
    ├─ applyControlsToDesignSystem()
    │  └─ Mutates designSystem typography, spacing, patterns
    ├─ hydrateBuildScreens()
    │  └─ Regenerates BuildScreen[] with new tokens
    └─ Update state:
       ├─ designSystem
       ├─ buildDesignTokens
       ├─ buildScreens (newly generated)
       ├─ buildCurrentScreenIndex (bounded)
       └─ activeDesignCues (for UI display)

resetBuildDesignControls() [User clicks Reset]
    └─ Restore: buildControlsFromDesign(state.designSystem)
```

---

## 7. 2-Screen Limitation & Constraints

### Where Limits Exist

#### 1. **Problem Discovery Prompt Template** ⚠️ FOUND
**File**: [lib/problem-discovery-prompt.ts](lib/problem-discovery-prompt.ts:58)  
**Issue**: Hardcoded example in JSON schema

```typescript
hypothesis: {
  solutionApproach: "string",
  numberOfScreens: 2,  // ← HARDCODED EXAMPLE (line 58)
  screenBreakdown: [...]
}
```

**Impact**: This is only an EXAMPLE in the template JSON - **not a hard limit**. The actual AI response can include any number of screens.

#### 2. **Section Display Limitation** ⚠️ FOUND
**File**: [components/BuildWorkspace.tsx](components/BuildWorkspace.tsx:457)  
**Issue**: Section editing UI limited to first 2 sections

```typescript
{activeScreen.sections.slice(0, 2).map((section) => (
  <div key={section.id} className="space-y-1">
    {/* Section heading editor */}
  </div>
))}
```

**Impact**: Only first 2 section headings are editable in the right panel, but:
- All sections render in the preview ✓
- All sections exist in the data model ✓
- Only the EDITING UI is limited

#### 3. **Layout Patterns Slice**
**File**: [lib/workflowStore.ts](lib/workflowStore.ts:267)  
**Code**: `layoutPatterns: [layoutRhythm, emphasisPattern, ...design.layoutPatterns].slice(0, 4)`

**Impact**: Only keeps 4 layout patterns max (no real limitation for practice).

### Confirmed NO Limits

✅ **Screen Generation**: No enforced limit in `generateBuildScreens()` or `normalizeScreenGeneration()`  
✅ **Screen Navigation**: `buildScreens` array has no hardcoded max length  
✅ **Screen Rendering**: `InteractiveScreenPreview` supports unlimited screens  
✅ **Screen List**: `ScreenListNavigator` renders all screens dynamically  
✅ **API**: OpenAI endpoint supports any number of screens in response  
✅ **Store**: Zustand state management has no array length constraints  

### Summary

**Result**: There is NO enforced 2-screen limit in the codebase. The 2 in the problem discovery prompt is just an EXAMPLE in the JSON template. The `.slice(0, 2)` in BuildWorkspace only affects the section EDITING UI, not the rendering or data.

A user can:
- Define 5+ planned screens in Stage 1
- Generate 5+ screens in Stage 2
- View all screens in the interactive prototype
- Edit section headings only for the first 2 (minor UX limitation)

---

## 8. State Persistence & Data Flow

### Store Architecture (Zustand)

```typescript
// lib/workflowStore.ts
export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  // Current state...
}))
```

**Scope**: In-memory session state only (no localStorage/persistence layer)  
**Lifecycle**: Persists across component re-renders, lost on page refresh

### State Categories

```
Workflow Progression:
├─ currentStage: WorkflowStage (problem-discovery → design → build-iterate → scale)
├─ Stage 1: problemInput, problemDiscovery, solutionPlan
├─ Stage 2: designFiles, referenceUrls, designSystem, generatedScreens
└─ Stage 3: buildScreens, buildCurrentScreenIndex, buildDesignControls, buildDesignTokens

Interactive State (Stage 3 specific):
├─ buildCurrentScreenIndex: number
├─ buildNavigationHistory: number[] (for back button)
├─ buildUiState: Record<string, boolean> (toggles, visibility)
├─ buildAiHistory: string[] (AI chat prompts applied)

AI/Chat State:
├─ chatHistory: ChatMessage[] (user + assistant messages)
├─ isApplyingBuildChat: boolean (loading state)
└─ buildAiHistory: string[] (history of applied prompts)

Design Control State:
├─ buildDesignControls: BuildDesignControls (UI selections)
├─ buildDesignTokens: BuildDesignTokens (derived from controls)
└─ activeDesignCues: DesignCues (display strings)

Redux-like flow:
setCurrentStage(stage) → currentStage = stage
updateBuildDesignControls(patch) → builds tokens → hydrates screens
applyBuildChatPrompt(message) → API call → update generatedScreens → hydrate screens
```

### Design vs. Build State Separation

```
Stage 2 (Design):
├─ Owns: designSystem, generatedScreens, activeDesignCues
├─ Controls: Tone, density, styling direction
├─ UI: DesignWorkspace, DesignDirectionPanel, PreviewCanvas
└─ Chat: refineByChat() → /api/design-chat

Stage 3 (Build):
├─ Owns: buildScreens, buildDesignControls, buildAiHistory
├─ Controls: App style, tone, density, emphasis, weight
├─ UI: BuildWorkspace, InteractiveScreenPreview, ScreenListNavigator
├─ Navigation: buildCurrentScreenIndex, buildNavigationHistory
└─ Chat: applyBuildChatPrompt() → /api/generate-screens
```

**Key Difference**: Stage 2 refines DESIGN DIRECTION; Stage 3 iterates ON THE PROTOTYPE CONTENT

---

## 9. Component Responsibilities & Hierarchy

### Component Tree

```
BuildWorkspace (main orchestrator)
├─ [Left] ScreenListNavigator
│  └─ readOnly: useWorkflowStore(buildScreens, buildCurrentScreenIndex)
│  └─ callback: setBuildCurrentScreenIndex()
│
├─ [Center] InteractiveScreenPreview
│  ├─ readOnly: useWorkflowStore(screens, generatedScreens, tokens, controls)
│  ├─ callbacks:
│  │  ├─ onNavigate: setBuildCurrentScreenIndex()
│  │  ├─ onTriggerAction: triggerBuildAction()
│  │  └─ (local state for screen-specific edits)
│  └─ features:
│     ├─ Domain-specific content rendering (food, commerce, booking, etc.)
│     ├─ Mobile/desktop device frames
│     ├─ Annotations toggle (design labels)
│     ├─ Section rendering (hero, form, list, cards)
│     └─ Button interaction with visual feedback
│
├─ [Right Top] View Modes Toggles
│  ├─ showDesignInsights → display Design Insights panel
│  └─ showAnnotations → toggle annotation labels
│
├─ [Right Middle] Design Insights Panel (conditional)
│  └─ display: controls, tokens, design reasoning
│
├─ [Right Bottom] Design Controls Panel (scrollable)
│  ├─ controls: appStyle, tone, density, emphasis, visualWeight
│  ├─ buttons: Apply, Reset
│  └─ callbacks: updateBuildDesignControls(), applyBuildDesignControls()
│
└─ PlayFlow Controls (bottom center)
   ├─ Play Flow / Stop Flow toggle
   └─ Share Prototype button

StageAssistantDock (floating dock, bottom-right)
├─ Position: fixed, z-index: 40
├─ Visibility: Only shows in design or build-iterate stages
├─ readOnly: useWorkflowStore(currentStage, chatHistory, isApplying)
├─ callbacks:
│  ├─ Stage 2: refineByChat()
│  └─ Stage 3: applyBuildChatPrompt()
└─ features:
   ├─ Message input
   ├─ Chat history display (last 6 messages)
   ├─ Quick prompt buttons
   └─ Minimize/expand toggle
```

### InteractiveScreenPreview Props

```typescript
interface InteractiveScreenPreviewProps {
  screen: BuildScreen;
  deviceMode: "mobile" | "desktop";
  currentIndex: number;
  onNavigate: (index: number) => void;
  onTriggerAction: (action: BuildScreenAction) => void;
  actionTargetOverrides: Record<string, number>;  // flow customization
  edit: ScreenEditState;                          // local draft edits
  uiState: Record<string, boolean>;               // toggles
  showAnnotations: boolean;
}
```

---

## 10. Current Architecture Strengths

✅ **Scalable Data Model**: No hardcoded screen limits; supports N screens  
✅ **Reactive State Management**: Zustand enables efficient updates  
✅ **Modular Components**: Each component has single responsibility  
✅ **AI Integration**: Seamless chat-to-prompt-to-regeneration pipeline  
✅ **Interactive Preview**: Realistic rendering with domain-aware content  
✅ **Navigation State**: Proper history tracking for back button behavior  
✅ **Design Controls**: Live feedback from control changes to rendered screens  
✅ **Device Flexibility**: Mobile/desktop preview modes with smart inference  
✅ **Type Safety**: Full TypeScript coverage for data models

---

## 11. Architecture Improvement Opportunities

### 1. **Section Editing Limitation** (QUICK FIX)
**Problem**: Only first 2 sections editable in control panel  
**Location**: [components/BuildWorkspace.tsx](components/BuildWorkspace.tsx:457)  
**Fix**: Remove `.slice(0, 2)` or implement scrollable section editor  
**Impact**: Low-risk, cosmetic improvement

```typescript
// Before:
{activeScreen.sections.slice(0, 2).map(...)}

// After:
{activeScreen.sections.map(...)}  // or with max-height + overflow
```

### 2. **Draft State Persistence**
**Problem**: Local screenEdits state lost on component remount  
**Current**: Entirely local to BuildWorkspace  
**Improvement**: Sync to store as `buildScreenEdits: Record<string, ScreenEditState>`  
**Impact**: Enable "save draft" feature, undo/redo capabilities

### 3. **Flow Map Visualization**
**Problem**: Current flow mapping is implicit (via action targetIndex overrides)  
**Current**: `flowMap: Record<string, number>` only in UI state  
**Improvement**: 
- Add `buildScreenFlow: Record<string, BuildScreenAction>` to store
- Create visual flow diagram component
- Enable flow export/sharing

### 4. **AI History & Iteration Tracking**
**Strength**: `buildAiHistory: string[]` tracks prompts  
**Improvement**:
- Add snapshot history: `buildIterationSnapshots: { prompt: string, screens: BuildScreen[], timestamp: number }[]`
- Enable "revert to iteration N"
- Show before/after diffs

### 5. **State Persistence (localStorage)**
**Problem**: All state lost on page refresh  
**Solution**: Add middleware to workflowStore
```typescript
import { persist } from 'zustand/middleware'

export const useWorkflowStore = create<WorkflowStore>(
  persist(
    (set, get) => ({...}),
    { name: 'fieldkit-workflow' }
  )
)
```
**Note**: Be selective - don't persist file uploads, only key decisions

### 6. **Separate Display State from Edit State**
**Current**: BuildWorkspace manages both build screens AND local edits  
**Improvement**: Create `useScreenEditStore` for local edits  
**Benefit**: Cleaner separation, easier testing, reusable edit panels

### 7. **Interactive Action Refinement**
**Current**: Actions hardcoded by screen index (next/back/jump)  
**Improvement**: 
- Visual flow editor where user can drag-wire screen connections
- "Condition" support (next if X, alternative if Y)
- Action payload customization

### 8. **Performance Optimization**
**Current**: `hydrateBuildScreens()` regenerates ALL screens on any control change  
**Improvement**: 
- Memoize screen generation results
- Only regenerate screens that depend on changed controls
- Use `useMemo()` for derived state

### 9. **Error Boundary & Fallback UI**
**Current**: API errors show error text only  
**Improvement**: 
- Add error boundary component
- Graceful degradation when AI returns invalid JSON
- User-friendly error messages with recovery actions

### 10. **Testing Infrastructure**
**Gap**: No visible test coverage for state transformations  
**Improvement**:
- Unit tests for `generateBuildScreens()`, `applyBuildInteraction()`
- Integration tests for `applyBuildChatPrompt()` flow
- Component tests with Mock store states

---

## 12. Data Flow Example: Complete User Journey

### Scenario: User refines prototype via AI chat

```
1. User enters Stage 3 (build-iterate)
                ↓
   BuildWorkspace.useEffect: calls initializeBuildWorkspace()
                ↓
   hydrateBuildScreens() called with current state
                ↓
   buildScreens = generateBuildScreens({
     generatedScreens: [GeneratedScreen from Stage 2],
     problemDiscovery: [from Stage 1],
     solutionPlan: [from Stage 1],
     designSystem: [from Stage 2],
     controls: [Build Design Controls],
     tokens: [derived from controls]
   })
                ↓
   Dispatch: set({ buildScreens, buildCurrentScreenIndex: 0 })
                ↓
2. UI renders (ScreenListNavigator, InteractiveScreenPreview, right panel)

3. User views screen 1, clicks buttons, navigates around
                ↓
   triggerBuildAction(primaryAction)
                ↓
   applyBuildInteraction() → updates state
                ↓
   setBuildCurrentScreenIndex(newIndex)
                ↓
   Re-render preview with new screen

4. User adjusts Design Controls (e.g., tone: professional → premium)
                ↓
   updateBuildDesignControls({ tone: "premium" })
                ↓
   Dispatch: set({ buildDesignControls: new })

5. User clicks "Apply"
                ↓
   applyBuildDesignControls()
                ↓
   applyControlsToDesignSystem(designSystem, controls)
                ↓
   designSystem.typography.style = "Refined editorial hierarchy"
                ↓
   hydrateBuildScreens() regenerates all BuildScreen[] with new tokens
                ↓
   set({ buildScreens, designSystem, buildDesignTokens })
                ↓
   UI updates with new styling, tone prefix changes, etc.

6. User wants AI to "make this more premium"
                ↓
   Enters message in StageAssistantDock
                ↓
   applyBuildChatPrompt("make this more premium")
                ↓
   set({ isApplyingBuildChat: true, chatHistory: [..., userMsg] })
                ↓
   POST /api/generate-screens {
     message: "make this more premium",
     problem: problemDiscovery,
     design: designSystem,
     plannedScreens: [...],
     chatInstruction: "make this more premium"
   }
                ↓
   OpenAI Responses API (model: gpt-4.1-mini, temperature: 0.2)
                ↓
   Response: ScreenGenerationResult JSON
   {
     screens: [
       {
         id: "screen-1",
         screenName: "Premium Dashboard",
         ... (refined for premium tone)
       },
       ...
     ]
   }
                ↓
   normalizeScreenGeneration(response)
                ↓
   traceGeneratedScreens(normalized, plannedScreens)
   // Maps revised screens back to original planned intent
                ↓
   hydrateBuildScreens({ generatedScreens: traced })
                ↓
   set({
     generatedScreens: traced,
     buildScreens: newly hydrated,
     buildAiHistory: [..., "make this more premium"],
     chatHistory: [..., assistantMsg],
     isApplyingBuildChat: false
   })
                ↓
7. UI updates: screens now refined, status message shown in dock
```

---

## 13. Key Files Reference

### Essential Reads (in order)
1. [types/index.ts](types/index.ts) - Data model definitions
2. [lib/workflowStore.ts](lib/workflowStore.ts#L619) - `applyBuildChatPrompt` implementation
3. [lib/screen-generator.ts](lib/screen-generator.ts) - Prompt generation & parsing
4. [lib/screen-content-generator.ts](lib/screen-content-generator.ts) - BuildScreen generation
5. [components/BuildWorkspace.tsx](components/BuildWorkspace.tsx) - Main UI orchestration
6. [components/InteractiveScreenPreview.tsx](components/InteractiveScreenPreview.tsx) - Rendering logic
7. [lib/interaction-engine.ts](lib/interaction-engine.ts) - Navigation state machine

### Configuration
- [app/api/generate-screens/route.ts](app/api/generate-screens/route.ts) - API endpoint
- `.env` (not visible) - `OPENAI_API_KEY`, `OPENAI_MODEL`

---

## 14. Appendix: Component Props & Functions

### BuildWorkspace Key Functions
```typescript
// Initialization
useEffect(() => { initializeBuildWorkspace() }, [])

// Navigation
setBuildCurrentScreenIndex(index: number)
triggerBuildAction(action: BuildScreenAction)

// Design Controls
updateControls(patch: Partial<BuildDesignControls>)
applyControls() // calls applyBuildDesignControls
resetControls() // calls resetBuildDesignControls

// UI State
setShowDesignInsights(boolean)
setShowAnnotations(boolean)
setIsPlayFlowRunning(boolean)
updateScreenEdit(patch: Partial<ScreenEditState>)
```

### InteractiveScreenPreview Key State
```typescript
const [selectedItem, setSelectedItem] = useState<number | null>(null)
const [formValue, setFormValue] = useState("")
const [lastActionId, setLastActionId] = useState<string | null>(null)
```

### Rendering Logic
```typescript
domain = inferDomain(screen)
items = domainListItems(domain)
subtitle = domainCardSubtitle(domain)
labelText = domainInputLabel(domain)

// Renders different content based on domain
// e.g., food domain → restaurant-specific list items
// e.g., commerce domain → product-specific content
```

---

## 15. Summary

**Stage 3** is a well-architected interactive prototype layer that:
- Transforms AI-generated screens into clickable prototypes
- Supports unlimited screens (no hardcoded 2-screen cap)
- Enables real-time refinement via AI chat
- Provides realistic device simulation
- Integrates seamlessly with Stage 1 (problem) and Stage 2 (design)

**Key insight**: The 2 in the problem discovery prompt is cosmetic; the real limitation (`.slice(0, 2)`) only affects the section EDITING UI in the right panel, not the rendering.

**Next Steps**: Consider the 10 improvement opportunities for enhanced UX, persistence, and developer experience.
