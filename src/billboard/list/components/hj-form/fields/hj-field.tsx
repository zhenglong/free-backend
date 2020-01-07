import { Observable } from "../../hj-table/observable";
import HjForm from "../index";
import { FieldType } from "../../../interfaces";

export interface HjFieldProps {
    fieldType: FieldType;
    /**
     * 
     * 显示的标题
     * 
     */
    title?: string;

    /**
     * 
     * 对应字段的key
     * 
     */
    name?: string;

    /**
     * 
     * 字段对应的注释文案
     * 
     */
    annotation?: string;

    /**
     * 
     * 外部与组件交互的中间可订阅对象
     * 
     */
    observer: Observable;

    /**
     * 
     * 组件是否可见，如果没有指定activateExpression，则为true；否则，为false。
     * 
     */
    visible?: boolean;

    /**
     * 
     * 禁用组件
     * 
     */
    disable?: boolean;

    fieldValue?: any;

    hjForm?: HjForm<any, any>;

    /**
     * 
     * 是否是动态字段，refreshSubFieldsDropdownField如果更新的话，isDynamic为true的字段会被刷掉
     * 
     */
    isDynamic: boolean;

    tooltip?: string;

    /**
     * 
     * 仅对于隐藏字段，可以支持其值是动态表达式；其它场景暂不支持
     * 
     */
    computedExpression?: string;

    /**
     * 
     * 字段索引
     * 
     */
    index: number;
}

export interface HjFieldState {
    /**
     * 
     * 组件的值
     * 
     */
    value: any;
}