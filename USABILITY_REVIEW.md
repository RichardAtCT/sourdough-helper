# Usability Review: Sourdough Helper
**Date**: 2025-11-11

## Critical Usability Issues

### 1. Loss of Progress on Page Refresh
**Problem**: Step completion checkboxes and active timers are not persisted to localStorage
- Users lose all progress if they accidentally refresh or close the tab
- Active timers are lost completely

**Recommendation**:
- Persist `completedSteps` and `activeTimers` to localStorage for each component
- Show a warning before page unload if timers are active

### 2. Timer Management Challenges
**Problems**:
- No central view of all active timers across steps
- No visual notification when timers complete (audio only)
- No way to see timer status without scrolling to that specific step
- Timers can't be paused

**Recommendations**:
- Add a "sticky" timer summary bar that shows all active timers
- Add visual notifications (flash, color change, browser notification API)
- Add pause/resume functionality
- Add timer sound preview/volume control

### 3. Accessibility Barriers
**Problems**:
- No ARIA labels on interactive elements
- Icon buttons lack text alternatives
- Checkbox buttons for step completion have no accessible labels
- No keyboard shortcuts
- Color is the only indicator for some states

**Recommendations**:
- Add `aria-label` to all icon buttons
- Add `role="checkbox"` and `aria-checked` to step completion buttons
- Ensure all interactive elements are keyboard accessible
- Add skip navigation links
- Test with screen readers

---

## High Priority UX Improvements

### 4. Recipe Scaling Confusion
**Problem**:
- No indication of final yield (number of loaves, total weight already shown but could be more prominent)
- Scale slider shows decimals (0.5, 0.75, 1.25) which may confuse users
- Doesn't explain what "1x" means in real-world terms

**Recommendations**:
- Add clear yield indicator: "Makes 1 large loaf (958g)"
- Add quick-select buttons: "Half Recipe", "Standard", "Double"
- Show approximate servings or loaf count

### 5. Timeline Calculator Issues
**Problem**:
- Timeline is static and doesn't update based on actual progress
- Hidden until start time is entered
- Times are hardcoded and may not match reality

**Recommendations**:
- Make timeline visible by default with "suggested" times
- Update timeline based on when timers actually complete
- Add ability to adjust timeline estimates
- Show current step highlight in timeline

### 6. Mobile Experience Gaps
**Problems**:
- Tab names are long and may wrap on small screens ("Bulk Fermentation Calculator")
- Multiple sliders may be difficult to adjust on touch devices
- Timer buttons could be too small for touch targets (should be 44x44px minimum)

**Recommendations**:
- Use abbreviated tab names on mobile: "Bread", "Focaccia", "Calculator"
- Increase touch target sizes
- Stack controls vertically on mobile
- Add swipe gestures between tabs

---

## Medium Priority Enhancements

### 7. Visual Feedback and Guidance
**Problems**:
- No progress indicator showing how far through the recipe
- No visual distinction between completed and current step
- Hydration percentages (78-84%) lack context for beginners

**Recommendations**:
- Add overall progress bar: "Step 3 of 6"
- Highlight current/next uncompleted step
- Add visual examples: "78% = Firmer, crackly crust" with images
- Add photos/illustrations for key techniques

### 8. Fermentation Calculator User Experience
**Problems**:
- Temperature slider range changes with unit but feels inconsistent
- "Extrapolated results" warning is buried
- No way to compare multiple scenarios

**Recommendations**:
- Keep consistent slider behavior; just convert display
- Make warnings more prominent (icon in results area)
- Add "Save Calculation" or comparison feature
- Add preset scenarios: "Cool Kitchen", "Warm Kitchen", "Proofing Box"

### 9. Focaccia Customization
**Problems**:
- Complex calculations aren't explained
- Yeast reduction formula is hidden
- No guidance on choosing fermentation time

**Recommendations**:
- Add tooltip explaining yeast calculation
- Add guidance: "12-16h: Weeknight | 24h: Weekend | 48-72h: Maximum flavor"
- Show what the dough should look like at each stage

### 10. Data Persistence Strategy
**Problems**:
- Preferences saved but recipe-specific data is not
- No way to save favorite recipes or settings
- Can't create custom recipes

**Recommendations**:
- Save state for each tab separately in localStorage
- Add "Save My Settings" feature
- Add recipe export/import (JSON or shareable URL)
- Add "Recent Calculations" for fermentation calculator

---

## Nice-to-Have Features

### 11. Enhanced Functionality
- **Print Mode**: Clean printable version without timers/controls
- **Shopping List**: Generate ingredient list with checkboxes
- **Unit Conversion**: Add volume measures (cups) for US users
- **Notes Field**: Let users add custom notes to each step
- **History**: Save previous bakes with dates and results
- **Notifications**: Browser notifications for timers (with permission)

### 12. Educational Enhancements
- **Technique Videos**: Link to video demonstrations for key steps
- **Troubleshooting Guide**: "Dough too sticky?" section
- **Glossary**: Explain terms like "autolyse", "oven spring", "banneton"
- **Visual Indicators**: Photos showing proper dough consistency at each stage
- **FAQ Section**: Common questions consolidated

### 13. Content & Layout
- **Ingredient Substitutions**: "Can I use whole wheat?" section
- **Collapsible Sections**: Hide completed steps or long instructions
- **Dark Mode**: Option for dark theme (many bakers work early morning)
- **Quick Reference Card**: One-page summary view
- **Temperature Conversion**: Show both F and C simultaneously

---

## Technical & Performance

### 14. Code Quality & Architecture
**Current Issues**:
- Large single file (1200+ lines)
- Icon components duplicated in each component
- No error boundaries

**Recommendations**:
- Add error boundaries for each tab
- Consider adding loading states
- Add validation for inputs (e.g., prevent impossible values)
- Add offline support with service worker

### 15. User Feedback & Validation
**Missing**:
- No confirmation when starting expensive operations
- No undo functionality
- No validation warnings ("This temperature seems high")

**Recommendations**:
- Add confirmations: "Reset all steps?"
- Add smart warnings: "Temperature above 80°F may kill yeast"
- Add success feedback: "Timer started!" with subtle animation

---

## Priority Ranking

### 🔴 Must Fix (Affects Core Functionality)
1. Persist step completion and timer state (#1)
2. Improve timer notifications (#2)
3. Basic accessibility fixes (#3)

### 🟡 Should Fix (Significantly Improves UX)
4. Better mobile responsiveness (#6)
5. Progress indicators and visual guidance (#7)
6. Central timer management (#2)

### 🟢 Nice to Have (Polish & Enhancement)
7. Print mode and export features (#11)
8. Educational content enhancements (#12)
9. Dark mode and advanced features (#13)

---

## Quick Wins (High Impact, Low Effort)

1. ✅ Add quick-select buttons for common scales (0.5x, 1x, 2x)
2. ✅ Persist completed steps to localStorage
3. ✅ Add progress percentage display
4. ✅ Abbreviate tab names on mobile
5. ✅ Add "Clear All" button for completed steps
6. ✅ Show both temperature units simultaneously in calculator
7. ✅ Add browser notification for timer completion
8. ✅ Make warnings more visually prominent
9. ✅ Add tooltips for technical terms
10. ✅ Add success animations for step completion

---

## Implementation Notes
- Start with critical fixes that prevent data loss
- Focus on accessibility to make the app usable for all users
- Test on mobile devices throughout implementation
- Consider user feedback and iterate
