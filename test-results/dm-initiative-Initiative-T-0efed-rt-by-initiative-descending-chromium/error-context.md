# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dm/initiative.spec.ts >> Initiative Tracker >> sort by initiative descending
- Location: tests/dm/initiative.spec.ts:16:3

# Error details

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> /home/emil/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/tmp/playwright_chromiumdev_profile-acO0ks --remote-debugging-pipe --no-startup-window
<launched> pid=1566366
[pid=1566366][err] [0515/214659.519582:WARNING:media/gpu/vaapi/vaapi_wrapper.cc:123] Should skip nVidia device named: nvidia-drm
[pid=1566366][err] [0515/214659.522782:WARNING:sandbox/policy/linux/sandbox_linux.cc:404] InitializeSandbox() called with multiple threads in process gpu-process.
[pid=1566366][err] [0515/214700.398597:INFO:CONSOLE:1182] "[vite] connecting...", source: http://localhost:4321/@vite/client (1182)
[pid=1566366][err] [0515/214700.669321:INFO:CONSOLE:1305] "[vite] connected.", source: http://localhost:4321/@vite/client (1305)
[pid=1566366][err] [0515/214701.278769:INFO:third_party/blink/renderer/modules/peerconnection/peer_connection_dependency_factory.cc:941] Running WebRTC with a combined Network and Worker thread.
[pid=1566366][err] [0515/214702.051176:INFO:third_party/blink/renderer/modules/peerconnection/peer_connection_dependency_factory.cc:941] Running WebRTC with a combined Network and Worker thread.
[pid=1566366][err] [0515/214702.141812:INFO:CONSOLE:1182] "[vite] connecting...", source: http://localhost:4321/@vite/client (1182)
[pid=1566366][err] [0515/214702.233595:INFO:CONSOLE:1305] "[vite] connected.", source: http://localhost:4321/@vite/client (1305)
[pid=1566366][err] [0515/214703.793566:INFO:CONSOLE:1182] "[vite] connecting...", source: http://localhost:4321/@vite/client (1182)
[pid=1566366][err] [0515/214703.945205:INFO:CONSOLE:1305] "[vite] connected.", source: http://localhost:4321/@vite/client (1305)
[pid=1566366][err] [0515/214705.122983:INFO:third_party/blink/renderer/modules/peerconnection/peer_connection_dependency_factory.cc:941] Running WebRTC with a combined Network and Worker thread.
[pid=1566366] <gracefully close start>
```