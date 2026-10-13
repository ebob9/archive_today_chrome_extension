# Archive.today submission research

The direct `/submit/?url=...` navigation could find existing snapshots but often failed for new URLs. The submission entry point was updated on October 12, 2026.

## Evidence

- The [Archive Page extension's current Chrome worker](https://raw.githubusercontent.com/JNavas2/Archive-Page/main/Chrome/service_worker.js) constructs archive actions with `https://archive.<alias>/?run=1&url=` plus an encoded selected URL. It uses the homepage entry point rather than a direct GET to `/submit/`.
- The [wabarc archive.is client's implementation](https://github.com/wabarc/archive.is/blob/main/is.go) obtains a submission token from the homepage and POSTs fields including `submitid` and `url` to `/submit/`. This is evidence that programmatic creation of a new capture can involve more than navigating directly to that endpoint.
- The [archive.ph homepage](https://archive.ph/) presents separate archive and search forms. Requests to archive.is and archive.today from the research browser returned HTTP 429, preventing direct verification of their current submission behavior.

## Implemented change

Built-in Submit now opens the homepage entry point `/?run=1&url=<encoded-link>` on the selected preset domain. Search remains unchanged. Existing preset configurations adopt the new prefix; explicitly saved custom configurations use the user's own prefix, suffix, and encoding.

Manual Chrome testing confirmed that the revised submission flow works. The token-based client's implementation suggests that the old direct GET may have omitted parts of the new-capture flow; the exact cause of the original failures has not been established. Service blocking, rate limits, CAPTCHA, or capture errors can still affect submissions.

The helper opens a browser tab with no additional permissions. The service handles its own submission form, tokens, and CAPTCHA. Complete any save prompt on the website.

## Verify in Chrome

1. Reload the extension and try an already-archived public link.
2. Try a public URL you control that has no snapshot yet; confirm the form is prefilled and complete Save/CAPTCHA if requested.
3. If it fails, note the final destination, response/error text, whether Save was shown, and whether the same link archives from the homepage manually. Keep private query parameters out of reports.
4. Compare a second preset domain if available. Custom mode can reproduce the old behavior with prefix `/submit/?url=` and URL-encoded links.

Validation consists of automated URL-construction and settings tests plus manual Chrome testing. These checks do not guarantee capture success for every URL or archive domain.
