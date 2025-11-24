# 🎬 PEMIRA UNIWA - Motion Design Guidelines

Visual reference untuk semua animasi dan microinteractions dalam aplikasi voting.

## 📊 Animation Timeline Reference

### Voting Online - Page Load Sequence

```
TIME    ELEMENT                 ANIMATION           EASING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0ms     Header                  slideUp             ease-out
                                opacity 0→1
                                translateY 12px→0

200ms   Countdown Badge         scaleIn             spring
                                scale 0.92→1
                                opacity 0→1

400ms   Card 1                  slideUp             ease-out
                                + stagger delay

500ms   Card 2                  slideUp             ease-out
                                + stagger delay

600ms   Card 3                  slideUp             ease-out
                                + stagger delay
```

### QR Scanner - Continuous Animations

```
ELEMENT              LOOP        DURATION    DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scanner Border       infinite    2.2s        Pulse glow
                                            #4F46E5 ↔ #818CF8

Scanning Beam        infinite    3s          Vertical sweep
                                            top → bottom

Corner Markers       static      -           Fixed position

Status Badge         infinite    1.5s        Icon pulse
                                            (searching state)
```

### Election Results - Bar Animation

```
TIME        ELEMENT                  STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0ms         Bar (width 0%)          ░░░░░░░░░░░░░░░░░░░░
            Counter: 0

600ms       Bar growing             ████████░░░░░░░░░░░░
            Counter: counting up

1200ms      Bar complete            ████████████████████
            Counter: final value
            
1500ms      Winner bar only         ████████████████████
            Pulse glow starts       ↓ glow effect ↓

continuous  Winner bar              ████████████████████
            Pulse loop              ↑ 2s infinite ↑
```

## 🎯 Interaction States

### Button States (Timeline)

```
STATE           DURATION    TRANSFORM                   COLOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Default         -           scale(1)                    #4F46E5
                           translateY(0)

Hover           220ms       translateY(-2px)            #4338CA
                           + shadow elevation

Active (down)   120ms       scale(0.96)                 #3730A3
                           + shadow reduce

Release         120ms       back to hover state         #4338CA

Blur            220ms       back to default             #4F46E5
```

### Card Hover Sequence

```
TIME    PROPERTY            VALUE CHANGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0ms     border-color        #E2E8F0 → #4F46E5
        box-shadow          level-1 → level-2
        transform           translateY(0) → translateY(-4px)

220ms   all complete        (hold hover state)

0ms     photo               scale(1) → scale(1.05)
        (child element)

420ms   photo complete      (hold at 1.05)

0ms     accent bar          scaleX(0) → scaleX(1)
        (::before)          transform-origin: left

320ms   accent complete     (full width)
```

## 🎨 Visual Effects

### Ripple Effect (Click/Tap)

```
Frame-by-Frame:

FRAME 1 (0ms)                FRAME 2 (80ms)              FRAME 3 (160ms)
┌────────────────┐          ┌────────────────┐         ┌────────────────┐
│                │          │                │         │                │
│    [Button]    │          │    [Button]    │         │    [Button]    │
│        ●       │          │       ⚬⚬       │         │      ⚬⚬⚬⚬      │
│                │          │                │         │                │
└────────────────┘          └────────────────┘         └────────────────┘

FRAME 4 (240ms)              FRAME 5 (320ms)
┌────────────────┐          ┌────────────────┐
│                │          │                │
│    [Button]    │          │    [Button]    │
│    ⚬⚬⚬⚬⚬⚬⚬    │          │  ⚬⚬⚬⚬⚬⚬⚬⚬⚬⚬  │
│                │          │   (fade out)    │
└────────────────┘          └────────────────┘
```

### Scanner Beam Movement

```
Position Over Time (3s loop):

T=0s          T=0.75s        T=1.5s         T=2.25s        T=3s
┌─────┐       ┌─────┐        ┌─────┐        ┌─────┐        ┌─────┐
│─────│       │     │        │     │        │     │        │─────│
│     │       │─────│        │     │        │     │        │     │
│     │       │     │        │─────│        │     │        │     │
│     │       │     │        │     │        │─────│        │     │
└─────┘       └─────┘        └─────┘        └─────┘        └─────┘
  Top          1/4            Mid            3/4             Top
```

### Glow Pulse Effect

```
Shadow Intensity Over Time (2s loop):

  Intensity
    ▲
8px │    ╱╲
    │   ╱  ╲
4px │  ╱    ╲      ╱╲
    │ ╱      ╲    ╱  ╲
0px │╱        ╲  ╱    ╲___
    └──────────────────────▶ Time
     0s   0.5s   1s   1.5s  2s
```

## 🔄 State Transitions

### Modal Lifecycle

