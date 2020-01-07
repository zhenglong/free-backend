// TODO: 字段组件的值怎么合理的回写到redux store中
// 生成store，并初始化到global中去
import { createStore, combineReducers, applyMiddleware, bindActionCreators } from 'redux';
import thunk from 'redux-thunk';
import * as reducers from './reducers';
import * as actionCreators from './actions';
import global from './global';

export default function initStore() {
    let store = createStore(combineReducers(reducers), applyMiddleware(thunk));
    let actions = bindActionCreators(actionCreators, store.dispatch);

    global.store = store;
    global.setActions(actions);

    /**
     * 
     * store值变化之后，遍历表达式集合
     * 
     */
    store.subscribe(() => {
        let keys = Object.getOwnPropertyNames(global.expressionGroup);
        for (let expr of keys) {
            // 更新计算属性
            global.expressionGroup[expr].refreshValue();
        }
    });
}