import { is } from "immutable";
import AsyncDependencyValue from "./components/store/async-dependency-value";

export interface Dictionary<T> {
    [Key: string]: T;
}


export interface FormData {
    // empty body
}

export interface StateData {
}

export interface DictionaryEntry {
    key?: string|number,
    value: string
}

export enum FieldType {
    couponBatchList,
    checkbox,
    classList,
    datetime,
    dateRange,
    dropdown,
    group,
    hidden,
    imgSizeConstraint,
    imgUpload,
    maxLengthInput,
    number,
    /**
     * 
     * 只有在表单“新建”模式下才可修改值
     * 
     */
    refreshSubFields,
    richTextField,
    selectPictures,
    switch,
    text,
    url
}

/**
 * 
 * 验证规则类型的枚举值目前是代表其验证优先级
 * TODO: 是否需要显示定义验证类型的优先级？
 * 
 */
export enum ValidationType {
    none,
    required,
    maxLength,
    mobile,
    tel,
    email,
    entext,
    cntext,
    customize
}

export class ValidationRule {

    type: ValidationType;
    maxLen?: number;
    regexp?: RegExp;

    constructor(type: ValidationType) {
        this.type = type;
    }

    validate(val: any) {
        const isNotEmpty = (str: string) => !!$.trim(str);
        switch(this.type) {
            case ValidationType.required:
                return isNotEmpty(val);
            case ValidationType.maxLength:
                return val.length <= this.maxLen;
            case ValidationType.mobile:
            case ValidationType.tel:
            case ValidationType.email:
            case ValidationType.cntext:
            case ValidationType.entext:
            case ValidationType.customize:
                return (!isNotEmpty(val) && this.regexp.test(val));
            default:
                throw `验证值${val}时，无法识别的规则: ${this.type}`;
        }
    }

    /**
     * 
     * 必填
     * 
     */
    static required(): ValidationRule {
        let obj = new ValidationRule(ValidationType.required);
        return obj;
    }

    /**
     * 最大长度限制，包括字符串和数组
     * @param len - 允许的最大长度
     * 
     */
    static maxLength(len: number): ValidationRule {
        let obj = new ValidationRule(ValidationType.required);
        obj.maxLen = len;
        return obj;
    }

    /**
     * 
     * 手机号
     * 
     */
    static mobile(): ValidationRule {
        let obj = new ValidationRule(ValidationType.required);
        obj.regexp = /^1\d{10}$/;
        return obj;
    }

    /**
     * 
     * 电话号码
     * 
     */
    static tel(): ValidationRule {
        let obj = new ValidationRule(ValidationType.required);
        obj.regexp = /(\d{3}[\s\-]?\d{8})|(\d{4}[\s\-]?\d{7})/;
        return obj;
    }

    /**
     * 
     * 电子邮箱
     * 
     */
    static email(): ValidationRule {
        let obj = new ValidationRule(ValidationType.required);
        obj.regexp = /^([a-z0-9][a-z0-9_\-\.]*)@([a-z0-9][a-z0-9\.\-]{0,20})\.([a-z]{2,4})$/i;
        return obj;
    }

    /**
     * 
     * 中文
     * 
     */
    static cntext(): ValidationRule {
        let obj = new ValidationRule(ValidationType.cntext);
        obj.regexp = /^[\u4e00-\u9fa5]{2,5}$/;
        return obj;
    }

    /**
     * 
     * 英文
     * 
     */
    static entext(): ValidationRule {
        let obj = new ValidationRule(ValidationType.entext);
        obj.regexp = /^[a-z]{2,20}(\s[a-z]{1,20})*$/i;
        return obj;
    }

    /**
     * 
     * 
     */
    static customize(regexp: RegExp): ValidationRule {
        let obj = new ValidationRule(ValidationType.required);
        obj.regexp = regexp;
        return obj;
    }
}

export interface FieldValueRuleDef {
    ruleCode: string;
    value?: string;
}

export interface FormFieldDef {
    type: FieldType;
    title?: string;
    valueSet?: ((string | DictionaryEntry)[] | AsyncDependencyValue<DictionaryEntry[]>);
    ignoreTitle?: boolean;
    id?: string;
    legend?: string;
    fields?: FormFieldDef[];
    placeholder?: string;
    /**
     * 
     * 控制组件是否可见
     * 
     */
    activateExpression?: string;
    /**
     * 
     * 字段的业务规则
     * 
     */
    rules?: FieldValueRuleDef[];
    /**
     * 
     * 注解
     * 
     */
    tooltip?: string;
    /**
     * 
     * 如果有FieldType.refreshSubFields字段，则触发非保留字段更新。
     * 
     */
    isReserved?: boolean;
    /**
     * 
     * 禁用组件
     * 
     */
    disable?: boolean;
    /**
     * 
     * 字段值
     * 
     */
    fieldValue?: any;
    
    isDynamic?: boolean;

    /**
     * 
     * 字段值的计算表达式
     * 
     */
    computedExpression?: string;

    /**
     * 
     * 字段索引
     * 
     */
    index?: number;
}

export type RecordIdGetter = (record: any) => any;

export interface RefreshSubFielDataView {
    fieldValueList: any[],
    fieldIndexList: number[]
}