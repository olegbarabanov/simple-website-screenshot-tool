import { ScreenshotCaptureTask, ScreenshotCaptureOptions, OutputFormat } from "./types";

export class ScreenshotCapture {
    readonly chunkWidth: number;
    readonly chunkHeight: number;
    readonly frameRate: number;
    readonly outputFormat: OutputFormat;
    readonly outputQuality: number;
    readonly maxHeight: number;
    protected restrictionElement;
    protected iframe;

    constructor(options: ScreenshotCaptureOptions = {}) {
        this.chunkWidth = options.chunkWidth ?? 500;
        this.chunkHeight = options.chunkHeight ?? 500;
        this.frameRate = options.frameRate ?? 20;
        this.outputFormat = options.outputFormat ?? OutputFormat['png'];
        this.outputQuality = options.outputQuality ?? 1;
        this.maxHeight = options.maxHeight ?? 10000;

        this.restrictionElement = document.createElement('div');
        this.restrictionElement.classList.add("simple-ScreenshotCapture-context");
        this.restrictionElement.setAttribute("style", `position: fixed; top: 0; left: 0; z-index: -9999; width: ${this.chunkWidth}px; height: ${this.chunkHeight}px; overflow: clip; isolation: isolate; pointer-events: none;`);

        this.iframe = document.createElement('iframe');
        this.iframe.setAttribute("style", "will-change: transform;");
        this.iframe.setAttribute("scrolling", "no");

        this.restrictionElement.append(this.iframe);
    }

    protected async loadIframe(src: string, width: number, height: number): Promise<number | undefined> {
        return new Promise((resolve, reject) => {
            this.iframe.onload = () => {
                resolve(this.iframe.contentDocument?.documentElement.scrollHeight)
            };
            this.iframe.onerror = () => { reject() };

            this.iframe.height = String(height);
            this.iframe.width = String(width);
            this.iframe.src = src;
        });
    }

    protected async requestCaption(): Promise<{ track: MediaStreamTrack, imageCapture: ImageCapture }> {
        if (!('RestrictionTarget' in window)) {
            throw new Error('RestrictionTarget is not supported in current browser');
        }

        const displayMediaOptions = {
            preferCurrentTab: true,
            video: {
                cursor: 'never',
                frameRate: this.frameRate,
                width: { ideal: this.chunkWidth, max: this.chunkWidth },
                height: { ideal: this.chunkHeight, max: this.chunkHeight }
            }
        };

        const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        const [track] = stream.getVideoTracks();

        // @ts-ignore - window.RestrictionTarget type is not supported in TS yet
        const restrictionTarget = await window.RestrictionTarget.fromElement(this.restrictionElement);
        // @ts-ignore - reason
        await track.restrictTo(restrictionTarget);
        const imageCapture = new ImageCapture(track)

        return { track, imageCapture };
    }

    protected translateIframe(x: number, y: number) {
        this.iframe.style.transform = `translate(${-x}px, ${-y}px)`;
    }

    protected async buildScreenshot(item: ScreenshotCaptureTask, imageCapture: ImageCapture): Promise<OffscreenCanvas> {
        const url = new URL(item.url).toString(); // check url
        const {
            signal,
            delay = 0,
            width = 1920,
            height = this.maxHeight,
            offsetWidth = 0,
            offsetHeight = 0,
          } = item;

        await this.loadIframe(url, width, height);
        const offscreenCanvas = new OffscreenCanvas(width, height);
        const ctxOffscreenCanvas = offscreenCanvas.getContext("2d");

        if (!('scheduler' in window)) {
            throw new Error('Prioritized Task Scheduling API is not supported in current browser');
        }

        await scheduler.postTask(async () => {
            for (let y = offsetWidth; y <= height; y += this.chunkHeight) {
                for (let x = offsetHeight; x < width; x += this.chunkWidth) {
                    this.translateIframe(x, y);
                    await scheduler.postTask(async () => {
                        const frame = await imageCapture.grabFrame();
                        ctxOffscreenCanvas?.drawImage(frame, x, y, this.chunkWidth, this.chunkHeight);
                        frame.close();
                    }, { delay: 1000 / (this.frameRate / 2), signal })
                }
            }
        }, { delay, signal });

        return offscreenCanvas;
    }

    async *getScreenshots(taskList: ScreenshotCaptureTask[]): AsyncGenerator<Blob, void, unknown> {
        let track: MediaStreamTrack | undefined;
        try {
            document.body.append(this.restrictionElement);
            const requestCaption = await this.requestCaption();
            track = requestCaption.track

            for (let taskItem of taskList) {
                const offscreenCanvas = await this.buildScreenshot(taskItem, requestCaption.imageCapture);
                yield offscreenCanvas.convertToBlob({ type: this.outputFormat, quality: this.outputQuality });
            }
        } finally {
            track?.stop();
            this.restrictionElement.remove();
        }
    }

    async getScreenshot(task: ScreenshotCaptureTask): Promise<Blob> {
        const [screenshot] = await Array.fromAsync(this.getScreenshots([task]));
        return screenshot;
    }

}