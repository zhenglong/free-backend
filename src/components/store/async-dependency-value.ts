// 本地缓存最后一次查询条件
// 如果页面名称发生变化，则重置“位置名称”的下拉选项
// 都通过computedvalue的通知机制来更新
// 
// 恢复最后一次查询条件

// location变化 -> 通知store -> 订阅变化
//     -> 更新“页面名称”的数据源 -> "页面名称"组件重新渲染，刷新下拉列表

// 怎么监测“页面名称”的数据源发生变化？

// valueSet支持ComputedValue，如果它对应的值发生变化，则重新渲染组件自身

// 该对象的值依赖于其它输入值，如果那些值变化之后，会触发接口调用，然后更新该对象的最终值
// 如果发生变化，则调用监听回调函数列表

// 依赖的变量属性
// 接口url
// 回调获取值
// 返回数据转换函数
// 触发回调函数列表

// store -> 重新计算值 -> 触发dependency-value重新计算 -> 值变化之后触发回调函数

// 当表达式的值变化的时候，dependency的值会自动更新，所有依赖于该值的回调函数都会执行
// {
//     valueSet: new AsyncDependencyValue()
// }

// this.valueSet.then(data => {
//     // 重新渲染组件
// })

import ComputedValue from "./computed-value";
import Ajax from '../../fbd-ajax';
import {Observable} from '../fbd-table/observable';
import { Thenable } from "./data-interface";

class PromiseLikeObservable<T> implements Thenable {

    value_: T;
    observer: Observable;
    static topic = 'watch.PromiseListObservable';

    constructor() {
        this.value_ = null;
        this.observer = new Observable();
    }

    set value(newVal: T) {
        this.value_ = newVal;
        this.observer.publish(PromiseLikeObservable.topic, this.value_);
    }

    then(cb: (newVal: T) => void): Thenable {
        this.observer.subscribe(PromiseLikeObservable.topic, cb);
        return this;
    }
}

function isEmptyObject(obj) {
    let keys = Object.keys(obj);
    let res = true;
    for (let k of keys) {
        if (obj[k]) {
            res = false;
            break;
        } 
    }

    return res;
}

export default class AsyncDependencyValue<T> {
    currentValue: PromiseLikeObservable<T>;
    url: string;
    responseTransformer: (data: any) => T;
    computedValue: ComputedValue;

    constructor(computedValue: ComputedValue, url: string, responseTransformer: (data: any) => T) {

        this.fetchNewValue = this.fetchNewValue.bind(this);

        this.computedValue = computedValue;
        this.url = url;
        this.responseTransformer = responseTransformer;
        this.currentValue = new PromiseLikeObservable();
        this.computedValue.onChange(this.fetchNewValue);
    }

    fetchNewValue(newVal: any) {
        if (isEmptyObject(newVal)) {
            this.currentValue.value = null;
            return;
        }
        Ajax.get(this.url, newVal).then(({data}) => {
            this.currentValue.value = this.responseTransformer(data);
        });
    }

    get value(): Thenable {
        return this.currentValue;
    }
}