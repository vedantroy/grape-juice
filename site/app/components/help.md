# Upload API

The PageSplash API lets you programatically upload pages to the site.
You want to use this API if you need greater control over the HTML that is uploaded to the site.

Normally, when you upload a page by pasting in its URL, we:

- make a GET request from our servers and save the result
- _coming soon_ we render the page in a headless browser and save the resulting HTML

This usually works, but there are 2 downsides:

- Sites may block requests from our servers, since our servers have data-center IPs
- You cannot customize the HTML before uploading it. E.g, what if you want to upload _your_ Facebook profile page or you have a Chrome extension that replaces all instances of "foo" on a page with "bar".

The API lets you upload arbitrary HTML, which resolves the above concerns.

## Dev Tools

The default code snippet on the upload page is meant to be pasted into dev tools.
It

- Imports and calls a helper that serializes CSS in JS (more on that below)
- Converts the page _as it is currently rendered in your browser tab_ (this includes injected HTML from Chrome extensions) to a string using `document.documentElement.outerHTML`
- Uploads it to the API

### Caveats

Sometimes the snippet fails because a page has a CSP policy which prevents POSTing to arbitrary URLs.
In those cases, you should save page's HTML to your computer and then use `curl` / your tool of choice to upload to our API.

## Edge Cases

Generally, if you save a full HTML document to a file, and then reopen it, you will see exactly what you saw in your browser tab.
But, it's not perfect:

- The state of `canvas` elements won't be saved
- Chrome extensions can inject style sheets that affect how the page is displayed. We can't access these injected stylesheets / save them.

[CSS in JS](https://en.wikipedia.org/wiki/CSS-in-JS) frameworks inject a style tag into the `head`. This style tag has no CSS text. Yet, it still affects the DOM through the [CSSOM](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model) API. The `serializeCSSinJSStyles` function adds a new style tag to the document which has CSS text that corresponds to all rules injected through the CSSOM API.

### Technical Details

_Coming soon:_ We rewrite links in your document to be absolute.
This way, when you click on a link you won't get a 404.
