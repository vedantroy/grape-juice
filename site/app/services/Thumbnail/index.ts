import tsenv from "getenv.ts";
import Generator from "./url2png";

export interface ThumbnailGenerator {
  generate(url: string, opts: { width: number }): Promise<ArrayBuffer>;
}

const generator = new Generator(tsenv.string("THUMBNAIL_API"));
export default generator;
