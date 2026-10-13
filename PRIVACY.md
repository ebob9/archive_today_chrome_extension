# Privacy policy — Archive.today Helper (Unofficial)

Effective date: October 12, 2026. Developer: Aaron Edwards.

This independent, MIT-licensed hobby extension helps you submit or search for links on archive.today. It is not affiliated with that service.

## Information used

When you explicitly choose one of the extension's right-click actions, the extension reads the selected link URL and opens a new tab on your chosen archive domain or custom HTTPS destination with that URL. This is the only use of the selected link. URLs may include query parameters or fragments containing personal information. The extension rejects non-HTTP(S) URLs and URLs with embedded credentials, but does not inspect other URL contents for sensitive information.

The selected service receives the selected URL and ordinary browser request information, such as your IP address and any cookies Chrome sends to that service. It controls what happens to those requests and any resulting snapshots. Submission may lead to publicly accessible archived content. Use these actions only for links you intend to share with the service. In Custom mode, you choose this recipient yourself; it can be a service other than archive.today.

## Storage and sharing

The extension stores your selected domains, custom-mode choices, prefixes, optional suffixes, and link-encoding preferences in `chrome.storage.sync`. Chrome may sync those preferences with your Google account according to your browser settings. Custom text is stored as entered, so do not put passwords or secret tokens in it. The extension does not otherwise store credentials, selected link URLs, page contents, or browsing history. Chrome itself may keep history of tabs opened by these actions.

The developer does not collect or receive your data. There is no analytics, advertising, sale of data, tracking, or developer-operated backend. Selected URLs are transmitted to the selected archive service or custom destination only to perform the action you request. Destination preferences are handled by Chrome storage. Neither data type is used for unrelated purposes.

The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Your choices and contact

Change domains and custom configuration in the extension options. Remove the extension to stop its processing and remove its extension-managed settings from that Chrome profile. Google account and browser history retention are controlled by Chrome and your Google settings; destination service retention is controlled by that service.

Questions or privacy concerns can be raised through [the project's GitHub issues](https://github.com/ebob9/archive_today_chrome_extension/issues). Do not include private URLs or credentials in public reports.
