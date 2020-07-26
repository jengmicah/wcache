
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
    const has = (key) => {
        const obj = storage.getItem(key);
        return obj ? true : false;
    }
    const set = (key, value, expireSeconds) => {
        storage.setItem(key, JSON.stringify({
            expire: expireSeconds ? Number(new Date()) + (expireSeconds * 1000) : null,
            value: value
        }));
    }
    const remove = (key) => storage.removeItem(key);

    const clear = () => storage.clear();

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
        get,
        getAll,
        has,
        set,
        remove,
        clear,
        cleanup,
        isSupported
    };
};