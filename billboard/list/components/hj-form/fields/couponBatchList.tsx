import React, { Component, ReactElement, ChangeEvent } from 'react';
import { HjFieldWidget } from './interface';
import { HjFieldProps } from './hj-field';
import { Button, Table, Modal, Form } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { ColumnProps } from 'antd/lib/table';
import { FieldCollector, fieldCollectorContext } from '../field-collector-context';
import Ajax from '../../../hj-ajax';
import CommonUI from '../../../common-ui';
import '../../../array-polyfill';
import { topic, VisibilityChangeData } from '../../hj-table/observable';
import { FieldType } from '../../../interfaces';
export interface HjCouponBatchListSelectProps extends HjFieldProps {

}

interface HjCouponBatchListSelectState {
    batches: CouponBatchData[];
    modalVisible: boolean;
    couponBatchIdsInput: string;
    visible: boolean;
}

interface CouponBatchData {
    couponBatchId: number;
    name: string;
    deliveryTime: string;
    expirationTime: string;
}

/**
 * 
 * TODO: 是否可以在这里使用HjTable，这样会形成业务组件包含业务组件;不确定这么做对复杂度有多大影响
 * 目前是所有业务组件都是基于antd组件库实现，不会互相包含
 *
 * TODO: 不支持触发值更新
 * 
 */
export default class HjCouponBatchListSelectField extends Component<HjCouponBatchListSelectProps, HjCouponBatchListSelectState> implements HjFieldWidget {

    constructor(props: HjCouponBatchListSelectProps) {
        super(props);

        this.state = {
            batches: [],
            modalVisible: false,
            couponBatchIdsInput: '',
            visible: this.props.visible
        };
        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });

        this.onBeginAddCouponBatches = this.onBeginAddCouponBatches.bind(this);
        this.onAddCouponBatches = this.onAddCouponBatches.bind(this);
        this.onCancelAddCouponBatches = this.onCancelAddCouponBatches.bind(this);
        this.onCouponBatchIdsInputChange = this.onCouponBatchIdsInputChange.bind(this);
    }
    type(): FieldType {
        return this.props.fieldType;
    }
    getValue() {
        return {
            [this.props.name]: this.state.batches.map(item => item.couponBatchId)
        };
    }

    /**
     * 
     * 弹框输入classid列表
     * 
     */
    onBeginAddCouponBatches() {
        this.setState({
            modalVisible: true
        });
    }

    /**
     * 
     * 拆分classId，并调用接口验证classId并获取班级基本信息
     * 
     * 
     */
    onAddCouponBatches() {
        let { couponBatchIdsInput, batches } = this.state;
        let batchIds = couponBatchIdsInput.split(/,|，/ig).map(batchId => $.trim(batchId));
        console.log(batchIds);
        // 根据classId获取班级信息
        this.setState({
            modalVisible: false
        });
        Ajax.post('/activity/introcoupon/validCouponBatch', batchIds).then(res => {
            let { list, resMessage } = res.data;
            this.setState({
                batches: this.state.batches.concat(list.map((elem: any): CouponBatchData => {
                    let timeDurationStr: string = elem.sendTimeDes;
                    let splittings = timeDurationStr.split('-');
                    return {
                        couponBatchId: elem.id,
                        name: elem.name,
                        deliveryTime: splittings[0],
                        expirationTime: splittings[1]
                    };
                })).unique((item: CouponBatchData) => item.couponBatchId)
            });
            CommonUI.message.info(resMessage);
            if (list.length == batchIds.length) {
                this.setState({
                    couponBatchIdsInput: ''
                });
            }
        }).catch(([msg]) => {
            CommonUI.message.error(msg || '服务器出错啦～');
        });
    }

    onCancelAddCouponBatches() {
        this.setState({
            modalVisible: false,
            couponBatchIdsInput: ''
        });
    }

    onCouponBatchIdsInputChange(e: ChangeEvent<HTMLTextAreaElement>) {
        this.setState({
            couponBatchIdsInput: e.target.value
        });
    }

    componentDidMount() {
        // 如果this.props.value有值，则加载班级列表
        if (this.props.fieldValue) {
            Ajax.post('/activity/introcoupon/validCouponBatch', this.props.fieldValue).then(res => {
                let { list, resMessage } = res.data;
                this.setState({
                    batches: this.state.batches.concat(list.map((elem: any): CouponBatchData => {
                        let timeDurationStr: string = elem.sendTimeDes;
                        let splittings = timeDurationStr.split('-');
                        return {
                            couponBatchId: elem.id,
                            name: elem.name,
                            deliveryTime: splittings[0],
                            expirationTime: splittings[1]
                        };
                    })).unique((item: CouponBatchData) => item.couponBatchId)
                });
                CommonUI.message.info(resMessage);
                if (list.length == this.props.fieldValue.length) {
                    this.setState({
                        couponBatchIdsInput: ''
                    });
                }
            }).catch(([msg]) => {
                CommonUI.message.error(msg || '服务器出错啦～');
            });
        }
    }

    render(): ReactElement {
        const tableColumns: ColumnProps<CouponBatchData>[] = [{
            title: '批次',
            dataIndex: 'couponBatchId'
        }, {
            title: '名称',
            dataIndex: 'name'
        }, {
            title: '发放时间',
            dataIndex: 'deliveryTime'
        }, {
            title: '过期时间',
            dataIndex: 'expirationTime'
        }, {
            title: '操作',
            render: (txt: string, record: CouponBatchData) => {
                const onDelete = () => {
                    console.log(`删除: ${record.couponBatchId}`);
                    let { batches } = this.state;
                    this.setState({
                        batches: batches.filter(elem => elem.couponBatchId != record.couponBatchId)
                    });
                };
                return (!this.props.disable ? <Button type="link" onClick = { onDelete } > 删除 </Button> : null);
            }
        }];
        return (
            <fieldCollectorContext.Consumer>
                {
                    (ctx: FieldCollector) => {
                        ctx.fieldWidgets.push(this);
                        return (
                            this.state.visible ? <Form.Item label={this.props.title} className="hj-coupon-batch-list-select">
                                <div className="hj-coupon-batch-list-select-inner">
                                    <div>
                                        <Button type="primary" disabled={this.props.disable} onClick={this.onBeginAddCouponBatches}>添加批次</Button>
                                        <span className="add-batch-tip">请最多添加2个免费优惠券批次</span>
                                    </div>
                                    <Table<CouponBatchData> pagination={false} columns={tableColumns} dataSource={this.state.batches}></Table>
                                    <Modal
                                        title="添加批次"
                                        okText="确定"
                                        cancelText="取消"
                                        visible={this.state.modalVisible}
                                        onCancel={this.onCancelAddCouponBatches}
                                        onOk={this.onAddCouponBatches}>
                                        <TextArea rows={4} value={this.state.couponBatchIdsInput} onChange={this.onCouponBatchIdsInputChange} placeholder="批次ID以逗号隔开"></TextArea>
                                    </Modal>
                                </div>
                            </Form.Item> : null
                        );
                    }
                }
            </fieldCollectorContext.Consumer>
            
        );
    }
}