// 是一个工厂组件（也是一种高阶组件）
// 可以配置出不同的能力的HJForm，当然不同能力需要自定义实现；工厂只提供最基本的能力，
// 例如，有限的字段类型。其扩展点是字段类型和列显示规则，以及字段变化后对store的影响
// 不同能力的HJForm再生成组件实例

import React, {Component} from 'react';
import { Form } from 'antd';
import idGenerator from '../../id-genrator';
import fieldRenders from './fields/field-render';
import actionRender, { ActionButtonType} from './actions/actions-render';
import { StateData, FieldType, FormFieldDef, RefreshSubFielDataView } from '../../interfaces';
import { FormProps } from 'antd/lib/form';
import './index.scss';
import { HjFieldWidget } from './fields/interface';
import { fieldCollectorContext, FieldCollector } from './field-collector-context';
import ComputedValue from '../store/computed-value';
import global from '../store/global';

export interface HjFormProps extends FormProps {
    fields: (string | FormFieldDef)[]
    actions?: ActionButtonType[]
}

interface FormStateData extends StateData {
    fieldsMeta: FormFieldDef[]
}

// 内部管理form字段，外部能够获得表单数据
// 表单定义从外部传入
// 表单负责解析字段并渲染
// 内部状态从字段定义生成
// 字段的横排（horizontal）/竖排（vertical）
// 支持（查询/导出）按钮，并且可扩展
export default class HjForm<S extends HjFormProps, T extends FormStateData> extends Component<S, T> {

    // 当前表单包含的所有的fieldWidget，通过context api让子组件把自身添加进来
    ctx: FieldCollector;

    constructor(props: S) {
        super(props);

        this.state = this.newState(props.fields);
        this.ctx = {
            fieldWidgets: []
        };
    }

    /**
     * 
     * 获取表单数据
     * @param isCheckDynamic - 如果值为true时，只导出dynamic字段的值
     * 
     */
    getDataView(isCheckDynamic: boolean = false): any {
        // 遍历fieldWidgets，把所有字段的值归并
        let obj = Object.create(null);
        this.ctx.fieldWidgets.forEach((elem: HjFieldWidget) => {
            if (isCheckDynamic && elem.props.isDynamic) {
                return;
            }
            if (elem.getValue) {
                Object.assign(obj, elem.getValue());
            }
        });
        
        // 对于ComputedValue，计算最终值
        let keys = Object.getOwnPropertyNames(obj);
        for (let k of keys) {
            if (obj[k] instanceof ComputedValue) {
                let computedValue = (obj[k] as ComputedValue);
                computedValue.refreshValue(obj);
                obj[k] = computedValue.value;
            }
        }
        return obj;
    }

    /**
     * 
     * 当refreshSubFieldsDropdown字段变化时，获取查询参数
     * 
     */
    get RefeshFieldsDataView(): RefreshSubFielDataView {
        // 检查哪个字段变更，然后只传递该字段之前的字段以及其本身。
        let obj = [];
        let fieldIndexList = [];
        this.ctx.fieldWidgets.forEach((elem: HjFieldWidget) => {
            if (elem.type() != FieldType.refreshSubFields) {
                return;
            }
            if (elem.getValue) {
                obj.push(elem.getValue());
                fieldIndexList.push(elem.props.index);
            }
        });

        return { fieldValueList: obj, fieldIndexList};
    }

    /**
     * 归一化字段定义
     * 
     * @param fields - 字段定义
     * 
     */
    newState(fields: (string | FormFieldDef)[]): T {
        let obj: T = Object.create(null);
        const handleFields = (propFields: (string | FormFieldDef)[]) => {
            let fields: FormFieldDef[] = [];
            let index = 0;
            for (let field of propFields) {
                let finalField: FormFieldDef = (typeof field == 'string') ? {
                    title: field,
                    type: FieldType.text,
                    id: field,
                    index: 0
                } : (field as FormFieldDef);
                finalField.index = index++;
                if (!finalField.id) {
                    finalField.id = finalField.title || idGenerator.next();
                }
                fields.push(finalField);
                // 目前只支持2层fields定义
                if (finalField.fields) {
                    finalField.fields = handleFields(finalField.fields);
                }
            }
            return fields;
        }
        
        obj.fieldsMeta = handleFields(fields);
        return obj;
    }

    updateFields(fields: FormFieldDef[]) {
        // 从缓存中更新字段的值

        this.setState(this.newState(fields), () => {
            // 保证重新渲染field组件之后，field组件的visible属性正确
            global.actions.updateQueryCondition(this.getDataView());
        });
    }

    componentDidMount() {
        // 获取表单的值，更新store的初始值
        // 从而让组件的初始visible属性正确
        global.actions.updateQueryCondition(this.getDataView());
    }

    render() {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        return (
            <Form {...formItemLayout} {...this.props} className="hj-form">
                <fieldCollectorContext.Provider value={this.ctx}>
                    {
                        this.state.fieldsMeta.map(field => fieldRenders[field.type](field, this))
                    }
                    {
                        this.props.layout == 'inline' ? 
                            actionRender(this.props.actions, this) : 
                            <div className="action-buttons-wrapper">
                                {
                                    actionRender(this.props.actions, this)
                                }
                            </div>
                    }
                    
                </fieldCollectorContext.Provider>
            </Form>
        );
    }
}