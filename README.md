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
