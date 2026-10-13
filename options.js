const status = document.getElementById("status");
const form = document.getElementById("settings");
const save = document.getElementById("save");

function updateCustomFields(prefix) {
  const custom = document.getElementById(prefix + "Domain").value === "custom";
  document.getElementById(prefix + "Fields").hidden = !custom;
  for (const name of ["CustomDomain", "Path", "Suffix", "Encoding"]) {
    document.getElementById(prefix + name).disabled = !custom;
  }
  document.getElementById(prefix + "CustomDomain").required = custom;
  document.getElementById(prefix + "Path").required = custom;
}

for (const prefix of ["archive", "search"]) {
  const select = document.getElementById(prefix + "Domain");
  for (const domain of ArchiveSettings.domains) {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain;
    select.appendChild(option);
  }
  const custom = document.createElement("option");
  custom.value = "custom";
  custom.textContent = "Custom…";
  select.appendChild(custom);
  select.addEventListener("change", () => updateCustomFields(prefix));
}
save.disabled = true;
chrome.storage.sync.get(ArchiveSettings.defaults, (saved) => {
  if (chrome.runtime.lastError) {
    status.textContent = "Could not load settings. Reopen this page to try again.";
    return;
  }
  const settings = ArchiveSettings.normalize(saved);
  for (const prefix of ["archive", "search"]) {
    document.getElementById(prefix + "Domain").value = settings[prefix + "Custom"] ? "custom" : settings[prefix + "Domain"];
    document.getElementById(prefix + "CustomDomain").value = settings[prefix + "Domain"];
    for (const name of ["Path", "Suffix", "Encoding"]) {
      document.getElementById(prefix + name).value = settings[prefix + name];
    }
    updateCustomFields(prefix);
  }
  save.disabled = false;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (save.disabled) return;
  const settings = { ...ArchiveSettings.defaults };
  for (const prefix of ["archive", "search"]) {
    const chosen = document.getElementById(prefix + "Domain").value;
    const custom = chosen === "custom";
    const candidate = {
      [prefix + "Custom"]: custom,
      [prefix + "Domain"]: custom ? document.getElementById(prefix + "CustomDomain").value.trim() : chosen,
      [prefix + "Path"]: document.getElementById(prefix + "Path").value,
      [prefix + "Suffix"]: document.getElementById(prefix + "Suffix").value,
      [prefix + "Encoding"]: document.getElementById(prefix + "Encoding").value
    };
    const validated = ArchiveSettings.validateAction(candidate, prefix);
    if (!validated) {
      status.textContent = (prefix === "archive" ? "Submit" : "Search") +
        ": use an HTTPS origin without credentials, path, query, or fragment, and a prefix starting with one /. Avoid backslashes and control characters.";
      return;
    }
    Object.assign(settings, validated);
  }
  save.disabled = true;
  chrome.storage.sync.set(settings, () => {
    status.textContent = chrome.runtime.lastError
      ? "Could not save settings. Please try again."
      : "Settings saved.";
    save.disabled = false;
  });
});
