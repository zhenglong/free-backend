
import React, { Component, RefObject } from 'react';
import { Input, Form } from 'antd';
import { InputProps } from 'antd/lib/input';
import { FbdFieldProps } from './fbd-field';
import { FbdFieldWidget } from './interface';
import { fieldCollectorContext, FieldCollector } from '../field-collector-context';
import { topic, VisibilityChangeData } from '../../fbd-table/observable';
import { FbdInputProps, FbdInputState } from './textField';
import { FieldType } from '../../../interfaces';


export default class MaxLengthTextField extends Component<FbdInputProps, FbdInputState> implements FbdFieldWidget {
    innerInput: RefObject<Input>;
    value: any;

    constructor(props: FbdInputProps) {
        super(props);

        this.state = {
            visible: this.props.visible
        };
        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });

        this.innerInput = React.createRef<Input>();
        this.value = this.props.fieldValue;

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

    onChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.value = e.target.value;
    }

    render() {
        return (
            <fieldCollectorContext.Consumer>
                {
                    (ctx: FieldCollector) => {
                        ctx.fieldWidgets.push(this);
                        return (
                            this.state.visible ? <Form.Item label={this.props.title}>
                                <Input disabled={this.props.disable} ref={this.innerInput} defaultValue={this.props.fieldValue} placeholder={this.props.placeholder} onChange={this.onChange} />
                            </Form.Item> : false
                        );
                    }
                }
            </fieldCollectorContext.Consumer>


        )
    }
}