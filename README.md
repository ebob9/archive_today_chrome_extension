# Archive.today Helper (Unofficial)

An independent Chrome extension for submitting links to archive.today (archive.is) and searching for existing snapshots from the right-click menu. Built by Aaron Edwards as a hobby project to help find archived copies of dead links.

## Use

1. Right-click an HTTP or HTTPS link on a webpage.
2. Choose **Submit link to archive.today** to open the submission page, or **Search for link in archive.today** to look for snapshots.
3. Complete any prompts on the archive service itself. Opening the submission page does not guarantee a snapshot is created.

Both actions open a new tab. In Chrome's extension details, open **Extension options** to choose separate domains for submission and search. The default is **https://archive.is**. Choices are archive.is, archive.today, archive.ph, archive.li, archive.vn, archive.fo, and archive.md; availability depends on the service and your network.

Choose **Custom…** in either selector to enter your own HTTPS origin, the string between that origin and the selected link, and an optional string after the link. Each action has its own settings. Custom fields appear only for Custom. The destination is built as `origin + before-link text + link + after-link text`.

Use **URL-encoded** when the selected link is a query-parameter value, such as `/capture?url=` with optional suffix `&mode=save`. Use **Raw URL** when the service expects the original link in the path, such as archive.today's search prefix `/`; fragments are still escaped. The before-link string must start with one `/`. Origins must use HTTPS without credentials, paths, queries, or fragments. Custom mode can also customize the endpoints of a listed archive domain.

Only choose custom destinations you trust: selected links will be sent there. Presets use the listed archive origins and standard endpoints. Invalid stored configurations fall back to archive.is, and non-web links or links containing embedded credentials are rejected. Older preset domain choices are preserved; old submission paths upgrade to the new standard flow. Custom endpoints are used only when Custom is explicitly selected and saved.

## Submitting new captures

The built-in submit action opens `https://archive.is/?run=1&url=<encoded-link>` (or your chosen preset domain), using the homepage entry point. You may still need to press Save or complete a CAPTCHA. Search uses the original URL as a path on the selected archive domain. Custom mode allows testing alternative prefixes, including the previous `/submit/?url=`.

## Install from source

1. Download or clone [the GitHub repository](https://github.com/ebob9/archive_today_chrome_extension).
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select the repository folder containing `manifest.json`.

## Privacy and permissions

The extension has no analytics, advertising, developer server, or background collection. It reads the link you explicitly choose and opens the selected archive service or custom destination with that URL. The service receives that URL, which may contain private query parameters, along with ordinary browser request information. Submitting a link may make its contents publicly accessible. Do not send private or sensitive links unless you intend to share them with the service.

Destination preferences, custom prefixes/suffixes, and encoding choices are stored using Chrome's sync storage and may sync with your Google account. Do not put passwords or secret tokens in custom settings. Selected links are not stored by the extension, although Chrome may retain the opened tabs in browser history. The developer receives neither links nor preferences. Each destination service operates independently and has its own data practices.

The only permissions are `contextMenus` (the two right-click actions) and `storage` (preferences). There are no host permissions, content scripts, browsing history permissions, or remotely loaded scripts. Creating a tab does not require the `tabs` permission.

Read [the privacy policy](PRIVACY.md) and [security review](SECURITY.md).

## Open source and attribution

This is an unofficial hobby project, not affiliated with, endorsed by, or operated by archive.today. Its source code and original icon are available under the [MIT license](LICENSE), allowing end users to inspect, validate, modify, and redistribute the extension subject to that license.

Archive.today's names, logos, site materials, and other proprietary items remain the property of their respective owners. Archived third-party works remain the property of their respective rights holders. References to archive.today and archive.is identify the service this extension works with and are intended as fair use; the extension does not use the service's logo or claim rights to its materials. The MIT license applies to this project's code and original artwork, not to the archive service or archived content.

Source: [github.com/ebob9/archive_today_chrome_extension](https://github.com/ebob9/archive_today_chrome_extension). Report ordinary bugs through [GitHub issues](https://github.com/ebob9/archive_today_chrome_extension/issues); see [SECURITY.md](SECURITY.md) for sensitive reports.

## Development and publication

No dependencies or build step are required to load the extension. Regression tests require Node.js 18 or newer. On Windows, run `powershell -NoProfile -File scripts/test.ps1`; this finds Node on PATH or an installed PyCharm agent runtime. If needed, pass `-NodePath "C:\path\to\node.exe"`. Where Node is on PATH, `node --test tests/*.test.cjs` also runs the tests.

On Windows, `powershell -NoProfile -File scripts/build.ps1` creates an allowlisted upload ZIP under `dist/` without requiring Node.js. The package excludes tests, tooling, IDE files, and Git metadata.

Original artwork: [icons/icon.svg](icons/icon.svg), with PNGs at 16, 32, 48, and 128 pixels. Regenerate PNGs and the promotional tile on Windows with `powershell -NoProfile -File scripts/create-artwork.ps1`.

See [the store listing](store/LISTING.md) and [publication checklist](store/PUBLISHING.md) for release instructions.
