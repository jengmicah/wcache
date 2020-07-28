module.exports = function ({
    store = 'sessionStorage',
    cleanupTimer = 15,
    namespace = 'ns1',
    allowDuplicateNamespaces = true
}) {
    const storage = window[store];

    const isSupported = () => typeof (Storage) !== "undefined";
    const isAvailable = (store) => {
        return !!store
            && typeof store.getItem === 'function'
            && typeof store.setItem === 'function'
            && typeof store.removeItem === 'function';
    }
    const isValidNamespace = () => {
        if (namespace.includes('.')) {
            console.error(`Namespace "${namespace}" cannot contain a period.`);
            return false;
        }
        for (const namespaced_key in { ...storage }) {
            if (namespaced_key.substring(0, namespaced_key.indexOf('.')) === namespace && !allowDuplicateNamespaces) {
                console.error(`Namespace "${namespace}" is a duplicate. Either change the namespace or set allowDuplicateNamespaces to true.`);
                return false;
            }
        }
        return true;
    }

    if (!isSupported()) {
        console.error('Web storage is not supported on this browser.');
        return null;
    } else if (!isAvailable(storage)) {
        console.error(`Web store "${store}" is not available.`);
        return null;
    } else if (!isValidNamespace()) {
        return null;
    }

    const namespaced = (key) => `${namespace}.${key}`;
    const unnamespaced = (namespaced_key) => namespaced_key.substring(namespaced_key.indexOf('.') + 1)
    const getNamespacedKey = (namespaced_key) => {
        const item = JSON.parse(storage.getItem(namespaced_key));
        if (item && (item.expiry === null || Number(new Date()) <= item.expiry))
            return item.value
        return null
    }
    const hasNamedspacedKey = (namespaced_key) => getNamespacedKey(namespaced_key) ? true : false;
    const removeNamespacedKey = (namespaced_key) => {
        const val = getNamespacedKey(namespaced_key);
        storage.removeItem(namespaced_key);
        return val;
    }
    const isInNamespace = (key) => key.substring(0, key.indexOf('.')) === namespace;
    const loopNamespacedKeys = (fn) => {
        for (const namespaced_key in { ...storage }) {
            if (isInNamespace(namespaced_key)) {
                const res = fn(namespaced_key);
                if (!res && res !== undefined) break;
            }
        }
    }

    const get = (key) => getNamespacedKey(namespaced(key))
    const getAll = () => {
        let all = {};
        loopNamespacedKeys((namespaced_key) => {
            all[unnamespaced(namespaced_key)] = getNamespacedKey(namespaced_key);
        });
        return all;
    }
    const set = (data, overwrite = false, ttl = null) => {
        for (const [key, value] of Object.entries(data)) {
            const namespaced_key = namespaced(key)
            if (!hasNamedspacedKey(namespaced_key) || overwrite) {
                storage.setItem(namespaced_key, JSON.stringify({
                    expiry: ttl ? Number(new Date()) + (ttl * 1000) : null,
                    value: value
                }));
            }
        }
    }
    const removeKey = (key) => removeNamespacedKey(namespaced(key));
    const removeValue = (val) => {
        let keys = [];
        loopNamespacedKeys((namespaced_key) => {
            if (getNamespacedKey(namespaced_key) === val) {
                keys.push(unnamespaced(namespaced_key));
                removeNamespacedKey(namespaced_key);
            }
        });
        return keys;
    };
    const iterate = (user_fn) => {
        loopNamespacedKeys((namespaced_key) => {
            const unnamespaced_key = unnamespaced(namespaced_key);
            const res = user_fn(unnamespaced_key, getNamespacedKey(namespaced_key));
            if (!res && res !== undefined) return false;
        });
    }
    const cleanup = () => {
        const now = Number(new Date());
        loopNamespacedKeys((namespaced_key) => {
            const item = JSON.parse(storage.getItem(namespaced_key));
            if (item && item.expiry && now > item.expiry)
                removeNamespacedKey(namespaced_key);
        });
    }
    const keys = () => {
        let keys = [];
        loopNamespacedKeys((namespaced_key) => {
            keys.push(unnamespaced(namespaced_key));
        });
        return keys;
    }
    const size = () => keys().length;
    const has = (key) => hasNamedspacedKey(namespaced(key));
    const clear = () => {
        loopNamespacedKeys((namespaced_key) => {
            removeNamespacedKey(namespaced_key);
        });
    }
    const clearAll = () => storage.clear();

    cleanup();
    setInterval(cleanup, cleanupTimer * 1000);

    return {
        get,
        getAll,
        set,
        removeKey,
        removeValue,
        cleanup,
        iterate,
        keys,
        size,
        has,
        clear,
        clearAll
    };
};