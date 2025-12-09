# 🎨 PEMIRA UNIWA - High-Fidelity Design System

Premium design system dengan motion guidelines lengkap untuk aplikasi voting PEMIRA UNIWA.

## 📐 Design Tokens

### Typography Scale

```css
Display Title:    32px (2rem) - Poppins Bold
Headline:         24px (1.5rem) - Poppins Semibold  
Title:            20px (1.25rem) - Poppins Semibold
Body:             16px (1rem) - Inter Regular
Body Small:       15px (0.9375rem) - Inter Regular
Caption:          13px (0.8125rem) - Inter Regular
Caption Small:    12px (0.75rem) - Inter Regular
```

**Font Families:**
- Display/Headers: `Poppins`
- Body/UI: `Inter`
- Monospace: `JetBrains Mono` / `Courier New`

### Color Palette

**Primary (Indigo):**
```css
--color-primary:         #4F46E5  /* Main brand */
--color-primary-hover:   #4338CA  /* Hover state */
--color-primary-pressed: #3730A3  /* Active state */
--color-primary-soft:    #EEF2FF  /* Background tint */
--color-primary-glow:    rgba(79, 70, 229, 0.35) /* Shadow */
```

**Semantic Colors:**
```css
Success:  #16A34A  (Green)
Warning:  #FACC15  (Yellow)
Error:    #DC2626  (Red)
```

**Neutral Scale:**
```css
900 (Darkest):  #0F172A
700:            #334155
500:            #64748B
300:            #CBD5E1
100:            #F1F5F9
50 (Lightest):  #F8FAFC
Surface:        #FFFFFF
```

### Spacing System

```css
XS:   4px   (0.25rem)
S:    8px   (0.5rem)
M:    16px  (1rem)
L:    24px  (1.5rem)
XL:   32px  (2rem)
XXL:  48px  (3rem)
XXXL: 64px  (4rem)
```

### Elevation (Shadows)

```css
Level 1 (Cards):           0 2px 8px rgba(0,0,0,0.05)
Level 2 (Hover):           0 6px 20px rgba(0,0,0,0.08)
Level 3 (Modal):           0 12px 32px rgba(0,0,0,0.12)
Button Hover (Primary):    0 4px 12px rgba(79,70,229,0.35)
Success:                   0 8px 20px rgba(22,163,74,0.25)
```

### Border Radius

```css
Small:     8px   (0.5rem)
Medium:    12px  (0.75rem)
Large:     16px  (1rem)
XL:        20px  (1.25rem)
2XL:       28px  (1.75rem) - Scanner window
Full:      9999px (Circular)
```

## 🎬 Animation Guidelines

### Duration Scale

```css
Fast:       120ms  - Instant feedback
Normal:     220ms  - Standard transitions
Slow:       320ms  - Smooth animations
Slower:     420ms  - Page transitions
Animation:  600ms  - Entry animations
```

### Easing Functions

```css
Ease Out:     cubic-bezier(0.16, 1, 0.3, 1)      /* Smooth deceleration */
Ease Spring:  cubic-bezier(0.34, 1.56, 0.64, 1)  /* Spring bounce */
Ease Smooth:  cubic-bezier(0.4, 0, 0.2, 1)       /* Material Design */
```

### Transform Tokens

```css
Lift Hover:    translateY(-2px)
Lift Active:   translateY(-4px)
Scale Tap:     scale(0.96)
Scale Grow:    scale(1.02)
```

## 🎯 Component Patterns

### Button States

#### Primary Button
```css
Default:
  background: #4F46E5
  color: white
  border-radius: 12px
  padding: 16px 24px
  
Hover:
  background: #4338CA
  transform: translateY(-2px)
  box-shadow: 0 4px 12px rgba(79,70,229,0.35)
  transition: 220ms cubic-bezier(0.16, 1, 0.3, 1)
  
Active (Tap):
  background: #3730A3
  transform: scale(0.96)
  transition: 120ms
```

