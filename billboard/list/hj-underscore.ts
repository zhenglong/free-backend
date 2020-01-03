export function grep(arr, cb) {
    var result = [];
    each(arr, function (i, item) {
        if (cb(item)) result.push(item);
    });
    return result;
}
export function sum(arr, getter) {
    var result = 0;
    each(arr, function (i, item) {
        result += parseFloat(getter(item));
    });
    return result;
}
export function map(arr, cb) {
    var result = [];
    each(arr, function (i, item) {
        result.push(cb(item, i));
    });
    return result;
}
export function reduce(arr, initValue, accumulator) {
    var res = initValue;
    each(arr, (i, item) => {
        res = accumulator(res, item);
    });
    return res;
}
export function each(arr, cb) {
    var i = 0,
        len = arr.length,
        res;
    while (i < len) {
        res = cb(i, arr[i]);
        if (res === false) break;
        i++;
    }
}
export function any(arr, cb) {
    return indexOf(arr, cb) > -1;
}
export function find(arr, cb) {
    var index = indexOf(arr, cb);
    return index > -1 ? arr[index] : null;
}
export function indexOf(arr, cb) {
    var i = 0,
        len = arr.length,
        res = null;
    while (i < len) {
        if (cb(arr[i]) === true) return i;
        i++;
    }
    return -1;
}
export function min(arr, cb) {
    var res;
    each(arr, (i, item) => {
        var v = cb(item);
        if (res == undefined || v < res) res = v;
    });
    return res;
}
export function sort(arr, keyer, desc) {
    arr.sort(function (a, b) {
        var res;
        var ka = keyer(a);
        var kb = keyer(b);
        if (ka > kb) res = 1;
        else if (ka < kb) res = -1;
        else res = 0;
        if (desc) res *= -1;
        return res;
    });
    return arr;
}
export function mapToSelf(arr) {
    let obj = {};
    arr.forEach(item => {
        obj[item] = item;
    })
    return obj;
}