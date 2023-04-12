/**
 * requestAnimationFrame that also works on non-browser environments like Node.
 */
export declare const raf: (fn: (time: number) => void) => void;
