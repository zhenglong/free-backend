import Ajax from "./hj-ajax";
import global from './components/store/global';
import { FormFieldDef } from "./interfaces";
import { getFieldType, getDictionaryEntryArray, getValidationRule } from "./business";
import {strFormat} from './util';

export function fields(param: any): Promise<FormFieldDef[]> {
    return Ajax.get(global.config.queryFieldsAPI, param).then(({ data }) => {
        const fieldMap = (elem): FormFieldDef => {
            let obj = {
                ...elem,
                id: elem.name,
                type: getFieldType(elem.type),
                valueSet: elem.predetermineValues ? getDictionaryEntryArray(elem.predetermineValues) : null,
                isDynamic: elem.dynamic,
                tooltip: elem.tip,
                computedExpression: elem.computedValue
            };
            if (elem.rules) {
                obj.rules = getValidationRule(elem.rules);
            }
            if (elem.children && elem.children.length) {
                obj.fields = elem.children.map(fieldMap);
            }
            return obj;
        }
        return (data || []).map(fieldMap);
    });
}

/**
 * 
 * 查询单条记录
 * @param itemKey - 列表中单条记录的key 
 * 
 */
export function querySingle(itemKey: any): Promise<any> {
    return Ajax.get(strFormat(global.config.querySingleAPI, itemKey)).then(res => {
        return res.data;
    });
}