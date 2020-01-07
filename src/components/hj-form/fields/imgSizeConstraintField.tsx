import React, {Component, RefObject} from 'react';
import { HjFieldProps } from './hj-field';
import { InputNumber, Form } from 'antd';
import { HjFieldWidget } from './interface';
import { fieldCollectorContext, FieldCollector } from '../field-collector-context';
import { topic, VisibilityChangeData } from '../../hj-table/observable';
import { FieldType } from '../../../interfaces';

export interface HjImgSizeConstraintFieldProps extends HjFieldProps {
    /**
     * 
     * 0: 宽字段id；1: 高字段id
     * 
     */
    names: string[];
}

interface HjImgSizeConstraintFieldState {
    visible: boolean;
}

export default class ImgSizeConstraintField extends Component<HjImgSizeConstraintFieldProps, HjImgSizeConstraintFieldState> implements HjFieldWidget {
    innerWidthInput: RefObject<InputNumber>;
    innerHeightInput: RefObject<InputNumber>;
    widthVal: number;
    heightVal: number;

    constructor(props: HjImgSizeConstraintFieldProps) {
        super(props);

        this.state = {
            visible: this.props.visible
        };

        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });

        this.innerWidthInput = React.createRef<InputNumber>();
        this.innerHeightInput = React.createRef<InputNumber>();
        this.widthVal = 0;
        this.heightVal = 0;
        let {fieldValue} = this.props;
        if (fieldValue && fieldValue.length) {
            this.widthVal = fieldValue[0];
            this.heightVal = fieldValue[1];
        }
        
        this.onWidthChange = this.onWidthChange.bind(this);
        this.onHeightChange = this.onHeightChange.bind(this);
    }
    type(): FieldType {
        return this.props.fieldType;
    }
    getValue() {
        let {names} = this.props;
        return {
            [names[0]]: this.widthVal,
            [names[1]]: this.heightVal
        };
    }

    onWidthChange(val: number) {
        this.widthVal = val;
    }

    onHeightChange(val: number) {
        this.heightVal = val;
    }

    render() {
        return (
            <fieldCollectorContext.Consumer>
                {
                    (ctx: FieldCollector) => {
                        ctx.fieldWidgets.push(this);
                        return (
                            this.state.visible ? <div className="img-size-constraint-field">
                                <Form.Item label={this.props.title}>
                                    宽<InputNumber disabled={this.props.disable} ref={this.innerWidthInput} defaultValue={this.widthVal || null} onChange={this.onWidthChange}></InputNumber>*高<InputNumber disabled={this.props.disable} ref={this.innerHeightInput} defaultValue={this.heightVal || null} onChange={this.onHeightChange}></InputNumber>
                                </Form.Item>
                            </div> : null
                        );
                    }
                }
            </fieldCollectorContext.Consumer>
        );
    }
}