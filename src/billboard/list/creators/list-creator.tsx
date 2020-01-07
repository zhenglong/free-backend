import React, { Component } from "react";
import ReactDOM from 'react-dom';
import HjForm from '../components/hj-form';
import HjTable from "../components/hj-table";
import HjPagination from "../components/hj-pagination";
import initStore from '../components/store';
import global from '../components/store/global';
import {travelFieldDef} from '../util';
import cacheKey from '../cache-key';

export default function listCreator(formProps: any, tableProps: any, paginationProps: any) {
    let hjTableRef = React.createRef<HjTable>();
    let hjPaginationRef = React.createRef<HjPagination>();

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
                    <HjForm {...formProps}></HjForm>
                    <HjTable {...tableProps} ref={hjTableRef}></HjTable>
                    <HjPagination {...paginationProps} ref={hjPaginationRef}></HjPagination>
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
        if (!hjTableRef.current) {
            return;
        }
        hjTableRef.current.updateState(dataSource);
        hjPaginationRef.current.updateState(pagination);
    });

    ReactDOM.render(<Page />, document.getElementById('root'));
}