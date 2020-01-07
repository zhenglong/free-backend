import React, {Component, ReactElement, ChangeEvent} from 'react';
import { HjFieldWidget } from './interface';
import { HjFieldProps } from './hj-field';
import { Button, Table, Modal, Form } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { ColumnProps } from 'antd/lib/table';
import Ajax from '../../../hj-ajax';
import CommonUI from '../../../common-ui';
import '../../../array-polyfill';
import { fieldCollectorContext, FieldCollector } from '../field-collector-context';
import { topic, VisibilityChangeData } from '../../hj-table/observable';
import { FieldType } from '../../../interfaces';

export interface HjClassListSelectProps extends HjFieldProps {

}

/**
 * 
 * TODO: 继承HjFieldState，value应该放到state中
 * 否则antd有些组件的值不会被清掉，后期会继续优化不必要的渲染循环
 * 
 */
interface HjClassListSelectState {
    classes: ClassData[];
    modalVisible: boolean;
    classIdsInput: string;
    visible: boolean;
}

interface ClassData {
    classId: number;
    className: string;
    saleStatus: number;
    promotionPrice: number;
}

/**
 * 
 * TODO: 是否可以在这里使用HjTable，这样会形成业务组件包含业务组件;不确定这么做对复杂度有多大影响
 * 目前是所有业务组件都是基于antd组件库实现，不会互相包含
 * 
 * TODO: 不支持触发值更新
 * 
 */
export default class HjClassListSelectField extends Component<HjClassListSelectProps, HjClassListSelectState> implements HjFieldWidget {

    constructor(props: HjClassListSelectProps) {
        super(props);

        this.state = {
            classes: [],
            modalVisible: false,
            classIdsInput: '',
            visible: this.props.visible
        };

        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });

        this.onBeginAddClasses = this.onBeginAddClasses.bind(this);
        this.onAddClasses = this.onAddClasses.bind(this);
        this.onCancelAddClasses = this.onCancelAddClasses.bind(this);
        this.onClassIdsInputChange = this.onClassIdsInputChange.bind(this);
    }

    type(): FieldType {
        return this.props.fieldType;
    }

    getValue() {
        return {
            [this.props.name]: this.state.classes.map(item => item.classId)
        };
    }

    /**
     * 
     * 弹框输入classid列表
     * 
     */
    onBeginAddClasses() {
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
    onAddClasses() {
        let {classIdsInput, classes} = this.state;
        let classIds = classIdsInput.split(/(\r\n)|\r|\n/ig).map(classId => $.trim(classId)).filter(item => !!item);
        console.log(classIds);
        this.setState({
            classIdsInput: '',
            modalVisible: false
        });
        // 根据classId获取班级信息
        Ajax.post('/activity/introtextlink/validClass', classIds).then(res => {
            let { invalidIds, resultList } = res.data;
            if (invalidIds && invalidIds.length) {
                CommonUI.message.warn(`成功${resultList.length}条，失败${invalidIds.length}条。没权限操作或不存在的班级ID：${invalidIds.join()}`);
            }
            this.setState({
                classes: this.state.classes.concat(resultList).unique((item: ClassData) => item.classId)
            });
        }).catch(([msg]) => {
            CommonUI.message.error(msg || '服务器出错啦～');
        });
    }

    onCancelAddClasses() {
        this.setState({
            modalVisible: false,
            classIdsInput: ''
        });
    }

    onClassIdsInputChange(e: ChangeEvent<HTMLTextAreaElement>) {
        this.setState({
            classIdsInput: e.target.value
        });
    }

    componentDidMount() {
        // 如果this.props.value有值，则加载班级列表
        if (this.props.fieldValue && this.props.fieldValue.length) {
            Ajax.post('/activity/introtextlink/validClass', this.props.fieldValue).then(res => {
                let { invalidIds, resultList } = res.data;
                if (invalidIds && invalidIds.length) {
                    CommonUI.message.warn(`成功${resultList.length}条，失败${invalidIds.length}条。没权限操作或不存在的班级ID：${invalidIds.join()}`);
                }
                this.setState({
                    classes: this.state.classes.concat(resultList).unique((item: ClassData) => item.classId)
                });
            }).catch(([msg]) => {
                CommonUI.message.error(msg || '服务器出错啦～');
            });
        }
    }

    render(): ReactElement {
        const tableColumns: ColumnProps < ClassData > [] =[{
            title: '班级ID',
            dataIndex: 'classId'
        }, {
            title: '班级名称',
            dataIndex: 'className'
        }, {
            title: '状态',
            dataIndex: 'saleStatus',
            render: (text) => {
                const mapping = {
                    1: '筹备中',
                    2: '销售中',
                    3: '已下架'
                }
                return mapping[text];
            }
        }, {
            title: '原价',
            dataIndex: 'price'
        }, {
            title: '操作',
            render: (txt: string, record: ClassData) => {
                const onDelete = () => {
                    console.log(`删除: ${record.classId}`);
                    let { classes } = this.state;
                    this.setState({
                        classes: classes.filter(elem => elem.classId != record.classId)
                    });
                };
                return (!this.props.disable ? <Button type="link" onClick={onDelete}>删除</Button> : null)
            }
        }];
        return (
            <fieldCollectorContext.Consumer>
                {
                    (ctx: FieldCollector) => {
                        ctx.fieldWidgets.push(this);
                        return (
                            this.state.visible ? <Form.Item label={this.props.title} className="hj-class-list-select">
                                <div className="hj-class-list-select-inner">
                                    <Button type="primary" disabled={this.props.disable} onClick={this.onBeginAddClasses}>批量添加班级</Button>
                                    <Table<ClassData> pagination={false} columns={tableColumns} dataSource={this.state.classes}></Table>
                                    <Modal
                                        title="批量添加班级"
                                        okText="确定"
                                        cancelText="取消"
                                        visible={this.state.modalVisible}
                                        onCancel={this.onCancelAddClasses}
                                        onOk={this.onAddClasses}>
                                        <TextArea rows={4} value={this.state.classIdsInput} onChange={this.onClassIdsInputChange} placeholder="每行一个班级ID"></TextArea>
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