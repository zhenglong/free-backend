import {Form} from 'antd';
import React,{ Component, RefObject } from 'react';
import { CheckboxProps } from 'antd/lib/checkbox';
import { HjFieldProps, HjFieldState } from './hj-field';
import { DictionaryEntry, FieldType } from '../../../interfaces';
import CheckboxGroup from 'antd/lib/checkbox/Group';
import { HjFieldWidget } from './interface';
import {fieldCollectorContext, FieldCollector} from '../field-collector-context';
import { topic, VisibilityChangeData } from '../../hj-table/observable';
import global from '../../store/global';

export interface HjCheckboxProps extends CheckboxProps, HjFieldProps {
    valueSet: DictionaryEntry[]
}

interface HjCheckboxState extends HjFieldState {
    visible: boolean;
}

/**
 * 
 * 用于1个或多个勾选
 * 
 */
export default class HjCheckbox extends Component<HjCheckboxProps, HjCheckboxState> implements HjFieldWidget {
    
    innerWidgetRef: RefObject<CheckboxGroup>;

    constructor(props: HjCheckboxProps) {
        super(props);

        this.state = {
            visible: this.props.visible,
            value: this.props.fieldValue
        };

        this.innerWidgetRef = React.createRef<CheckboxGroup>();
        this.onChange = this.onChange.bind(this);

        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });
    }

    type(): FieldType {
        return this.props.fieldType;
    }

    getValue() {
        return {
            [this.props.name]: this.state.value
        };
    }

    onChange(checkedValues) {
        this.setState({
            value: checkedValues.map(elem => this.props.valueSet.find(item => item.value == elem).key)
        }, () => {
            global.actions.updateQueryCondition(this.getValue());
        });
    }

    componentWillReceiveProps(nextProps: HjCheckboxProps) {
        // 如果保留值的话，貌似不会影响组件的visible，原因如下：
        // computedValue只有值变化的时候才会触发变更回调，所以如果值保持不变的话，新加组件的visible就不能变化啦
        this.setState({
            value: nextProps.fieldValue || []
        }, () => {
            // TODO: 规范updateQueryCondition的使用
            // 每次store变化都会对computedValue重新计算值，如果visible依赖于checkbox的值，
            // 如果执行顺序不当，容易出现visible不对的情况
            // 在第一次初始化时，尽量依赖hj-form.computedDidMount里调用updateQueryCondition
            // 在这个过程中，其它地方尽量不要调用该方法
            global.actions.updateQueryCondition(this.getValue());
        });
    }

    render() {
        return (
            <fieldCollectorContext.Consumer>
                {
                    (ctx: FieldCollector) => {
                        ctx.fieldWidgets.push(this);
                        let {value} = this.state;
                        let defaultValue = (value && value.length) ? value.map(elem => this.props.valueSet.find(elem1 => elem1.key == elem).value) : null;
                        
                        return (
                            this.state.visible ? <Form.Item label={this.props.title}>
                                <CheckboxGroup disabled={this.props.disable} defaultValue={defaultValue} value={defaultValue} ref={this.innerWidgetRef} options={this.props.valueSet.map(item => item.value)} onChange={this.onChange}>
                                </CheckboxGroup>
                            </Form.Item> : null
                        );
                    }
                }
            </fieldCollectorContext.Consumer>
        );
    }
}
