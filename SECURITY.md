# Security review and reporting

Reviewed October 12, 2026. Scope: manifest, background worker, shared URL validation, options page, permissions, original assets, and upload packaging. This is a source review with local regression tests, not an independent audit or proof of vulnerability absence.

## Findings and changes

| Finding | Impact | Resolution |
| --- | --- | --- |
| Submission URL used raw concatenation | A linked URL containing `&`, `#`, or other delimiters could alter the outer request or truncate the selected URL. | Encode the complete selected URL as the built-in submit query value. Custom mode offers explicit encoded/raw choices. |
| Arbitrary stored domains and paths were trusted | A manually misconfigured or altered preference could send selected URLs to another origin. There was no identified remote write path into settings. | Presets allow only the seven configured HTTPS origins and standard endpoints. Explicit Custom mode permits user-chosen HTTPS origins and validated templates. The worker validates the final origin and credentials; invalid configurations fall back to archive.is. |
| Arbitrary link schemes and embedded credentials were accepted | Non-web links or credentials could be passed to the service. | Limit menu targets to HTTP(S) and validate URLs before opening; reject embedded credentials. |
| Menu creation was repeated on updates | Existing menu IDs could cause duplicate-ID errors. | Remove old extension menus before recreating them on installation/update. |
| Storage errors were ignored | Options could claim to save when saving failed. | Display storage failures, disable save until settings load, and stop opening tabs on a failed storage read. |

## Reviewed controls

- Only `contextMenus` and `storage` permissions; no host access, content injection, external messaging handlers, or web-accessible resources.
- No remote code, dependencies, dynamic evaluation, HTML insertion, telemetry, or fetch calls. Options write status with `textContent`.
- A local-only script policy with object embedding and base URLs disabled.
- New tabs are opened only in response to recognized menu actions. Custom destinations require an explicit saved custom-mode flag. Origins must use HTTPS without credentials, path, query, or fragment. Prefixes must begin with one `/`; prefixes/suffixes reject backslashes and control characters. The generated URL is parsed and checked against the chosen origin before opening.
- The release ZIP uses a file allowlist and excludes repository and IDE metadata.

## Remaining limitations

Selected URLs may contain secrets in paths, queries, or fragments. Those values are preserved for the requested archive action and disclosed in the options page, README, and privacy policy. Credential rejection does not detect all secrets. Custom mode intentionally allows user-chosen destinations; choose only services you trust. Raw encoding can interpret a selected link's query delimiters as part of the destination request, so use URL-encoded for query parameters. Prefixes/suffixes are literal user configuration and may add request parameters. Custom settings sync through Chrome; they should not contain passwords or secret tokens.

Services can redirect requests, change ownership or behavior, be unavailable, and make submissions public. The extension does not validate service responses or control service retention. Validating an origin is not a guarantee about its operator. There is no identified remote settings-write path, but another actor with access to your extension storage could alter the custom-mode flag and destination.

Search preserves archive.today's URL-as-path convention, with fragments escaped. Submission now uses the homepage entry point `/?run=1&url=`; see [research and limitations](store/SUBMISSION-RESEARCH.md). Regression tests validate URL construction, custom configuration, and Chrome API interactions; they do not prove the remote service accepts every unusual URL. Live Chrome menu, sync behavior, and service integration checks remain in the publishing checklist.

## Reporting

For a sensitive vulnerability, use GitHub's **Report a vulnerability** option if enabled for this repository. Otherwise open an issue requesting a private contact channel without including exploit details, private links, or credentials. Ordinary bugs can be reported in [GitHub issues](https://github.com/ebob9/archive_today_chrome_extension/issues).
