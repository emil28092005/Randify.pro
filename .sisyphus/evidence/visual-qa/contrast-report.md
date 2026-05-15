# Color Contrast Report

## Method
Evaluated all visible text elements on mobile viewport (375x812) at /dm/. Checked computed color and background-color for contrast ratio against WCAG 2.1 AA thresholds (4.5:1 for normal text, 3:1 for large/bold text ≥18px or 14px bold).

- **PASS** | Ratio: 16.95:1 | rgb(244, 244, 245) on rgb(22, 18, 14) | font-size: 16px 
- **PASS** | Ratio: 4.79:1 | rgb(255, 255, 255) on rgb(76, 117, 163) | font-size: 14px 
- **FAIL** | Ratio: 3.58:1 | rgb(255, 255, 255) on rgb(252, 63, 29) | font-size: 14px 
- **PASS** | Ratio: 6.93:1 | rgb(255, 255, 255) on rgb(83, 74, 183) | font-size: 14px 
- **PASS** | Ratio: 6.47:1 | rgb(161, 161, 170) on rgb(34, 30, 24) | font-size: 14px 
- **FAIL** | Ratio: 1.12:1 | rgb(161, 161, 170) on rgb(200, 168, 75) | font-size: 14px 
- **PASS** | Ratio: 6.30:1 | rgb(244, 244, 245) on rgb(83, 74, 183) | font-size: 16px 
- **PASS** | Ratio: 15.08:1 | rgb(244, 244, 245) on rgb(34, 30, 24) | font-size: 16px 
- **PASS** | Ratio: 7.61:1 | rgb(200, 168, 75) on rgb(30, 25, 18) | font-size: 14px 
- **PASS** | Ratio: 16.38:1 | rgb(244, 244, 245) on rgb(26, 22, 16) | font-size: 16px 
- **PASS** | Ratio: 6.93:1 | rgb(255, 255, 255) on rgb(83, 74, 183) | font-size: 16px 
- **PASS** | Ratio: 15.88:1 | rgb(244, 244, 245) on rgb(30, 25, 18) | font-size: 16px 
- **PASS** | Ratio: 15.08:1 | rgb(244, 244, 245) on rgb(34, 30, 24) | font-size: 14px 
- **FAIL** | Ratio: 2.09:1 | rgb(244, 244, 245) on rgb(200, 168, 75) | font-size: 16px 

## Summary
- Total unique color combinations checked: 14
- Failures: 3
- Status: 3 contrast issues detected