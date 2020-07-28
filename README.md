# wcache

[![npm version](https://badge.fury.io/js/wcache.svg)](https://badge.fury.io/js/wcache)
[![install size](https://packagephobia.com/badge?p=wcache)](https://packagephobia.com/result?p=wcache)

A flexible, general-purpose web storage cache with automatic key expiry and namespace support.

## Features

- Easy data access and modification
  - Query by key and by value
- Lightweight (~11 kB)
- Automatic key expiry with a customizable cleanup interval
- Configurable storage (`sessionStorage` and `localStorage`)
- Segmented shared storage using namespaces

## Documentation

The configurable parameters upon initialization are the following:

1. `store`: type of web storage (`sessionStorage`/`localStorage`)
2. `cleanupTimer`: frequency of key expiry cleanup in seconds
3. `namespace`: namespace for this web store
4. `allowDuplicateNamespaces`: whether to force unique namespaces

```js
// defaults
const cache = wcache({
  store: "sessionStorage",
  cleanupTimer: 15,
  namespace: "ns1",
  allowDuplicateNamespaces: true,
});
```

The cache itself can be accessed and modified with the following functions:

```js
cache.get(key);                      // returns parsed data stored under key
cache.getAll();                      // returns all stored key/value pairs as an object
cache.set(data[, overwrite[, ttl]]); // assigns all keys to values in the data object with expire time
cache.removeKey(key);                // removes entries with the key, returns the value
cache.removeValue(value);            // removes entries with the value, returns list of keys
cache.iterate((k, v) => {});         // call function on each key/value pair, return false to exit
cache.size();                        // returns number of keys
cache.keys();                        // returns list of keys
cache.has(key);                      // returns true or false
cache.clear();                       // clear all items from storage in this namespace
cache.clearAll();                    // clear all items from storage (not namespace sensitive)
cache.cleanup();                     // manually removes all expired entries
```

## Examples

```js
npm install wcache
```

```js
const cache = wcache({
  store: "sessionStorage",
  cleanupTimer: 30,
  namespace: "my_project",
  allowDuplicateNamespaces: false,
});
```

### `get()` and `set()`

```js
// Set item that lasts forever
cache.set({ key1: "forever" });
cache.get("key1"); // "forever"

// Set item with 5 second expiry and overwrites previous value
cache.set({ key1: "only5" }, true, 5);
cache.get("key1"); // "only5"
// Wait 10 seconds
setTimeout(() => {
  cache.get("key1"); // null
}, 10000);
```

### `getAll()` and `setAll()`

```js
const data = {
  key1: "value1",
  key2: "value2",
};
// Set multiple items with same 5 second expiry (overwriting any conflicts)
cache.set(data, true, 5);
// Get all items before they expire
cache.getAll(); // { key1: "value1", key2: "value2" }
```

### `removeKey()` and `removeValue()`

```js
const data = {
  key1: "value1",
  key2: "value2",
};
// Set multiple items (overwriting any conflicts)
cache.set(data, true);
// Remove entry by key
cache.removeKey("key1"); // "value1"
// Remove entry by value
cache.removeValue("value2"); // ["key2"]
// Get value from nonexistent key
cache.get("key1"); // null
```

### `iterate()`

```js
const data = {
  key1: "value1",
  key2: "value2",
  key3: "value3",
  key4: "value4",
};
// Set multiple items that last forever
cache.set(data);
// Run function until after value equals "value3"
// Order is not guaranteed in web storage
cache.iterate((k, v) => {
  console.log(`${k}: ${v}`);
  if (v === "value3") return false;
});
```

### `size()`, `keys()`, `has()`, `clear()`

```js
const data = {
  key1: "value1",
  key2: "value2",
};
// Set multiple items that last forever
cache.set(data);
cache.size(); // 2
cache.keys(); // ["key1", "key2"]
cache.has("key3"); // false
cache.clear();
cache.size(); // 0
```
