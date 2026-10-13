const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8').replace(/^\uFEFF/, '');
const context = vm.createContext({ URL });
vm.runInContext(read('settings.js'), context);
const settings = context.ArchiveSettings;

test('submission preserves the complete selected link as a single query value', () => {
  for (const target of [
    'https://example.com/?a=1&b=2#section',
    'https://example.com/?url=https%3A%2F%2Fother.test&run=1',
    'https://example.com/a%20b?q=✓+plus#fragment'
  ]) {
    const result = new URL(settings.buildUrl('add_to_archive', target));
    assert.equal(result.origin, 'https://archive.is');
    assert.equal(result.searchParams.get('url'), target);
    assert.deepEqual([...result.searchParams.keys()], ['run', 'url']);
    assert.equal(result.pathname, '/');
    assert.equal(result.searchParams.get('run'), '1');
    assert.equal(result.hash, '');
  }
});

test('unsafe or malformed saved destinations cannot redirect selected links', () => {
  for (const domain of [
    'https://evil.test', 'http://archive.is', 'https://archive.is.evil.test',
    'https://archive.is@evil.test', 'https://user:secret@archive.is',
    'https://archive.is:444', 'https://archive.is/redirect',
    'https://archive.is/?redirect=evil', 'javascript:alert(1)', ''
  ]) {
    for (const action of ['add_to_archive', 'search_in_archive']) {
      const result = new URL(settings.buildUrl(action, 'https://example.com', {
        archiveDomain: domain, searchDomain: domain,
        archivePath: '//evil.test/?url=', searchPath: '@evil.test/'
      }));
      assert.equal(result.origin, 'https://archive.is');
    }
  }
});

test('supported domains and safe legacy origin forms are preserved', () => {
  for (const domain of settings.domains) {
    assert.equal(settings.normalizeDomain(domain + '/'), domain);
    assert.equal(new URL(settings.buildUrl('add_to_archive', 'https://example.com', {
      archiveDomain: domain
    })).origin, domain);
  }
  assert.equal(settings.normalizeDomain('https://ARCHIVE.IS:443/'), 'https://archive.is');
});

test('non-web links, malformed URLs, credentials, and unknown actions are rejected', () => {
  for (const target of [undefined, null, 12, '', 'not a URL', 'javascript:alert(1)',
    'mailto:a@example.com', 'file:///private', 'data:text/html,hello',
    'https://user:secret@example.com/', 'https://user@example.com/']) {
    assert.equal(settings.buildUrl('add_to_archive', target), null);
    assert.equal(settings.buildUrl('search_in_archive', target), null);
  }
  assert.equal(settings.buildUrl('unknown', 'https://example.com'), null);
});

test('search keeps URL-as-path convention and sends fragments to the service', () => {
  assert.equal(settings.buildUrl('search_in_archive', 'https://example.com/a?q=1&b=2#part'),
    'https://archive.is/https://example.com/a?q=1&b=2%23part');
});

test('custom submit and search combine origin, prefix, encoded link, and suffix', () => {
  const target = 'https://example.com/a?x=1&y=2#part';
  for (const [action, prefix] of [['add_to_archive', 'archive'], ['search_in_archive', 'search']]) {
    const saved = {
      [prefix + 'Custom']: true, [prefix + 'Domain']: 'https://custom.example:8443',
      [prefix + 'Path']: '/capture?url=', [prefix + 'Suffix']: '&mode=save',
      [prefix + 'Encoding']: 'encoded'
    };
    const result = new URL(settings.buildUrl(action, target, saved));
    assert.equal(result.origin, 'https://custom.example:8443');
    assert.equal(result.pathname, '/capture');
    assert.equal(result.searchParams.get('url'), target);
    assert.equal(result.searchParams.get('mode'), 'save');
    assert.equal(result.hash, '');
    assert.equal(settings.normalize(saved)[prefix + 'Custom'], true);
  }
});

test('custom mode must be explicit and custom raw paths are supported', () => {
  const saved = { searchCustom: true, searchDomain: 'https://custom.example',
    searchPath: '/lookup/', searchEncoding: 'raw', searchSuffix: '' };
  assert.equal(settings.buildUrl('search_in_archive', 'https://example.com/#part', saved),
    'https://custom.example/lookup/https://example.com/%23part');
  delete saved.searchCustom;
  assert.equal(new URL(settings.buildUrl('search_in_archive', 'https://example.com', saved)).origin,
    'https://archive.is');
});

test('invalid custom templates cannot switch origin, inject credentials, or use unsafe schemes', () => {
  const base = { archiveCustom: true, archiveDomain: 'https://custom.example',
    archivePath: '/?url=', archiveSuffix: '', archiveEncoding: 'encoded' };
  for (const change of [
    { archiveDomain: 'http://custom.example' },
    { archiveDomain: 'javascript:alert(1)' },
    { archiveDomain: 'https://user:secret@custom.example' },
    { archiveDomain: 'https://custom.example/path' },
    { archivePath: '//evil.test/?url=' },
    { archivePath: '/\\evil.test/' },
    { archivePath: '/\n/evil.test/' },
    { archivePath: '@evil.test/' },
    { archiveSuffix: '\r\nInjected: header' },
    { archiveSuffix: '\\evil.test' },
    { archiveEncoding: 'unknown' }
  ]) {
    const saved = { ...base, ...change };
    assert.equal(settings.validateAction(saved, 'archive'), null);
    assert.equal(new URL(settings.buildUrl('add_to_archive', 'https://example.com', saved)).origin,
      'https://archive.is');
  }
});

