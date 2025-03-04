export enum OutputFormat {
    'jpg' = "image/jpeg",
    'png' = "image/png",
    'webp' = "image/webp",
    'gif' = "image/gif",
}

export interface ScreenshotCaptureOptions {
    chunkWidth?: number;
    chunkHeight?: number;
    frameRate?: number;
    outputFormat?: OutputFormat;
    outputQuality?: number;
    maxHeight?: number;
}

export interface ScreenshotCaptureTask {
    url: string;
    delay: number; // milliseconds
    width: number;
    height: number;
    offsetHeight?: number;
    offsetWidth?: number;
}