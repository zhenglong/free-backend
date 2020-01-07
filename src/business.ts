import { FieldType, DictionaryEntry, ValidationRule, ValidationType, FieldValueRuleDef } from "./interfaces";

const BackEndFieldType = {
    'hidden': FieldType.hidden,
    'number': FieldType.number,
    'switch': FieldType.switch,
    'text': FieldType.text,
    'datetime': FieldType.datetime,
    'drop_down_box': FieldType.dropdown,
    'check_box_list': FieldType.checkbox,
    'rich_text': FieldType.richTextField,
    'img_file_upload': FieldType.imgUpload,
    'img_size_size': FieldType.imgSizeConstraint,
    'datetime_range': FieldType.dateRange,
    'group': FieldType.group,
    'reload_drop_down_box': FieldType.refreshSubFields,
    'max_length_text': FieldType.maxLengthInput,
    'add_batch': FieldType.couponBatchList,
    'add_classes': FieldType.classList
};

const BackEndRuleCode = {
    'require': 'require',
    'max_length': 'max_length',
    'max_array_size': 'max_array_size',
    'max_batch_size': 'max_batch_size',
    'max_img_width': 'max_img_width',
    'max_img_height': 'max_img_height'
};

export const getFieldType = (val: string) => BackEndFieldType[val];

export function getDictionaryEntryArray(obj: any): DictionaryEntry[] {
    let res: DictionaryEntry[] = [];
    obj.forEach(item => {
        let keys = Object.getOwnPropertyNames(item);
        for (let k of keys) {
            res.push({
                key: k,
                value: item[k]
            });
        }
    });
    return res;
}

export function getValidationRule(rules: FieldValueRuleDef[]): ValidationRule[] {
    return rules.map(rule => {
        let validationType: ValidationType = ValidationType.none;
        let obj: ValidationRule = null;
        switch(rule.ruleCode) {
            case BackEndRuleCode.require:
                obj = ValidationRule.required();
                break;
            case BackEndRuleCode.max_length:
            case BackEndRuleCode.max_batch_size:
            case BackEndRuleCode.max_array_size:
                obj = ValidationRule.maxLength(parseInt(rule.value, 10));
                break;
            case BackEndRuleCode.max_img_width:
            case BackEndRuleCode.max_img_height:
                // 图片验证规则
                break;
            default:
                console.warn(`无法识别的验证规则：${JSON.stringify(rule)}`);
        }
        return obj;
    });
}