// 可以定义操作的list
// 列表组件也是同样的方式，其能力点是actions
import React, { ReactElement } from 'react';
import Table, { TableProps, ColumnProps } from 'antd/lib/table';
import { ActionButtonType } from './actions/action-render';
import { TableField } from './table-field';
import getActionDatas from './actions/action-render';
import './index.scss';

export interface TableDataItem {
    resourceId: string;
    resourceCode: string;
    resourceName: string;
    location: string;
    status: number;
    updateUserName: string;
    updateDate: string;
}

export interface FbdTableField {
    title?: string;
    key?: string;
    type?: TableField;
}

export interface FbdTableProps extends TableProps<TableDataItem> {
    fields: (string | FbdTableField)[];
    actions?: ActionButtonType[];
    onDataSourceTransform?: (dataSource: any) => any;
}

interface FbdTableState {
    dataSource: any[]
}

export default class FbdTable extends React.Component<FbdTableProps, FbdTableState> {
    fieldsMeta: ColumnProps<TableDataItem>[] = [];

    constructor(props: FbdTableProps) {
        super(props);
        // 需要把自定义参数转换成antd的参数
        for (let field of props.fields) {
            let isFieldString = typeof field == 'string';
            let column: ColumnProps<TableDataItem> = null;
            if (isFieldString) {
                let tempField = field as string;
                column = {
                    title: tempField,
                    key: tempField,
                    dataIndex: tempField
                };
            } else {
                let tempField = field as FbdTableField;
                column = {
                    title: tempField.title,
                    key: tempField.key,
                    dataIndex: tempField.key
                };
                if (tempField.type) {
                    column.render = tempField.type.render;
                }
            }
            this.fieldsMeta.push(column);
        }
        if (props.actions) {
            // 添加“操作”列
            this.fieldsMeta.push({
                title: '操作',
                render: (text, rowData) => getActionDatas(props.actions, rowData)
            });
        }

        this.state = {
            dataSource: []
        };
    }

    updateState(arr: any[]) {
        this.setState({
            dataSource: arr || []
        });
    }

    render(): ReactElement {
        let {dataSource} = this.state;
        if (this.props.onDataSourceTransform && this.state.dataSource.length) {
            dataSource = this.props.onDataSourceTransform(this.state.dataSource);
        }
        return (
            <Table className="fbd-table" {...{
                ...this.props,
                columns: this.fieldsMeta,
                pagination: false,
                dataSource
            }} />
        );
    }
}