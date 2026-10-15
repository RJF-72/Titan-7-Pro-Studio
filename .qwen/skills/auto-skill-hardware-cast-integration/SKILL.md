---
name: hardware-cast-integration
description: implementing real hardware device discovery and casting in an Electron environment using Cast/Chromecast APIs.
source: auto-skill
extracted_at: '2026-06-28T14:58:31.802Z'
---

## Approach to Hardware Casting Integration

When replacing a virtual/simulated casting system (like `BroadcastChannel`) with real hardware support in a web/Electron environment:

### 1. Device Discovery
- Implement a multi-tiered discovery check to account for different environment SDKs (e.g., `window.cast.Chromecast` vs `window.chrome.cast`).
- Ensure a robust mapping of device properties, checking for multiple possible keys for IDs (`deviceId`, `id`) and names (`friendlyName`, `name`).
- Merge real hardware devices with existing virtual peers into a single device list to maintain a unified UI.

### 2. Connection & Payload Delivery
- Implement specific connection handlers for hardware IDs (e.g., prefixing IDs with `cast:`) to route them to the real Cast API instead of virtual peer logic.
- Use asynchronous session initialization (`startSession`) and payload delivery (`sendPayload`) to handle network latency.

### 3. Debugging & Verification
- Since direct CLI testing of hardware peripherals is often impossible in a headless environment, implement high-visibility console logging for every stage of the pipeline:
    - Trigger: `Sensing call to scanForDevices`
    - API Availability: `Checking for window.cast / window.chrome.cast`
    - Results: `Logging raw discovery results before mapping`
    - Final State: `Logging the final merged device list`
- Prioritize identifying if the API is missing entirely, which indicates an Electron main process configuration issue rather than a logic error.
- **UI Responsiveness:** If buttons are unresponsive, investigate z-index overlays and pointer-event conflicts. Use `z-index: 1000 !important` and `pointer-events: auto !important` for critical control elements to ensure they aren't blocked by invisible layout layers.

### 4. User Workflow Alignment
- Prioritize real hardware endpoints over local mirroring to support professional workflows (e.g., Producer in DAW $\rightarrow$ Artist in Booth).
- Provide immediate visual feedback (e.g., color changes in status displays) when critical resources (like audio files) are successfully loaded.
