import { HjFormProps } from './components/hj-form';
import { FieldType } from "./interfaces";
import { ActionButtonFlags, ActionButtonType as FormActionButtonType } from "./components/hj-form/actions/actions-render";
import { HjTableProps } from "./components/hj-table";
import { ActionButtonType } from './components/hj-table/actions/action-render';
import { TableField } from "./components/hj-table/table-field";
import { HjPaginationProps } from "./components/hj-pagination";
import listCreator from './creators/list-creator';
import { locationDataSource } from './consts';

let formProps: HjFormProps = {
    layout: 'inline',
    fields: [{
        type: FieldType.text,
        title: '位置名称',
        id: 'resourceName'
    }, {
        type: FieldType.dropdown,
        title: '页面名称',
        id: 'location',
        valueSet: [{ key: '', value: '全部' }, ...locationDataSource],
        placeholder: '选择页面'
    }, {
        type: FieldType.dropdown,
        title: '状态',
        id: 'status',
        valueSet: [{
            key: '',
            value: '全部'
        }, {
            key: 0,
            value: '禁用'
        }, {
            key: 1,
            value: '启用'
        }]
    }],
    actions: [FormActionButtonType.search(), FormActionButtonType.create()]
};
let tableProps: HjTableProps = {
    fields: [{
        title: '位置编号',
        key: 'resourceCode'
    }, {
        title: '位置名称',
        key: 'resourceName'
    }, {
        title: '页面名称',
        key: 'location',
        type: TableField.selection(locationDataSource)
    }, {
        title: '状态',
        key: 'status',
        type: TableField.bool(['启用', '禁用'])
    }, {
        title: '最后修改人',
        key: 'updateUserName'
    }, {
        title: '最后修改时间',
        key: 'updateDate',
        type: TableField.date('YYYY-MM-DD hh:mm')
    }],
    actions: [ActionButtonType.edit({recorderIdGetter: rowData => rowData.resourceId}), 
        ActionButtonType.toggle({ defaultValGetter: record => !!record.status })],
    dataSource: []
};
let paginationProps: HjPaginationProps = {
    defaultPageSize: 20,
    total: 0,
    current: 1
};

listCreator(formProps, tableProps, paginationProps);