#### Secondary Button
```css
Default:
  background: transparent
  border: 2px solid #CBD5E1
  color: #64748B
  
Hover:
  border-color: #94A3B8
  background: #F1F5F9
  transform: translateY(-2px)
```

### Card Component
```css
Default:
  background: white
  border: 2px solid #E2E8F0
  border-radius: 16px
  box-shadow: 0 2px 8px rgba(0,0,0,0.05)
  
Hover:
  border-color: #4F46E5
  box-shadow: 0 6px 20px rgba(0,0,0,0.08)
  transform: translateY(-4px)
  transition: 220ms cubic-bezier(0.16, 1, 0.3, 1)
  
Selected:
  border-color: #4F46E5
  background: #EEF2FF
  box-shadow: 0 4px 12px rgba(79,70,229,0.35)
```

### Modal Overlay
```css
Backdrop:
  background: rgba(15, 23, 42, 0.6)
  backdrop-filter: blur(4px)
  animation: fadeIn 220ms

Modal Card:
  background: white
  border-radius: 20px
  padding: 48px
  box-shadow: 0 12px 32px rgba(0,0,0,0.12)
  animation: scaleIn 320ms cubic-bezier(0.34, 1.56, 0.64, 1)
  
Entry Animation:
  from: scale(0.92), opacity: 0
  to:   scale(1), opacity: 1
```

## 📱 Page-Specific Motion

### 1. Voting Online Page

#### Page Load Sequence
```
1. Header (Display Title)     - slideUp 600ms, delay 0ms
2. Countdown Badge             - scaleIn 320ms, delay 200ms
3. Candidate Cards (staggered) - slideUp 600ms, delay 100ms each
```

#### Candidate Card Interaction
```css
Hover:
  - Border color change: 220ms
  - Top accent bar: scaleX(0 → 1) 320ms
  - Photo zoom: scale(1 → 1.05) 420ms
  - Lift: translateY(-4px) 220ms
  
Click:
  - Scale tap: scale(0.96) 120ms
  - Ripple effect from click point
  - Trigger confirmation modal
```

#### Confirmation Modal
```css
Entry:
  1. Overlay fade-in: 220ms
  2. Modal scale-in: 320ms spring
  3. Icon pulse: 2s infinite
  4. Content slide-up: 300ms, staggered
  
Exit:
  - Fade-out: 220ms
  - Scale-down: 220ms
```

### 2. QR Scanner Page

#### Camera Viewfinder
```css
Scanner Border:
  animation: borderPulse 2.2s infinite
  - Color: #4F46E5 → #818CF8 → #4F46E5
  - Glow: 0px → 4px → 0px
  
Scanning Beam:
  animation: scanLine 3s ease-in-out infinite
  - Position: top → bottom
  - Opacity: 0.4
  - Blur: 8px
```

#### QR Detection State
```css
Transition (150ms):
  1. Border → green (#16A34A)
  2. Pulse animation (0.6s)
  3. Haptic vibration (mobile)
  4. Status text change
  5. Scale-in confirmation: 320ms spring
```

#### Confirmation Screen
```css
Entry Sequence:
  1. Slide-up full screen: 420ms
  2. Success checkmark: scale bounce 600ms
  3. Content stagger: 100ms between items
  4. Warning box: slide-up 420ms
  5. Buttons: slide-up 420ms
```

### 3. Election Results Page

#### Hero Section
```css
Entry:
  1. Background gradient fade: 600ms
  2. Trophy icon: checkmark + float animation
  3. Text slide-up (staggered): 
     - Label: 100ms delay
     - Name: 200ms delay
     - Votes: 300ms delay
```

