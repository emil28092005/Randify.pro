# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dm/reference.spec.ts >> Open5e Reference >> tab switching works
- Location: tests/dm/reference.spec.ts:8:3

# Error details

```
Error: browser.newContext: Target page, context or browser has been closed
Browser logs:

<launching> /home/emil/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/tmp/playwright_chromiumdev_profile-BU4mcn --remote-debugging-pipe --no-startup-window
<launched> pid=1566421
[pid=1566421][err] [0515/214659.568038:WARNING:media/gpu/vaapi/vaapi_wrapper.cc:123] Should skip nVidia device named: nvidia-drm
[pid=1566421][err] [0515/214659.570324:WARNING:sandbox/policy/linux/sandbox_linux.cc:404] InitializeSandbox() called with multiple threads in process gpu-process.
[pid=1566421][err] [0515/214700.164452:INFO:CONSOLE:1182] "[vite] connecting...", source: http://localhost:4321/@vite/client (1182)
[pid=1566421][err] [0515/214700.260928:INFO:CONSOLE:1305] "[vite] connected.", source: http://localhost:4321/@vite/client (1305)
[pid=1566421][err] [0515/214701.329816:INFO:third_party/blink/renderer/modules/peerconnection/peer_connection_dependency_factory.cc:941] Running WebRTC with a combined Network and Worker thread.
[pid=1566421][err] [0515/214703.720377:INFO:CONSOLE:1182] "[vite] connecting...", source: http://localhost:4321/@vite/client (1182)
[pid=1566421][err] [0515/214704.139991:INFO:CONSOLE:1305] "[vite] connected.", source: http://localhost:4321/@vite/client (1305)
[pid=1566421][err] [0515/214704.734778:INFO:third_party/blink/renderer/modules/peerconnection/peer_connection_dependency_factory.cc:941] Running WebRTC with a combined Network and Worker thread.
[pid=1566421] <gracefully close start>
```