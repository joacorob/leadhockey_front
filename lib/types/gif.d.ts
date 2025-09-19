declare module 'gif.js' {
  export default class GIF {
    constructor(opts: any)
    addFrame(image: any, opts?: any): void
    on(event: 'finished', cb: (blob: Blob) => void): void
    render(): void
  }
}
