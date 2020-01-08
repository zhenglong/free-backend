import React, { Component, RefObject } from "react";
import { FbdFieldProps } from "./fbd-field";
import { DictionaryEntry, FormFieldDef, FieldType } from "../../../interfaces";
import { Select, Form } from "antd";
import { SelectProps } from "antd/lib/select";
import { fieldCollectorContext, FieldCollector } from "../field-collector-context";
import global from '../../store/global';
import * as remoteData from '../../../remote-data';
import { FbdFieldWidget } from "./interface";
import { travelFieldDef} from '../../../util';

export interface FbdRefreshPageDropdownProps extends SelectProps, FbdFieldProps {
    valueSet: DictionaryEntry[]
}

/**
 * 
 * 还是下拉框，但是当值变化时，会切换类型相关的字段集，只有新建模式下可以切换
 * 
 */
export default class FbdRefreshSubFieldsDropdownField extends Component<FbdRefreshPageDropdownProps> implements FbdFieldWidget {
    innerWidget: RefObject<Select>;
    value: any;
    constructor(props: FbdRefreshPageDropdownProps) {
        super(props);

        this.innerWidget = React.createRef<Select>();
        this.value = this.props.fieldValue || this.props.valueSet[0].key;

        this.onChange = this.onChange.bind(this);
    }
    type(): FieldType {
        return this.props.fieldType;
    }
    getValue() {
        return {
            [this.props.name]: this.value
        };
    }

    componentDidMount() {
        // 如果初始值不是第一个，则重新获取子fields信息
        // TODO: 在编辑模式下，会多请求一次拉取fields的接口
        // BUG: 查看模式下，disable状态丢失
        // TODO: global.store中需要保存组件的disable/visible状态
        // if (this.props.valueSet[0].key != this.value) {
        //     global.actions.updateQueryCondition(this.getValue());
        //     // 保存非dynamic字段的值
        //     let savedValue = global.actions.getQueryParam().paramData;
        //     remoteData.fields(this.props.fbdForm.RefeshFieldsDataView).then((fields: FormFieldDef[]) => {
        //         // 恢复非dynamic字段的值
        //         travelFieldDef(fields, field => {
        //             if (savedValue[field.id] !== undefined) {
        //                 field.fieldValue = savedValue[field.id];
        //             }
        //         });
        //         this.props.fbdForm.updateFields(fields);
        //     });
        // }
    }

    onChange(val, opt) {
        this.value = opt.key;

        // 获取字段索引
        global.actions.updateQueryCondition(this.getValue());
        // 保存非dynamic字段的值
        let savedValue = this.props.fbdForm.getDataView(true);
        // 知道哪个字段的值变化了，然后把RefreshFieldsDataView中index大于它的值去掉
        let changedIndex = this.props.index;
        let dataView = this.props.fbdForm.RefeshFieldsDataView;
        let { fieldValueList, fieldIndexList} = dataView;
        let filteredFieldValueObj = Object.create(null);
        for (let i = 0; i < fieldIndexList.length; i++) {
            if (fieldIndexList[i] <= changedIndex) {
                Object.assign(filteredFieldValueObj, fieldValueList[i]);
            }
        }
        remoteData.fields(filteredFieldValueObj).then((fields: FormFieldDef[]) => {
            // 恢复非dynamic字段的值
            travelFieldDef(fields, field => {
                if (savedValue[field.id] !== undefined) {
                    field.fieldValue = savedValue[field.id];
                }
            });
            this.props.fbdForm.updateFields(fields);
        });
    }
    render() {
        return (
            <fieldCollectorContext.Consumer>
                {
                    (ctx: FieldCollector) => {
                        ctx.fieldWidgets.push(this);
                        let defaultValue = '';
                        // 如果没找到对应value，则清除value值
                        if (this.value) {
                            let valueObj = this.props.valueSet.find(item => item.key == this.value);
                            if (valueObj) {
                                defaultValue = valueObj.value;
                            } else {
                                this.value = '';
                            }
                        }
                        return (
                            <Form.Item label={this.props.title} className="fbd-refresh-subfields-field">
                                <Select disabled={this.props.disable} defaultValue={defaultValue} value={defaultValue} style={{ width: 200 }} ref={this.innerWidget} onChange={this.onChange}>
                                    {
                                        this.props.valueSet.map(item => {
                                            let { key, value } = item;
                                            if (!key) {
                                                key = value;
                                            }
                                            return (
                                                <Select.Option key={key} value={value}>
                                                    {value}
                                                </Select.Option>
                                            );
                                        })
                                    }
                                </Select>
                            </Form.Item>
                        );
                    }
                }
            </fieldCollectorContext.Consumer>
        );
    }
}