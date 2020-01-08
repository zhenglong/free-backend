import React, { Component } from "react";
import ReactDOM from 'react-dom';
import FbdForm from '../components/fbd-form';
import FbdTable from "../components/fbd-table";
import FbdPagination from "../components/fbd-pagination";
import initStore from '../components/store';
import global from '../components/store/global';
import {travelFieldDef} from '../util';
import cacheKey from '../cache-key';

export default function listCreator(formProps: any, tableProps: any, paginationProps: any) {
    let fbdTableRef = React.createRef<FbdTable>();
    let fbdPaginationRef = React.createRef<FbdPagination>();

    let savedFormData = global.cache.get(cacheKey.savedFieldValues);

    // 如果强制指定了页面名称，且与缓存中的页面名称不一致，则忽略缓存
    let defaultLocation = $('#hdn-location').val();

    if (savedFormData && savedFormData.paramData) {
        if ((savedFormData.paramData.location == defaultLocation)) {
            travelFieldDef(formProps.fields, field => {
                field.fieldValue = savedFormData.paramData[field.id]
            });
        } else {
            savedFormData = {
                paramData: {
                    location: defaultLocation
                }
            };
        }
        
    }

    class Page extends Component {
        render() {
            return (
                <React.Fragment>
                    <FbdForm {...formProps}></FbdForm>
                    <FbdTable {...tableProps} ref={fbdTableRef}></FbdTable>
                    <FbdPagination {...paginationProps} ref={fbdPaginationRef}></FbdPagination>
                </React.Fragment>
            );
        }
    }

    initStore();

    global.actions.updateDataSource({
        ...(savedFormData || {}),
        pageNum: paginationProps.current,
        pageSize: paginationProps.defaultPageSize
    });

    global.store.subscribe(() => {
        let { dataSource, pagination } = global.store.getState();
        if (!fbdTableRef.current) {
            return;
        }
        fbdTableRef.current.updateState(dataSource);
        fbdPaginationRef.current.updateState(pagination);
    });

    ReactDOM.render(<Page />, document.getElementById('root'));
}