test('legacy built-in submit path upgrades to homepage while custom endpoints stay intact', () => {
  const saved = { archiveDomain: 'https://archive.ph', archivePath: '/submit/?url=' };
  assert.equal(settings.buildUrl('add_to_archive', 'https://example.com', saved),
    'https://archive.ph/?run=1&url=https%3A%2F%2Fexample.com');
  saved.archiveCustom = true;
  assert.equal(settings.buildUrl('add_to_archive', 'https://example.com', saved),
    'https://archive.ph/submit/?url=https%3A%2F%2Fexample.com');
});

function worker(storageError = false, saved = {}) {
  const menus = [], tabs = [], listeners = {};
  const chrome = {
    runtime: { onInstalled: { addListener(fn) { listeners.install = fn; } } },
    contextMenus: {
      removeAll(fn) { menus.length = 0; fn(); },
      create(item) { menus.push(item); },
      onClicked: { addListener(fn) { listeners.click = fn; } }
    },
    storage: { sync: { get(defaults, fn) {
      if (storageError) chrome.runtime.lastError = { message: 'storage failed' };
      fn({ ...defaults, archiveDomain: 'https://evil.test', ...saved });
      delete chrome.runtime.lastError;
    } } },
    tabs: { create(item, fn) { tabs.push(item); fn(); } }
  };
  const ctx = vm.createContext({ chrome, URL, console: { error() {} } });
  ctx.importScripts = (file) => vm.runInContext(read(file), ctx);
  vm.runInContext(read('background.js'), ctx);
  return { menus, tabs, listeners };
}

test('worker replaces menus on updates and opens only validated explicit actions', () => {
  const { menus, tabs, listeners } = worker();
  listeners.install();
  listeners.install();
  assert.equal(menus.length, 2);
  assert.equal(menus[0].targetUrlPatterns.join(','), 'http://*/*,https://*/*');
  listeners.click({ menuItemId: 'other', linkUrl: 'https://example.com' });
  listeners.click({ menuItemId: 'add_to_archive', linkUrl: 'javascript:alert(1)' });
  assert.equal(tabs.length, 0);
  listeners.click({ menuItemId: 'add_to_archive', linkUrl: 'https://example.com/?a=1&b=2' });
  assert.equal(tabs.length, 1);
  assert.equal(new URL(tabs[0].url).origin, 'https://archive.is');
  assert.equal(new URL(tabs[0].url).searchParams.get('url'), 'https://example.com/?a=1&b=2');
});

test('storage failure prevents opening a tab', () => {
  const { tabs, listeners } = worker(true);
  listeners.click({ menuItemId: 'add_to_archive', linkUrl: 'https://example.com' });
  assert.equal(tabs.length, 0);
});

test('worker uses a saved custom template and presets ignore leftover custom text', () => {
  const saved = { archiveCustom: true, archiveDomain: 'https://custom.example',
    archivePath: '/save?target=', archiveSuffix: '&format=html', archiveEncoding: 'encoded' };
  const { tabs, listeners } = worker(false, saved);
  listeners.click({ menuItemId: 'add_to_archive', linkUrl: 'https://example.com/?x=1&y=2' });
  const result = new URL(tabs[0].url);
  assert.equal(result.origin, 'https://custom.example');
  assert.equal(result.searchParams.get('target'), 'https://example.com/?x=1&y=2');
  assert.equal(result.searchParams.get('format'), 'html');
  saved.archiveCustom = false;
  saved.archiveDomain = 'https://archive.ph';
  const preset = new URL(settings.buildUrl('add_to_archive', 'https://example.com', saved));
  assert.equal(preset.origin, 'https://archive.ph');
  assert.equal(preset.pathname, '/');
  assert.equal(preset.searchParams.get('format'), null);
  assert.equal(preset.searchParams.get('url'), 'https://example.com');
});

test('custom suffix is optional and unencodable malformed text fails safely', () => {
  const saved = { archiveCustom: true, archiveDomain: 'https://custom.example', archivePath: '/?url=' };
  assert.equal(settings.buildUrl('add_to_archive', 'https://example.com', saved),
    'https://custom.example/?url=https%3A%2F%2Fexample.com');
  assert.equal(settings.buildUrl('add_to_archive', 'https://example.com/\ud800', saved), null);
});

test('manifest has minimal permissions, valid assets, and matching listing description', () => {
  const manifest = JSON.parse(read('manifest.json'));
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ['contextMenus', 'storage']);
  assert.equal(manifest.host_permissions, undefined);
  assert.ok(read('store/LISTING.md').includes(manifest.description));
  assert.ok(manifest.description.length <= 132);
  for (const [size, file] of Object.entries(manifest.icons)) {
    const data = fs.readFileSync(path.join(root, file));
    assert.equal(data.subarray(1, 4).toString(), 'PNG');
    assert.equal(data.readUInt32BE(16), Number(size));
    assert.equal(data.readUInt32BE(20), Number(size));
  }
  assert.ok(fs.existsSync(path.join(root, manifest.background.service_worker)));
  assert.ok(fs.existsSync(path.join(root, manifest.options_page)));
});