```
1. TRIGGER (Button Click)
   ↓
   [120ms] Button scale-down
   ↓
2. OVERLAY APPEAR
   ↓
   [220ms] Backdrop fade-in + blur
   ↓
3. MODAL ENTER
   ↓
   [320ms] Modal scale-in (spring)
   ↓
4. CONTENT REVEAL
   ↓
   [300ms] Content stagger (each item 100ms)
   ↓
5. IDLE STATE
   ↓
   User interaction...
   ↓
6. MODAL EXIT
   ↓
   [220ms] Fade-out
   ↓
7. BACKDROP REMOVE
   ↓
   [220ms] Backdrop fade-out
   ↓
8. COMPLETE
```

### QR Detection Flow

```
1. SCANNING STATE
   │
   ├─ Border: pulse animation (loop)
   ├─ Beam: scan line moving (loop)
   └─ Status: "Mencari QR..." (pulse icon)
   │
   ↓ [QR Code Detected]
   │
2. DETECTION MOMENT (150ms)
   │
   ├─ Border: green + short pulse
   ├─ Beam: fade out
   ├─ Vibration: haptic feedback
   └─ Status: "QR Terdeteksi!" + checkmark
   │
   ↓
3. TRANSITION TO CONFIRMATION (320ms)
   │
   ├─ Camera fade out
   ├─ Confirmation slide-in (spring)
   └─ Content reveal (stagger)
   │
   ↓
4. CONFIRMATION STATE
```

## 📱 Mobile-Specific Interactions

### Touch Feedback

```
INTERACTION     VISUAL                      HAPTIC          DURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tap Start       scale(0.96)                light           50ms
                no delay

Tap Release     scale(1)                   -               120ms
                spring back

Long Press      scale(0.94)                medium          200ms
                continuous hold

Successful      scale(1) + green           success         150ms
Action          checkmark appear           (strong)

Error           shake animation            error           300ms
                translateX(-2→2→-2→0)      (double)
```

### Swipe Gestures

```
DIRECTION       THRESHOLD       ACTION              ANIMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swipe Right     > 100px         Go Back             slide-right 220ms
                velocity > 0.5

Swipe Left      > 100px         Next (if avail)     slide-left 220ms
                velocity > 0.5

Swipe Down      > 150px         Dismiss Modal       slide-down 320ms
                velocity > 0.8

Pull Down       > 80px          Refresh             spinner 600ms
                (top of scroll)
```

## 🎯 Animation Performance Tips

### GPU Acceleration Properties

```css
✅ GOOD (GPU-accelerated):
- transform: translate3d()
- transform: scale()
- transform: rotate()
- opacity
- filter (with caution)

❌ AVOID (triggers layout):
- top / left / right / bottom
- width / height
- margin / padding
- border-width
```

### Optimization Rules

```
1. Use transform instead of position
   ✅ transform: translateY(-4px)
   ❌ top: -4px

2. Use opacity instead of visibility
   ✅ opacity: 0
   ❌ visibility: hidden; display: none

3. Use will-change for complex animations
   ✅ will-change: transform
   ⚠️ Don't overuse (memory intensive)

4. Debounce scroll/resize handlers
   ✅ _.debounce(handler, 150)
   ❌ Direct event listener

5. Use CSS animations over JS when possible
   ✅ @keyframes + animation
   ❌ setInterval() RAF
```

## 📏 Motion Intensity Scale

```
INTENSITY   DURATION    USE CASE                        EXAMPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Instant     120ms       Button feedback                 Click response
                       Immediate actions               Toggle switch

Quick       220ms       Standard transitions            Hover states
                       UI state changes                Card expand

Smooth      320ms       Modal/overlay transitions       Modal open
                       Complex state changes           Panel slide

Slow        420ms       Page transitions                Page change
                       Dramatic reveals                Hero entrance

Animation   600ms       Entry animations                Page load
                       Success celebrations            Confetti burst
```

## 🎨 Easing Functions Visual

```
Linear:
│     ╱
│   ╱
│ ╱
└──────

Ease-out (Recommended):
│╱
│
│
└──────

Ease-spring:
│  ╱╲
│╱    ╲_
│
└──────

Ease-in-out:
│    ╱
│  ╱
│╱
└──────
```

## ✅ Animation Checklist

Before implementing any animation, check:

- [ ] Duration appropriate for action importance
- [ ] Easing function matches motion type
- [ ] Works smoothly at 60fps
- [ ] Reduced motion alternative provided
- [ ] GPU-accelerated properties used
- [ ] No layout thrashing
- [ ] Haptic feedback on mobile (if applicable)
- [ ] Loading states for async actions
- [ ] Success/error feedback provided
- [ ] Tested on low-end devices

---

**Motion Design Version:** 1.0.0  
**Last Updated:** 2024-11-25  
**Motion Designer:** PEMIRA UNIWA Team
