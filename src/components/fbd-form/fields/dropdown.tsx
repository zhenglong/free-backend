import {Select, Form} from 'antd';
import React, { Component, RefObject } from 'react';
import { SelectProps } from 'antd/lib/select';
import { FbdFieldProps } from './fbd-field';
import { DictionaryEntry, FieldType } from '../../../interfaces';
import { FbdFieldWidget } from './interface';
import { fieldCollectorContext, FieldCollector } from '../field-collector-context';
import global from '../../store/global';
import { topic, VisibilityChangeData } from '../../fbd-table/observable';
import AsyncDependencyValue from '../../store/async-dependency-value';

export interface FbdSelectProps extends SelectProps, FbdFieldProps {
    valueSet: (DictionaryEntry[] | AsyncDependencyValue<DictionaryEntry[]>)
}

interface FbdSelectState {
    visible: boolean;
    valueSet: DictionaryEntry[];
    value: any;
}

/**
 * 
 * 下拉框
 * 
 */
export default class FbdDropdown extends Component<FbdSelectProps, FbdSelectState> implements FbdFieldWidget {
    innerWidget: RefObject<Select>;
    
    constructor(props: FbdSelectProps) {
        super(props);

        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });

        this.innerWidget = React.createRef<Select>();

        this.onChange = this.onChange.bind(this);

        let isValueSet = false;
        if (this.props.valueSet instanceof AsyncDependencyValue) {
            // 如果valueset有值之后再重新渲染
            this.props.valueSet.value.then(val => {
                let newVal = null;
                if (!isValueSet) {
                    newVal = this.props.fieldValue || (val && val.length && val[0].key);
                    isValueSet = true;
                }
                this.setState({
                    valueSet: val || [],
                    value: newVal
                }, this.state.value != newVal ? () => {
                        global.actions.updateQueryCondition(this.getValue());
                } : null);
            });
            this.state = {
                visible: this.props.visible,
                valueSet: [],
                value: null
            };
        } else {
            // 默认选中第一个
            this.state = {
                value: this.props.fieldValue || this.props.valueSet[0].key,
                visible: this.props.visible,
                valueSet: this.props.valueSet
            };
            // global.actions.updateQueryCondition(this.getValue());
        }
    }
    type(): FieldType {
        return this.props.fieldType;
    }
    getValue() {
        return {
            [this.props.name]: this.state.value
        };
    }
    onChange(txt, opt) {
        this.setState({
            value: opt.key
        }, () => {
            global.actions.updateQueryCondition(this.getValue());
        });
    }
    render() {
        return (
            <fieldCollectorContext.Consumer>
                {
                    (ctx: FieldCollector) => {
                        ctx.fieldWidgets.push(this);
                        let {valueSet, value} = this.state;
                        let defaultValue = value ? valueSet.find(item => item.key == value).value : null;
                        return (
                            this.state.visible ? <Form.Item label={this.props.title} className="fbd-dropdown-field">
                                <Select disabled={this.props.disable} defaultValue={defaultValue} value={defaultValue} style={{ width: 200 }} ref={this.innerWidget} onChange={this.onChange}>
                                    {
                                        valueSet.map(item => {
                                            let { key, value } = item;
                                            if (key === undefined) {
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
                            </Form.Item> : null
                        );
                    }
                }
            </fieldCollectorContext.Consumer>
        );
    }
}