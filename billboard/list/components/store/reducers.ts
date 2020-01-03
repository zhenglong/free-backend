import { HjAction } from "./hj-action";
import ActionTypes from './action-types';
import actionTypes from "./action-types";
import {PaginationData} from './data-interface';
import { stat } from "fs";

export function queryConditions(state: any = {}, action: HjAction<any>): any {
    switch (action.type) {
        case ActionTypes.UPDATE_QUERY_CONDITION:
            return {...state, ...action.data};
        default:
            return state;
    }
}

export function dataSource(state: any = [], action: HjAction<any>): any {
    switch(action.type) {
        case actionTypes.UPDATE_DATA_SOURCE:
            return action.data;
        case actionTypes.INSERT_BEFORE:
            // 找到插入元素的索引，然后执行插入动作
            let index = 0;
            let {newRowData, idGetter, afterId} = action.data;
            for (; index < state.length; index++) {
                if (idGetter(state[index]) == afterId) {
                    break;
                }
            }
            if (index != state.length) {
                state.splice(index, 0, newRowData);
            }
            return state;
        default:
            return state;
    }
}

export function pagination(state: PaginationData = {}, action: HjAction<any>): PaginationData {
    switch (action.type) {
        case actionTypes.UPDATE_PAGINATION:
            return {...state, ...action.data};
        default:
            return state;
    }
}