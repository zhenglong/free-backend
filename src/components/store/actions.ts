import Ajax from '../../fbd-ajax';
import actionTypes from './action-types';
import { PaginationData } from './data-interface';
import global from './global';
import { RecordIdGetter } from '../../interfaces';

export function updateQueryCondition(data: any) {
    return {
        type: actionTypes.UPDATE_QUERY_CONDITION,
        data
    };
}

function fetchDataSource(url: string, param: any): Promise<any> {
    return Ajax.post(url, param).then(({data}) => {
        return data;
    });
}

export function updateDataSource(param: any) {
    return dispatch => {
        return fetchDataSource(global.config.searchAPI, param).then(data => {
            dispatch({
                type: actionTypes.UPDATE_DATA_SOURCE,
                data: data.resultData
            });
            dispatch(updatePagination({
                current: data.pagination.currentPageIndex,
                total: data.pagination.totalCount
            }));
        })
    }
}

/**
 * 
 * 从datasource中删除一行
 * 
 */
export function deleteRowInDataSource(deletedRecordKey, idGetter: RecordIdGetter) {
    let {dataSource} = global.store.getState();
    if (!dataSource || !dataSource.length) {
        return;
    }
    dataSource = dataSource.filter(item => idGetter(item) != deletedRecordKey);
    return {
        type: actionTypes.UPDATE_DATA_SOURCE,
        data: dataSource
    };
}

export function updateRowInDataSource(newRowData, idGetter: RecordIdGetter) {
    let { dataSource } = global.store.getState();
    if (!dataSource || !dataSource.length) {
        return;
    }
    let itemIndex = -1;
    for (let index = 0; index < dataSource.length; index++) {
        if (idGetter(dataSource[index]) == idGetter(newRowData)) {
            itemIndex = index;
            break;
        }
    }
    dataSource[itemIndex] = newRowData;
    return {
        type: actionTypes.UPDATE_DATA_SOURCE,
        data: dataSource
    };
}

export function insertBefore(newRowData, idGetter: RecordIdGetter, afterId: any) {
    return {
        type: actionTypes.INSERT_BEFORE,
        data: {
            newRowData,
            idGetter,
            afterId
        }
    }
}

export function updatePagination(data: PaginationData) {
    return {
        type: actionTypes.UPDATE_PAGINATION,
        data
    };
}