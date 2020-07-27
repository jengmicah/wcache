
const isSupported = () => typeof (Storage) !== "undefined";
const isAvailable = (store) => {
    return !!store
        && typeof store.getItem === 'function'
        && typeof store.setItem === 'function'
        && typeof store.removeItem === 'function';
}

module.exports = function ({
    store = 'sessionStorage',
    cleanupTimer = 15
}) {

    const storage = window[store];

    if (!isSupported()) {
        console.error('Web storage is not supported on this browser.');
        return null;
    } else if (!isAvailable(storage)) {
        console.error(`Web store "${store}" is not available.`);
        return null;
    }

    const keys = () => Object.keys(storage);
    const size = () => keys().length;
    const get = (key) => {
        const obj = storage.getItem(key);
        return obj && JSON.parse(obj).value;
    }
    const getAll = () => {
        let all = {};
        for (const key in { ...storage })
            all[key] = get(key);
        return all;
    }
    const set = (key, value, expireSeconds) => {
        storage.setItem(key, JSON.stringify({
            expire: expireSeconds ? Number(new Date()) + (expireSeconds * 1000) : null,
            value: value
        }));
    }
    const setAll = (data, overwrite = false) => {
        for (const [k, v] of Object.entries(data)) {
            if (!has(k) || overwrite)
                set(k, v);
        }
    }
    const has = (key) => get(key) ? true : false;

    const remove = (key) => {
        const val = get(key);
        storage.removeItem(key);
        return val;
    }
    const removeEqual = (val) => {
        let keys = [];
        Object.keys(storage).map((k) => {
            if (get(k) === val) {
                keys.push(k);
                remove(k);
            }
        })
        return keys;
    };

    const clear = () => storage.clear();

    const iterate = (fn) => {
        for (const key in { ...storage })
            fn(key, get(key));
    }

    const cleanup = () => {
        const now = Number(new Date());
        for (const key in { ...storage }) {
            const item = JSON.parse(storage.getItem(key));
            if (item && item.expire && now > item.expire)
                remove(key)
        };
    }

    cleanup();
    setInterval(cleanup, cleanupTimer * 1000);

    return {
        keys,
        size,
        get,
        getAll,
        has,
        set,
        setAll,
        remove,
        removeEqual,
        clear,
        cleanup,
        iterate
    };
};