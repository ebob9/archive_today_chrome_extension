# Publication checklist

Release version: **1.0.1**. Upload package: `dist/archive-today-helper-1.0.1.zip`.

## Completed

- [x] Manifest V3 metadata, minimal permissions, and original extension icons.
- [x] Custom submit/search destinations with prefix, optional suffix, and encoding settings.
- [x] README, MIT license, privacy policy, security review, and listing copy.
- [x] Automated regression tests: 20 passing.
- [x] Manual Chrome confirmation that the revised submission and search actions work.
- [x] Upload ZIP generated using a file allowlist.

## Commit and publish the source

- [ ] Stage the final versions of these files and directories:

  ```powershell
  git add .gitignore README.md PRIVACY.md SECURITY.md manifest.json background.js settings.js options.html options.css options.js icons scripts store tests
  ```

  This includes all icon PNGs and the SVG source, both PowerShell scripts, both test files, and the store documentation and promotional tile. LICENSE is already tracked and unchanged.
- [ ] Review `git diff --cached --stat` and `git diff --cached`. Some files may already be staged from an earlier revision; the command above stages their final contents.
- [ ] Commit, push, and make the GitHub repository public.
- [ ] Enable GitHub private vulnerability reporting and confirm issues are available for support.

Keep `dist/` and `.idea/` out of the commit. They are ignored. Upload the generated ZIP to the store separately.

## Verify the extension

- [ ] Load the final package in a clean Chrome profile and check that no extension errors are reported.
- [ ] Verify a link containing `?a=1&b=2#section` reaches the intended submission form intact; check search results too.
- [ ] Confirm no menu appears for `mailto:` or `javascript:` links.
- [ ] Change each domain preference, reload options, and verify persistence. Check an alternate domain live if available.
- [ ] Reload/update the extension and check both menus appear once.
- [ ] Confirm the settings page is readable in light/dark mode and with keyboard navigation.
- [ ] Test an upgrade from the old extension's settings.
- [ ] Test a new, unarchived public URL you control if this was not included in prior manual testing. Complete Save/CAPTCHA if shown. See [submission research](SUBMISSION-RESEARCH.md).
- [ ] Choose Custom for each action. Test prefix, optional suffix, and both encoding choices with a trusted HTTPS service. Save and reopen options to verify all values restore, then switch back to a preset.

## Prepare public assets and URLs

- [ ] Verify the source, support, and [privacy policy](https://github.com/ebob9/archive_today_chrome_extension/blob/HEAD/PRIVACY.md) links without signing in. The policy must be publicly accessible before submitting for review.
- [ ] Capture at least one actual Chrome screenshot of the right-click menu, ideally also the options page. Use 1280×800 or 640×400 pixels. Keep private URLs and personal browser details out of screenshots.
- [ ] Use `icons/icon-128.png` as the store icon and `store/promo-440x280.png` as the required small promotional tile.
- [ ] Review the title, description, attribution, privacy disclosures, and permission justifications in [LISTING.md](LISTING.md).

## Developer account

- [ ] Register a Chrome Web Store developer account and pay the one-time registration fee if not already registered.
- [ ] Set the publisher name and verify the contact email. Complete any additional account requirements shown in the dashboard.

## Package and submit

1. Run `node --test tests/*.test.cjs`, then `powershell -NoProfile -File scripts/build.ps1` (PowerShell on Windows).
2. Upload `dist/archive-today-helper-1.0.1.zip` in the Chrome Web Store Developer Dashboard using your registered developer account.
3. Fill out the store listing from LISTING.md, add the required graphics, and enter the public homepage, support, and privacy-policy URLs.
4. Complete Privacy practices: single purpose, permission justifications, no remote code, and data disclosures consistent with PRIVACY.md. Selected links are sent to the selected service, including custom destinations; the developer collects no data.
5. Choose free pricing, intended countries, and public visibility in Distribution. Add the reviewer instructions below in Test instructions.
6. Review all dashboard certifications and submit for review. Choose automatic publication after approval or deferred publication as preferred.
7. After approval, add the actual store URL to README.md and create a GitHub release/tag for version 1.0.1. Increment the manifest version for subsequent extension updates.

## Reviewer instructions

No extension account or login is required. Install the extension and visit any page containing a normal HTTPS link. Right-click that link to see the two archive actions. Each opens a tab on archive.is by default. Open Extension options to change either domain. The archive service is external and may require a CAPTCHA, be unavailable, or have no snapshot of a particular link.

## Official references

- [Developer registration](https://developer.chrome.com/docs/webstore/register)
- [Account setup](https://developer.chrome.com/docs/webstore/set-up-account)
- [Publishing process](https://developer.chrome.com/docs/webstore/publish)
- [Required images and screenshot sizes](https://developer.chrome.com/docs/webstore/images)
- [Privacy practices dashboard](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Program policies](https://developer.chrome.com/docs/webstore/program-policies/policies)

Review the current dashboard and documentation at submission time.
