import React, {Component} from 'react';
import { FbdFieldProps } from './fbd-field';
import { FbdFieldWidget } from './interface';
import { FieldType } from '../../../interfaces';
import ComputedValue from '../../store/computed-value';
import { FieldCollector, fieldCollectorContext } from '../field-collector-context';
import { topic, VisibilityChangeData } from '../../fbd-table/observable';

export interface FbdHiddenProps extends FbdFieldProps {

}

export interface FbdHiddenState {
    visible: boolean;
}

/**
 * 
 * 隐藏域对于
 * 
 */
export default class FbdHidden extends Component<FbdHiddenProps, FbdHiddenState> implements FbdFieldWidget {

    value: any;

    constructor(props: FbdHiddenProps) {
        super(props);

        this.state = {
            visible: this.props.visible
        };
        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });

        this.value = this.props.fieldValue;
        if (this.props.computedExpression) {
            // 为计算表达式
            this.value = new ComputedValue(this.props.computedExpression);
        }
    }

    getValue(): any {
        return {
            [this.props.name]: this.value
        };
    }
    type(): FieldType {
        return this.props.fieldType;
    }
    render() {
        return (
            <fieldCollectorContext.Consumer>
                {
                    (ctx: FieldCollector) => {
                        ctx.fieldWidgets.push(this);
                        return (
                            this.state.visible ? <input type="hidden" name={this.props.name} /> : null
                        );
                    }
                }
            </fieldCollectorContext.Consumer>
        );
    }
}