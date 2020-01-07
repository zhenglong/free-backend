import global from './global';
import { onChangeFunc, IComputedValue } from './data-interface';

/**
 * 比较两个值是否相等
 * 
 */
function objectCompare(obj1: any, obj2: any) {
    if (obj1 == obj2) {
        return true;
    }
    if (typeof obj1 == 'object' && typeof obj2 == 'object') {
        let keys1 = Object.keys(obj1);
        let keys2 = Object.keys(obj2);
        if (keys1.find(k => !keys2.includes(k)) || keys2.find(k => !keys1.includes(k))) {
            return false;
        }
        for (let k of keys1) {
            if (obj1[k] != obj2[k]) {
                return false;
            }
        }
        return true;
    }
    return false;
}
export default class ComputedValue implements IComputedValue {

    expr: string;
    currentValue: any;
    onChangeCallbacks: onChangeFunc[];
    computationFunc: Function;

    constructor(expr: string) {
        this.onChangeCallbacks = [];
        this.expr = expr;
        this.computationFunc = new Function(`"use strict";try{ return (${this.expr.replace(/\$\{([^\}]+)\}/ig, 'this.$1')}); } catch(ex) { return null; }`);
    }

    get value(): any {
        return this.currentValue;
    }

    refreshValue(context?: any): void {
        if (!context) {
            context = global.store.getState().queryConditions || {};
        }
        let newVal = this.computationFunc.call(context);
        if (!objectCompare(newVal, this.currentValue)) {
            if (this.onChangeCallbacks.length) {
                for (let cb of this.onChangeCallbacks) {
                    cb(newVal, this.currentValue);
                }
            }
            this.currentValue = newVal;
        }
    }

    onChange(cb: onChangeFunc) {
        this.onChangeCallbacks.push(cb);
    }
}