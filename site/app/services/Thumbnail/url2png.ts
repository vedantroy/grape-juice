// Just a wrapper for this service:
// https://github.com/jasonraimondi/url-to-png

import { ThumbnailGenerator } from ".";

class Generator implements ThumbnailGenerator {
  apiEndpoint: string;

  constructor(apiEndpoint: string) {
    this.apiEndpoint = apiEndpoint;
  }

  async generate(url: string, { width }: { width: number }) {
    const resp = await fetch(
      this.apiEndpoint + `?url=${encodeURIComponent(url)}&width=${width}`
    );
    return await resp.arrayBuffer();
  }
}

export default Generator;
