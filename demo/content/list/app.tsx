import { FbdFormProps } from 'free-backend/components/fbd-form';
import { FieldType, DictionaryEntry } from "free-backend/interfaces";
import { ActionButtonType as FormActionButtonType } from "free-backend/components/fbd-form/actions/actions-render";
import { FbdTableProps } from "free-backend/components/fbd-table";
import { ActionButtonType } from 'free-backend/components/fbd-table/actions/action-render';
import { TableField } from "free-backend/components/fbd-table/table-field";
import { FbdPaginationProps } from "free-backend/components/fbd-pagination";
import global from 'free-backend/components/store/global';
import listCreator from "free-backend/creators/list-creator";

import './app.scss';
import AsyncDependencyValue from 'free-backend/components/store/async-dependency-value';
import ComputedValue from 'free-backend/components/store/computed-value';
import { locationDataSource, statusDataSource, platformDataSource, locationMapping } from 'free-backend/consts';

global.config.searchAPI = '/activity/v2/resource/activity/query';
global.config.editAPI = '/billboardContent/';
global.config.createAPI = '/billboardContent/new';
global.config.viewAPI = '/billboardContent/{0}?readonly=1';
global.config.querySingleAPI = '/activity/v2/resource/activity/{0}';

const isUnavailableCb = (record: any) => [3].indexOf(parseFloat(record.status)) > -1;
const isAvailableCb = (record: any) => [0, 1, 2].indexOf(parseFloat(record.status)) > -1;

let locationExpr = '{location:${location}}';
let locationComputedValue = new ComputedValue(locationExpr);

global.expressionGroup[locationExpr] = locationComputedValue;

let defaultLocation = $('#hdn-location').val();

let formProps: FbdFormProps = {
    layout: 'inline',
    fields: [{
        type: FieldType.text,
        title: '运营活动名称',
        id: 'activityName'
    }, {
        type: FieldType.text,
        title: '活动ID',
        id: 'activityId'
    }, {
        type: FieldType.text,
        title: '班级ID',
        id: 'classId'
    }, {
        type: FieldType.dropdown,
        title: '状态',
        valueSet: statusDataSource,
        id: 'status'
    }, {
        type: FieldType.dropdown,
        title: '页面名称',
        id: 'location',
        // 如果页面名称固定，那么在过滤条件中不能切换页面名称
        fieldValue: defaultLocation,
        disable: !!defaultLocation,
        valueSet: [{ key: '', value: '全部' }, ...locationDataSource],
        placeholder: '选择页面'
    }, {
        type: FieldType.dropdown,
        title: '位置名称',
        id: 'resourceId',
        valueSet: new AsyncDependencyValue<DictionaryEntry[]>(
            locationComputedValue, 
            '/activity/v2/resource/effectives', 
            (data:any) => {
                return data && data.length ? [{ key: '', value: '全部' }, ...data.map((item: any) => {
                    return {
                        key: item.resourceId,
                        value: item.resourceName
                    };
                })] : [];
        })
    }, {
        type: FieldType.dateRange,
        title: '生效时间',
        fields: [{
            id: 'beginDate',
            type: FieldType.hidden,
        }, {
            id: 'endDate',
            type: FieldType.hidden,
        }]
    }],
    actions: [FormActionButtonType.search(), FormActionButtonType.create({ postfix: (defaultLocation ? locationMapping[defaultLocation + ''] : '') })]
};
let tableProps: FbdTableProps = {
    fields: [{
        title: '活动ID',
        key: 'activityId'
    }, {
        title: '运营活动名称',
            key: 'activityName'
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
            type: TableField.selection(statusDataSource)
    }, {
        title: '平台',
            key: 'platform',
            type: TableField.selection(platformDataSource, true)
        }, {
            title: '生效时间',
            key: 'effectiveTime',
            type: TableField.dateRange('YYYY-MM-DD hh:mm')
        }
    ],
    actions: [ActionButtonType.edit({
            visibleGetter: isAvailableCb, 
            recorderIdGetter: record => `${record.resourceId}/${record.activityId}`
        }),
        ActionButtonType.delete({
            recorderIdGetter: record => record.activityId,
            visibleGetter: isAvailableCb
        }),
        ActionButtonType.view({
            recorderIdGetter: record => `${record.resourceId}/${record.activityId}`,
            visibleGetter: isUnavailableCb
        }),
        ActionButtonType.copy({
            visibleGetter: isAvailableCb,
            recorderIdGetter: record => `${record.resourceId}/${record.activityId}`
        })],
    dataSource: [],
    onDataSourceTransform: arr => {
        if (!arr) {
            return [];
        }
        arr.forEach(item => {
            item.effectiveTime = [item.beginDate, item.endDate];
        });
        return arr;
    }
};
let paginationProps: FbdPaginationProps = {
    defaultPageSize: 20,
    total: 0,
    current: 1
};

listCreator(formProps, tableProps, paginationProps);