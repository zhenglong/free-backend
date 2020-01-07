if (!Array.prototype.unique) {
    Array.prototype.unique = function(idGetter): any[] {
        let res = [];
        for (let elem of this) {
            let index = res.findIndex(item => idGetter(item) == idGetter(elem));
            if (index < 0) {
                res.push(elem);
            } else {
                res[index] = elem;
            }
        }
        return res;
    };
}