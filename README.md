# webcache

A flexible web storage cache with automatic key expiry.

## Features

- Easy data access and modification
- Automatic key expiry with a customizable cleanup interval
- Configurable storage (`sessionStorage` and `localStorage`)

## Documentation

The configurable parameters upon initialization are the following:

1. `store`: type of web storage (default: `sessionStorage`)
2. `cleanupTimer`: frequency of key expiry cleanup in seconds (default: `30`)

```js
webcache({
  store: "localStorage",
  cleanupTimer: 30,
});
```

The cache itself can be modified with the following functions:

```js
cache.get(key);                            // returns parsed data stored under key
cache.getAll();                            // returns all stored key/value pairs as an object
cache.set(key, value[, overwrite[, ttl]]); // assigns key to value with expire time in seconds
cache.setAll(data[, overwrite[, ttl]]);    // assigns all keys to values inside the data object
cache.removeKey(key);                      // removes entries with the key, returns the value
cache.removeValue(value);                  // removes entries with the value, returns list of keys
cache.size();                              // returns number of keys
cache.keys();                              // returns list of keys
cache.has(key);                            // returns true or false
cache.clear();                             // clear all items from storage
cache.cleanup();                           // manually removes all expired entries
cache.iterate((k, v) => {});               // call function on each key/value pair, return false to exit
```

## Examples

```js
const cache = webcache({
  store: "sessionStorage",
  cleanupTimer: 30,
});
```

### `get()` and `set()`

```js
// Set item that lasts forever
cache.set("key1", "forever");
cache.get("key1"); // "forever"

// Set item with 5 second expiry and overwrites previous value
cache.set("key1", "only15", true, 5);
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
cache.setAll(data, true, 5);
// Get all items before they expire
cache.getAll(); // { key1: "value1", key2: "value2" }
```

### `removeKey()` and `removeValue()`

```js
// Remove entry by key
cache.removeKey("key1"); // "value1"
// Remove entry by value
cache.removeValue("value2"); // "value2"
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
cache.setAll(data);
// Run function until after value equals "value2"
cache.iterate((k, v) => {
  console.log(`${k}: ${v}`);
  if (v === "value2") return false;
});
// key1: value1
// key2: value2
```
