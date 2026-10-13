// Shared local validation for the service worker and options page.
globalThis.ArchiveSettings = (() => {
  const domains = Object.freeze([
    "https://archive.is", "https://archive.today", "https://archive.ph",
    "https://archive.li", "https://archive.vn", "https://archive.fo", "https://archive.md"
  ]);
  const defaults = Object.freeze({
    archiveDomain: domains[0], archivePath: "/?run=1&url=",
    archiveCustom: false, archiveSuffix: "", archiveEncoding: "encoded",
    searchDomain: domains[0], searchPath: "/",
    searchCustom: false, searchSuffix: "", searchEncoding: "raw"
  });
  function normalizeDomain(value, custom = false) {
    if (typeof value !== "string" || /[\u0000-\u0020\u007f\\]/.test(value)) return null;
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
      return custom || domains.includes(url.origin) ? url.origin : null;
    } catch { return null; }
  }

  function validText(value) {
    return typeof value === "string" && value.length <= 2048 && !/[\u0000-\u001f\u007f\\]/.test(value);
  }

  function validateAction(saved, prefix) {
    const custom = saved[prefix + "Custom"] === true;
    const domain = normalizeDomain(saved[prefix + "Domain"], custom);
    const path = custom ? saved[prefix + "Path"] : defaults[prefix + "Path"];
    const suffix = custom ? (saved[prefix + "Suffix"] ?? "") : "";
    const encoding = custom ? (saved[prefix + "Encoding"] ?? defaults[prefix + "Encoding"]) : defaults[prefix + "Encoding"];
    if (!domain || !validText(path) || !path.startsWith("/") || path.startsWith("//") ||
        !validText(suffix) || !["encoded", "raw"].includes(encoding)) return null;
    // Custom text must not change the destination's origin or introduce credentials.
    try {
      const example = new URL(domain + path + "https%3A%2F%2Fexample.com" + suffix);
      if (example.origin !== domain || example.username || example.password) return null;
    } catch { return null; }
    return {
      [prefix + "Custom"]: custom, [prefix + "Domain"]: domain,
      [prefix + "Path"]: path, [prefix + "Suffix"]: suffix, [prefix + "Encoding"]: encoding
    };
  }

  function normalize(saved = {}) {
    return {
      ...defaults,
      ...(validateAction(saved, "archive") || {}),
      ...(validateAction(saved, "search") || {})
    };
  }
  function buildUrl(action, target, saved) {
    if (typeof target !== "string") return null;
    try {
      const url = new URL(target);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    } catch { return null; }
    const settings = normalize(saved);
    const prefix = action === "add_to_archive" ? "archive" : action === "search_in_archive" ? "search" : null;
    if (!prefix) return null;
    try {
      // Raw path-style URLs still escape fragments so they reach the destination.
      const link = settings[prefix + "Encoding"] === "encoded"
        ? encodeURIComponent(target) : target.replace(/#/g, "%23");
      const result = settings[prefix + "Domain"] + settings[prefix + "Path"] + link + settings[prefix + "Suffix"];
      const parsed = new URL(result);
      return parsed.origin === settings[prefix + "Domain"] && !parsed.username && !parsed.password ? result : null;
    } catch { return null; }
  }
  return Object.freeze({ domains, defaults, normalizeDomain, validateAction, normalize, buildUrl });
})();
