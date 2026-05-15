# Mobile UX Observations

## Viewport Tested
375x812 (iPhone X) and 390x844 (iPhone 12/13/14)

## Tab Navigation
- Mobile tabs are sticky below the header (`sticky top-[64px]`) and use `overflow-x-auto`
- All 4 tabs (Кубики, Инициатива, Справочник, Заметки) are reachable via horizontal swipe
- Tab pill buttons have `min-h-[44px] min-w-[80px]` which satisfies touch target intent, though quick-dice buttons fall slightly short (38px height)

## Thumb Reachability
- **Top tabs**: On 375px width, tabs span full width and sit near top of screen. The rightmost tab (Заметки) may be harder to reach with right-thumb one-handed use.
- **Suggestion**: Consider moving primary navigation to bottom sheet or bottom tab bar for mobile. This would place controls within natural thumb reach zone (lower 2/3 of screen).

## Content Density
- Dice roller quick-buttons (d4–d100) are horizontally scrollable on mobile
- Initiative tracker list items are tall enough for comfortable tapping
- Open5e reference search + filter stack vertically; cards use 1-column grid on mobile which is appropriate
- Notes textarea fills available width; comfortable for typing

## Touch Target Gaps
- 9 elements measured below 44px on mobile (see `touch-targets.md`):
  - Quick-dice buttons (d4–d100) are 66x38px — width is good, height is 6px short
  - Clear history button (Очистить) is 100x34px — needs height increase
  - One input field is 163x42px — 2px short on height
- **Recommendation**: Increase `py-2` to `py-2.5` or `min-h-[44px]` on quick-dice buttons and ghost buttons

## Swipe Gestures / Bottom Sheet
- Current tab switching requires precise tap on top tabs
- **Bottom sheet opportunity**: A swipe-up bottom sheet for dice roll history or initiative details could reduce top-screen interaction
- **Swipe-between-tabs**: Horizontal swipe on content area to switch tabs would feel native on mobile

## Scroll Behavior
- No horizontal overflow detected on mobile (body scrollWidth 360px within 375px viewport)
- Vertical scrolling is smooth; sticky tabs remain accessible while scrolling

## Visual Hierarchy
- Purple accent (#534AB7) on dark background is highly visible
- Gold headings (#c8a84b) stand out well against dark surfaces
- Cards have adequate padding and border contrast on mobile

## Keyboard UX
- No on-screen keyboard overlap issues detected in screenshots
- Input fields have visible focus rings (gold) on mobile

## Overall Assessment
Mobile layout is functional and readable. Primary UX improvement would be bottom-navigation or swipe gestures to reduce thumb travel to top tabs.