#### Vote Bars Animation
```css
Bar Growth:
  animation: barGrow 1.2s cubic-bezier(0.65, 0, 0.35, 1)
  from: width 0%
  to:   width [final %]
  
Winner Bar:
  - Green gradient
  - Glow effect: 0 0 24px rgba(22,163,74,0.25)
  - Pulse after growth: 2s infinite, delay 1.5s
  
Number Counter:
  - Count-up animation: 1.5s ease-out
  - From: 0
  - To: actual value
```

#### Faculty Cards (Heatmap)
```css
Grid Entry:
  - Staggered fade-in: 600ms
  - Delay: 60ms per card
  
Hover:
  - Lift: translateY(-2px) 220ms
  - Top accent bar: scaleX(0 → 1) 320ms
  - Tooltip fade-in: 220ms
```

#### Download Button
```css
Hover:
  - Lift: translateY(-4px) 220ms
  - Ripple: circle expand from center
  - Shadow: elevation increase
  
Click:
  - Scale tap: scale(0.96) 120ms
  - Ripple complete
  - Trigger download
```

## 🎨 Special Effects

### Ripple Effect (Button)
```css
::before pseudo-element
position: absolute center
width/height: 0 → 400px
border-radius: 50%
background: rgba(255,255,255,0.3)
transition: 320ms ease-out
```

### Glow Pulse Animation
```css
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(79,70,229,0.35);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(79,70,229,0.35);
  }
}
duration: 2s
iteration: infinite
```

### Shimmer Effect (Loading)
```css
background: linear-gradient(
  90deg,
  transparent 0%,
  rgba(255,255,255,0.2) 50%,
  transparent 100%
)
background-size: 200% 100%
animation: shimmer 2s linear infinite

@keyframes shimmer {
  0% { background-position: -100% 0 }
  100% { background-position: 200% 0 }
}
```

### Confetti Burst (Success)
```css
8 particles
Initial: center point
Animation: 
  - translateY(0 → 100px)
  - rotate(0 → 360deg)
  - opacity(1 → 0)
Duration: 2s
Stagger delay: 100ms each
```

## 📐 Layout Grid

### Desktop (> 968px)
```
Container: 1080px max-width
Columns: 12-column grid
Gutter: 24px
Margin: auto (centered)
```

### Tablet (768px - 968px)
```
Container: 100% with padding
Columns: 8-column grid
Gutter: 16px
Margin: 24px
```

### Mobile (< 768px)
```
Container: 100% with padding
Columns: 4-column grid
Gutter: 12px
Margin: 16px
```

## ♿ Accessibility

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus States
```css
All interactive elements:
  outline: 3px solid #4F46E5
  outline-offset: 2px
  border-radius: 4px
```

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements meet AAA standards (7:1)

## 🚀 Performance

### Will-Change Properties
```css
.card, .button, .modal {
  will-change: transform;
}

.photo, .video {
  will-change: transform;
}
```

### Hardware Acceleration
```css
Use transform instead of top/left:
✅ transform: translateY(-4px)
❌ top: -4px

Use opacity instead of visibility:
✅ opacity: 0
❌ visibility: hidden
```

### Debouncing
- Scroll events: debounce 150ms
- Resize events: debounce 250ms
- Input events: debounce 300ms

## 📦 Implementation Files

```
src/styles/
├── tokens.css              - Design tokens & keyframes
├── VotingOnlineHiFi.css    - Voting page styles
├── ScannerHiFi.css         - QR Scanner styles
└── ResultsHiFi.css         - Results page styles
```

## 🎯 Quality Checklist

- [ ] All animations use CSS transforms (not top/left)
- [ ] Reduced motion media query implemented
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets minimum 44x44px (mobile)
- [ ] Hover states not applied on touch devices
- [ ] Loading states for all async actions
- [ ] Success/error feedback for all submissions
- [ ] Consistent spacing using token system
- [ ] Typography scale applied correctly
- [ ] Elevation hierarchy clear
- [ ] Button states follow pattern

---

**Design Version:** 1.0.0  
**Last Updated:** 2024-11-25  
**Design Lead:** PEMIRA UNIWA Team
