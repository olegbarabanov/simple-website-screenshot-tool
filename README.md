# Simple Website Screenshotter

A simple client-side website screenshotter that doesn't require a server.

Currently supported only in browsers based on **Сhromium engine version >= 132**, since it uses the [RestrictionTarget](https://developer.mozilla.org/en-US/docs/Web/API/RestrictionTarget) interface from the [Screen Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API).

## How it use 

To generate a single screenshot:

```ts
import { ScreenshotCapture } from 'simple-website-screenshot-tool'

const ScreenshotCapture = new ScreenshotCapture();
const singleResult = await ScreenshotCapture.getScreenshot({ url: "https://example.com", width: 1920, height: 4000 });
```

To generate multiple screenshots:

```ts
import { ScreenshotCapture } from 'simple-website-screenshot-tool'

const capture = new ScreenshotCapture();
const multipleResults = Array.fromAsync(capture.getScreenshots([
    { url: "https://example.com", width: 1920, height: 4000 }, 
    { url: "https://example.com", width: 1280, height: 1024 },  
    { url: "https://example.com", width: 768, height: 1000 },  
]));
```