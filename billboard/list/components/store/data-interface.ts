import { HjAction } from "./hj-action";
import { RecordIdGetter } from "../../interfaces";

export interface PaginationData {
    current?: number;
    total?: number;
    size?: number;
}

export interface ActionDescriber {

}

export interface SearchActionDescriber {
    updateQueryCondition?: (param: any)=> void;
    updateDataSource?: (param: any)=> void;
    updatePagination?: (data: PaginationData)=> void;
    deleteRowInDataSource?: (deletedRecordKey: any, idGetter: RecordIdGetter) => void;
    updateRowInDataSource?: (newRowData, idGetter: RecordIdGetter) => void;
    insertBefore?: (newRowData, idGetter: RecordIdGetter, afterId: any) => void;
    /**
     * 获取过滤条件
     * 
     */
    getQueryParam?: ()=> any;
}

export type onChangeFunc = (newVal: any, oldValue: any) => void;
export interface IComputedValue {
    refreshValue: () => void;
    onChange: (cb: onChangeFunc) => void;
}

export interface Thenable {
    then(cb: (val) => void): Thenable;
}