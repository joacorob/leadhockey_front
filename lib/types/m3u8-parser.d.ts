declare module "m3u8-parser" {
  // Minimal typings for the Parser we use
  export class Parser {
    push(input: string): void;
    end(): void;
    manifest: any;
  }
}
