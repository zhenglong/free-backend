import React, {Component, ReactElement} from 'react';
import { Pagination } from 'antd';
import { PaginationProps } from 'antd/lib/pagination';
import global from '../store/global';
import './index.scss';
import { PaginationData } from '../store/data-interface';

export interface FbdPaginationProps extends PaginationProps {

}

export interface FbdPaginationState extends PaginationData {

}

export default class FbdPagination extends Component<FbdPaginationProps, FbdPaginationState> {
    constructor(props: FbdPaginationProps) {
        super(props);
        this.state = {
            current: this.props.defaultCurrent,
            size: this.props.defaultPageSize,
            total: this.props.total
        };

        this.onCurrentPageChange = this.onCurrentPageChange;
    }

    updateState(data: PaginationData) {
        this.setState(data);
    }

    onCurrentPageChange(page: number, pageSize: number) {
        // 从store中获取查询参数，然后调用触发查询列表的action
        global.actions.updatePagination({
            current: page,
            size: pageSize
        });
        global.actions.updateDataSource(global.actions.getQueryParam());
    }
    render(): ReactElement {
        let props: FbdPaginationProps = { ...this.props, onChange: this.onCurrentPageChange};
        props.current = props.defaultCurrent = this.state.current;
        props.defaultPageSize = this.state.size;
        props.total = this.state.total;
        return <Pagination className="fbd-pagination" {...props} />
    }
}