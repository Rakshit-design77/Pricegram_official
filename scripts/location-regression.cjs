const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const { parseHTML } = require('linkedom');
const { window } = parseHTML('<html><body></body></html>');
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Node', 'NodeFilter', 'Event', 'CustomEvent', 'MutationObserver']) {
  global[key] = key === 'window' ? window : window[key];
}
global.getComputedStyle = () => ({ display: 'block', visibility: 'visible', overflow: 'visible' });
window.getComputedStyle = global.getComputedStyle;
global.requestAnimationFrame = callback => setTimeout(callback, 0);
global.cancelAnimationFrame = clearTimeout;
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require('react');
const { createRoot } = require('react-dom/client');
const root = path.resolve(__dirname, '..');

function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const resolve = id => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (!id.startsWith('@/')) return require(id);
      const base = path.join(root, 'src', id.slice(2));
      return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
    };
    new Function('require', 'exports', js)(resolve, mod.exports);
    return mod.exports;
  }
  return relative => load(path.join(root, relative));
}

function storage(raw, { readFails = false, writeFails = false } = {}) {
  window.localStorage = {
    getItem() { if (readFails) throw new Error('Storage denied'); return raw; },
    setItem(_key, value) { if (writeFails) throw new Error('Quota exceeded'); raw = value; },
    removeItem() { raw = null; },
  };
}

for (const [name, raw, options] of [
  ['first visit', null],
  ['broken JSON', '{bad json'],
  ['invalid envelope', '{"state":null,"version":1}'],
  ['unreadable storage', null, { readFails: true, writeFails: true }],
  ['invalid saved location', '{"state":{"location":123,"locationCoordinates":{}},"version":1}'],
  ['legacy implicit pincode', '{"state":{"location":"201310"},"version":0}'],
]) {
  test(`${name}: real store hydrates and mounted hook requests a location`, async () => {
    storage(raw, options);
    const load = loader();
    const store = load('src/store/useStore.ts').useStore;
    const hook = load('src/hooks/useDeliveryLocation.ts').useDeliveryLocation;
    assert.equal(store.persist.hasHydrated(), true);
    const element = document.createElement('div');
    document.body.appendChild(element);
    const renderer = createRoot(element);
    function Gate() {
      const { hydrated, ready } = hook();
      return React.createElement('p', null, hydrated && !ready ? 'Choose location' : ready ? 'Ready' : 'Loading');
    }
    try {
      await React.act(async () => renderer.render(React.createElement(Gate)));
      assert.equal(element.textContent, 'Choose location');
      await React.act(async () => store.getState().setLocation('201301'));
      assert.equal(element.textContent, 'Ready');
    } finally {
      await React.act(async () => renderer.unmount());
      element.remove();
    }
  });
}

test('valid saved location is restored and persisted fields cannot overwrite store actions', () => {
  storage(JSON.stringify({ version: 1, state: { location: '201301', setLocation: 'broken', wishlist: ['keep', 42] } }));
  const store = loader()('src/store/useStore.ts').useStore;
  assert.equal(store.getState().location, '201301');
  assert.equal(typeof store.getState().setLocation, 'function');
  assert.deepEqual(store.getState().wishlist, ['keep']);
});

test('location dialog explains invalid input, preserves the choice until valid, and handles denied GPS', async () => {
  // Use real React and real input/button controls. The dialog shell is simplified
  // because linkedom has no layout/focus engine; Radix focus trapping needs a browser.
  const shell = ({ children }) => React.createElement('div', { role: 'dialog' }, children);
  const load = loader({
    'lucide-react': Object.fromEntries(['MapPin', 'Navigation', 'Loader2', 'X'].map(name => [name, () => null])),
    '@/components/ui/dialog': {
    Dialog: ({ open, children }) => open ? children : null,
    DialogContent: shell,
    DialogTitle: ({ children }) => React.createElement('h2', null, children),
    DialogDescription: ({ children }) => React.createElement('p', null, children),
  } });
  const Modal = load('src/components/location/LocationModal.tsx').LocationModal;
  const element = document.createElement('div');
  document.body.appendChild(element);
  const renderer = createRoot(element);
  let selected, closed = 0;
  const originalNavigator = Object.getOwnPropertyDescriptor(global, 'navigator');
  Object.defineProperty(global, 'navigator', { configurable: true, value: {
    geolocation: { getCurrentPosition(_success, failure) { failure({ code: 1 }); } },
  } });
  try {
    await React.act(async () => renderer.render(React.createElement(Modal, {
      isOpen: true, required: true, currentLocation: '', onClose: () => closed++,
      onLocationChange: value => { selected = value; }, onCoordinatesChange() {},
    })));
    const input = element.querySelector('input');
    const form = element.querySelector('form');
    const submit = async () => React.act(async () => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })));
    const fill = async value => React.act(async () => {
      // Invoke React's input handler: linkedom does not implement browser input tracking.
      const props = input[Object.keys(input).find(key => key.startsWith('__reactProps$'))];
      props.onChange({ target: { value } });
    });
    assert.equal(element.querySelector('button[type="submit"]').disabled, false);
    await submit();
    assert.match(element.querySelector('[role="alert"]').textContent, /Enter your delivery pincode/);
    for (const [value, message] of [['123', /exactly 6/], ['1234567', /exactly 6/], ['ABC123', /numbers only/], ['000000', /cannot start with 0/]]) {
      await fill(value);
      await submit();
      assert.match(element.querySelector('[role="alert"]').textContent, message);
      assert.equal(input.getAttribute('aria-invalid'), 'true');
      assert.equal(selected, undefined);
      assert.equal(closed, 0);
    }
    const gps = [...element.querySelectorAll('button')].find(button => button.textContent.includes('Use Current Location'));
    await React.act(async () => gps.click());
    assert.match(element.textContent, /permission was denied/);
    await fill(' 201301 ');
    await submit();
    assert.equal(selected, '201301');
    assert.equal(closed, 1);
    assert.equal(input.getAttribute('aria-invalid'), 'false');
  } finally {
    await React.act(async () => renderer.unmount());
    element.remove();
    if (originalNavigator) Object.defineProperty(global, 'navigator', originalNavigator);
    else delete global.navigator;
  }
});
