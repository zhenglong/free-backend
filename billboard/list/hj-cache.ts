import * as _ from './hj-underscore';

export enum CacheScope {
    session = 1,
    customized = 2
}
class CacheWithoutBackStore {
    scope: CacheScope;
    constructor(scope) {
        this.scope = scope;
    }
    static Collect(clearAll) {
        if (clearAll) {
            _.each([window.localStorage, window.sessionStorage], (i, storage) => {
                let len = storage.length;
                let removed = [];
                for (let i = 0; i < len; i++) {
                    let key = storage.key(i);
                    let data = JSON.parse(storage.getItem(key));
                    if (!data.pinned) removed.push(key);
                }
                _.each(removed, (i, k) => {
                    storage.removeItem(k);
                });
            });
        } else {
            _.each([window.localStorage, window.sessionStorage], (i, storage) => {
                let len = storage.length;
                let removed = [];
                for (let i = 0; i < len; i++) {
                    let key = storage.key(i);
                    let data = JSON.parse(storage.getItem(key));
                    if (data.expiration && ((new Date()).valueOf() > data.expiration)) removed.push(key);
                }
                _.each(removed, (i, k) => {
                    storage.removeItem(k);
                });
            });
        }
        return Promise.resolve(null);
    }
    restore(keys) {
        if (!keys) return;
        var v = {};
        var storeKey = '__hj_store__';
        for (var i = 0; i < keys.length; i++) v[keys[i]] = this.get(keys[i]);
        window[storeKey] = v;
        return Promise.resolve(null);
    }

    getCache() {
        return (this.scope == CacheScope.session) ? window.sessionStorage : window.localStorage;
    }

    put(key, val, expiration?) {
        var internal = this.getCache();
        if (!expiration) expiration = 0;
            val = JSON.stringify({
            expiration: ((expiration > 0) ? (new Date().valueOf() + expiration * 1000) : 0),
            data: val,
            pinned: expiration < 0
        });
        internal.setItem(key, val);
        return Promise.resolve(null);
    }
    puts(arr) {
        var internal = this.getCache();
        for (var i = 0; i < arr.length; i++) {
            if (!arr[i].expiration) arr[i].expiration = 0;
            var val = JSON.stringify({
                expiration: ((arr[i].expiration > 0) ? (new Date().valueOf() + arr[i].expiration * 1000) : 0),
                data: arr[i].value,
                pinned: arr[i].expiration < 0
            });
            internal.setItem(arr[i].key, val);
        }
        return Promise.resolve(null);
    }
    get(key) {
        var internal = this.getCache();
        var str = internal.getItem(key);
        if (!str) return null;
        let obj = JSON.parse(str);
        let expired = (obj.expiration && (obj.expiration < (new Date()).valueOf()));
        if (!expired) {
            return obj.data;
        } else {
            internal.removeItem(key);
            return null;
        }
    }
    getAsync(key) {
        return Promise.resolve(this.get(key));
    }
    hasKey(key) {
        var internal = this.getCache();
        var v = internal.getItem(key);
        return v !== null;
    }

    remove(key) {
        var internal = this.getCache();
        internal.removeItem(key);
        return Promise.resolve(null);
    }
    removeByKeys(keys) {
        for (var i = 0; i < keys.length; i++) this.remove(keys[i]);
        return Promise.resolve(null);
    }

    removeByNamespace(namespace) {
        var internal = this.getCache();
        var key;
        var splitting;
        var i = 0;
        while (i < internal.length) {
            key = internal.key(i);
            splitting = key.split('.');
            if (splitting[splitting.length - 1] == namespace) {
                internal.removeItem(key);
            } else {
                i++;
            }
        }
        return Promise.resolve(null);
    }
}
function isBackStoreNeeded() {
    return false;
}
export class Cache {
    backstore1: any;
    backstore2: any;
    constructor(scope) {
        this.backstore1 = null;
        this.backstore2 = new CacheWithoutBackStore(scope);
    }
    /*
     * @param {boolean} clearAll - true: clear the all unpinned items; false: clear the expired only
     */
    static Collect(clearAll) {
        return isBackStoreNeeded() ? Promise.resolve(null) : CacheWithoutBackStore.Collect(clearAll);
    }
    restore(keys) {
        return this.getStore().restore(keys);
    }
    getStore() {
        return isBackStoreNeeded() ? this.backstore1 : this.backstore2;
    }
    /*
     * @param {string} key
     * @param {object} val
     * @param {int?} expiration - 0: removable by default, >0: expired in seconds, -1: could be removed explicitly only
     *
     */
    put(key, val, expiration?) {
        return this.getStore().put(key, val, expiration);
    }
    puts(arr) {
        return this.getStore().puts(arr);
    }
    get(key) {
        return this.getStore().get(key);
    }
    getAsync(key) {
        return this.getStore().getAsync(key);
    }
    hasKey(key) {
        return this.getStore().hasKey(key);
    }
    remove(key) {
        return this.getStore().remove(key);
    }
    removeByKeys(keys) {
        return this.getStore().removeByKeys(keys);
    }
    removeByNamespace(namespace) {
        return this.getStore().removeByNamespace(namespace);
    }
}
