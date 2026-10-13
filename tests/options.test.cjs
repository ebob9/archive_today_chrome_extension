const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function options({ loadError = false, saveError = false, saved = {} } = {}) {
  const ids = ['status', 'settings', 'save'];
  for (const prefix of ['archive', 'search']) {
    for (const suffix of ['Domain', 'CustomDomain', 'Fields', 'Path', 'Suffix', 'Encoding']) ids.push(prefix + suffix);
  }
  const elements = Object.fromEntries(ids
    .map(id => [id, { value: '', textContent: '', children: [],
      appendChild(child) { this.children.push(child); },
      addEventListener(event, fn) { this[event] = fn; } }]));
  const writes = [];
  const chrome = { runtime: {}, storage: { sync: {
    get(defaults, fn) {
      if (loadError) chrome.runtime.lastError = { message: 'load failed' };
      fn({ ...defaults, archiveDomain: 'https://evil.test', searchDomain: 'https://archive.ph', ...saved });
      delete chrome.runtime.lastError;
    },
    set(settings, fn) {
      writes.push(settings);
      if (saveError) chrome.runtime.lastError = { message: 'save failed' };
      fn();
      delete chrome.runtime.lastError;
    }
  } } };
  const context = vm.createContext({ URL, chrome, document: {
    getElementById(id) { return elements[id]; }, createElement() { return {}; }
  } });
  for (const file of ['settings.js', 'options.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
  }
  return { elements, writes, submit() { elements.settings.submit({ preventDefault() {} }); } };
}

test('options restore supported legacy preferences and normalize unsafe ones', () => {
  const { elements } = options();
  assert.equal(elements.archiveDomain.value, 'https://archive.is');
  assert.equal(elements.searchDomain.value, 'https://archive.ph');
  assert.equal(elements.archiveDomain.children.length, 8);
  assert.equal(elements.archiveFields.hidden, true);
  assert.equal(elements.archiveCustomDomain.disabled, true);
  assert.equal(elements.save.disabled, false);
});

test('options reject invalid selections before storage and save fixed paths', () => {
  const page = options();
  page.elements.archiveDomain.value = 'https://evil.test';
  page.submit();
  assert.equal(page.writes.length, 0);
  page.elements.archiveDomain.value = 'https://archive.today';
  page.submit();
  assert.equal(page.writes[0].archiveDomain, 'https://archive.today');
  assert.equal(page.writes[0].archivePath, '/?run=1&url=');
  assert.equal(page.elements.status.textContent, 'Settings saved.');
});

test('options do not claim success or allow defaults to overwrite a failed load', () => {
  const failedLoad = options({ loadError: true });
  assert.equal(failedLoad.elements.save.disabled, true);
  assert.match(failedLoad.elements.status.textContent, /Could not load/);
  failedLoad.submit();
  assert.equal(failedLoad.writes.length, 0);
  const failedSave = options({ saveError: true });
  failedSave.submit();
  assert.match(failedSave.elements.status.textContent, /Could not save/);
  assert.equal(failedSave.elements.save.disabled, false);
});

test('choosing custom shows editable fields and switching to preset hides them', () => {
  const { elements } = options();
  elements.archiveDomain.value = 'custom';
  elements.archiveDomain.change();
  assert.equal(elements.archiveFields.hidden, false);
  assert.equal(elements.archiveCustomDomain.disabled, false);
  assert.equal(elements.archiveCustomDomain.required, true);
  assert.equal(elements.searchFields.hidden, true);
  elements.archiveDomain.value = 'https://archive.is';
  elements.archiveDomain.change();
  assert.equal(elements.archiveFields.hidden, true);
  assert.equal(elements.archiveCustomDomain.required, false);
});

test('custom settings round-trip for both actions including suffix and encoding', () => {
  const page = options();
  for (const prefix of ['archive', 'search']) {
    page.elements[prefix + 'Domain'].value = 'custom';
    page.elements[prefix + 'Domain'].change();
    page.elements[prefix + 'CustomDomain'].value = 'https://my-archive.example';
    page.elements[prefix + 'Path'].value = '/capture?target=';
    page.elements[prefix + 'Suffix'].value = '&view=full';
    page.elements[prefix + 'Encoding'].value = 'encoded';
  }
  page.submit();
  assert.equal(page.writes.length, 1);
  const restored = options({ saved: page.writes[0] });
  for (const prefix of ['archive', 'search']) {
    assert.equal(restored.elements[prefix + 'Domain'].value, 'custom');
    assert.equal(restored.elements[prefix + 'CustomDomain'].value, 'https://my-archive.example');
    assert.equal(restored.elements[prefix + 'Path'].value, '/capture?target=');
    assert.equal(restored.elements[prefix + 'Suffix'].value, '&view=full');
    assert.equal(restored.elements[prefix + 'Encoding'].value, 'encoded');
    assert.equal(restored.elements[prefix + 'Fields'].hidden, false);
  }
});

test('invalid custom origin or prefix is rejected instead of silently saving a preset', () => {
  const page = options();
  page.elements.searchDomain.value = 'custom';
  page.elements.searchCustomDomain.value = 'http://custom.example';
  page.submit();
  assert.equal(page.writes.length, 0);
  assert.match(page.elements.status.textContent, /Search: use an HTTPS origin/);
  page.elements.searchCustomDomain.value = 'https://custom.example';
  page.elements.searchPath.value = '//other.example/';
  page.submit();
  assert.equal(page.writes.length, 0);
});
