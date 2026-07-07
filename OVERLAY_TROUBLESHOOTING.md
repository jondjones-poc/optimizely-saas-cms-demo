# Overlay Troubleshooting Options

## Option 1: Listen for Messages FROM Parent Window
The CMS might be sending initialization messages that we need to respond to.

## Option 2: Use iframe Load Events
Wait for iframe-specific load events before signaling.

## Option 3: More Aggressive Polling
Continuously poll and signal until overlay appears.

## Option 4: Try Different PostMessage Event Names
Experiment with various event types the CMS might expect.

## Option 5: Force DOM Mutation to Trigger Rescan
Intentionally trigger a DOM change to force Optimizely to rescan.

## Option 6: Check for visual-builder-api Dependency
The error mentioned missing dependency - try to load it manually.

## Option 7: Wait for Specific Overlay Elements
Poll for overlay elements to appear before considering it ready.

## Option 8: Use Window Load Event
Wait for window.load instead of just DOM ready.

## Option 9: Check CSP Headers
Content Security Policy might be blocking communication.

## Option 10: Try Manual Overlay Injection
Manually inject overlay CSS/JS if available.

