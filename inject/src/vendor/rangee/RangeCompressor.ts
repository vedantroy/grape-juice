import LZString from 'lz-string'

export const compress = (decompressed: string) => LZString.compressToUint8Array(decompressed)
export const decompress = (compressed: Uint8Array) => LZString.decompressFromUint8Array(compressed)