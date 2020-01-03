import { HjInputProps } from "../fields/textField";
import { HjFieldProps } from '../fields/hj-field';
import { HjSelectProps } from "../fields/dropdown";
import { FormFieldDef, DictionaryEntry } from "../../../interfaces";
import { HjRichTextFieldProps } from "../fields/richTextField";
import { HjImgSizeConstraintFieldProps } from "../fields/imgSizeConstraintField";
import { HjCheckboxProps } from "../fields/checkbox";
import { HjDateRangeProps } from "../fields/dateRangeField";
import { Observable, topic, VisibilityChangeData } from "../../hj-table/observable";
import global from '../../store/global';
import ComputedValue from "../../store/computed-value";
import AsyncDependencyValue from "../../store/async-dependency-value";

export interface PropsConvertor<T extends HjFieldProps> {
    fromFieldDef: (fieldDef: FormFieldDef) => T;
}

function detectVisibilityChange(fieldDef: FormFieldDef, observer: Observable) {
    if (fieldDef.activateExpression) {
        if (!global.expressionGroup[fieldDef.activateExpression]) {
            global.expressionGroup[fieldDef.activateExpression] = new ComputedValue(fieldDef.activateExpression);
        }
        global.expressionGroup[fieldDef.activateExpression].onChange((newVal, oldVal) => {
            let data: VisibilityChangeData = { newVal, oldVal };
            observer.publish(topic.visibilityChange, data);
        });
    }
}

export class TextPropsConvertor implements PropsConvertor<HjInputProps> {
    fromFieldDef(fieldDef: FormFieldDef): HjInputProps {
        // 如果有字段activateExpression，则添加表达式监听
        let observer = new Observable();
        detectVisibilityChange(fieldDef, observer);
        return {
            title: fieldDef.ignoreTitle ? '' : fieldDef.title,
            placeholder: fieldDef.placeholder,
            name: fieldDef.id,
            observer,
            visible: !fieldDef.activateExpression,
            disable: fieldDef.disable || (global.widgetTreeState[fieldDef.id] && global.widgetTreeState[fieldDef.id].disable),
            fieldValue: fieldDef.fieldValue,
            fieldType: fieldDef.type,
            isDynamic: fieldDef.isDynamic,
            tooltip: fieldDef.tooltip,
            index: fieldDef.index
        };
    }
}

export class CheckboxPropsConvertor implements PropsConvertor<HjCheckboxProps> {
    fromFieldDef(fieldDef: FormFieldDef): HjCheckboxProps {
        let valueSet: DictionaryEntry[] = [];
        if (fieldDef.valueSet && !(fieldDef.valueSet instanceof AsyncDependencyValue) && fieldDef.valueSet.length) {
            for (let elem of fieldDef.valueSet) {
                let finalVal: DictionaryEntry = null;
                if (typeof elem == 'string') {
                    finalVal = {
                        key: elem,
                        value: elem
                    };
                } else {
                    finalVal = elem as DictionaryEntry;
                }
                valueSet.push(finalVal);
            }
        } 
        let observer = new Observable();
        detectVisibilityChange(fieldDef, observer);
        return {
            title: fieldDef.title,
            name: fieldDef.id,
            valueSet,
            observer,
            visible: !fieldDef.activateExpression,
            disable: fieldDef.disable || (global.widgetTreeState[fieldDef.id] && global.widgetTreeState[fieldDef.id].disable),
            fieldValue: fieldDef.fieldValue,
            fieldType: fieldDef.type,
            isDynamic: fieldDef.isDynamic,
            tooltip: fieldDef.tooltip,
            index: fieldDef.index
        };
    }
}

export class DropdownPropsConvertor implements PropsConvertor<HjSelectProps> {
    fromFieldDef(fieldDef: FormFieldDef): HjSelectProps {
        let valueSet: DictionaryEntry[] = [];
        if (fieldDef.valueSet && !(fieldDef.valueSet instanceof AsyncDependencyValue) && fieldDef.valueSet.length) {
            for (let elem of fieldDef.valueSet) {
                let finalVal: DictionaryEntry = null;
                if (typeof elem == 'string') {
                    finalVal = {
                        key: elem,
                        value: elem
                    };
                } else {
                    finalVal = elem as DictionaryEntry;
                }
                valueSet.push(finalVal);
            }
        }
        let observer = new Observable();
        detectVisibilityChange(fieldDef, observer);
        return {
            title: fieldDef.title,
            name: fieldDef.id,
            valueSet: fieldDef.valueSet instanceof AsyncDependencyValue ? fieldDef.valueSet : valueSet,
            observer,
            visible: !fieldDef.activateExpression,
            disable: fieldDef.disable || (global.widgetTreeState[fieldDef.id] && global.widgetTreeState[fieldDef.id].disable),
            fieldValue: fieldDef.fieldValue,
            fieldType: fieldDef.type,
            isDynamic: fieldDef.isDynamic,
            tooltip: fieldDef.tooltip,
            index: fieldDef.index
        };
    }
}

export class RichTextFieldPropsConvertor implements PropsConvertor<HjRichTextFieldProps> {
    fromFieldDef(fieldDef: FormFieldDef): HjRichTextFieldProps {
        let observer = new Observable();
        detectVisibilityChange(fieldDef, observer);
        return {
            ...fieldDef,
            observer,
            visible: !fieldDef.activateExpression,
            fieldType: fieldDef.type,
            isDynamic: fieldDef.isDynamic,
            index: fieldDef.index
        };
    }
}


export class ImgSizeConstraintFieldPropsConvertor implements PropsConvertor<HjImgSizeConstraintFieldProps> {
    fromFieldDef(fieldDef: FormFieldDef): HjImgSizeConstraintFieldProps {
        // TODO: 图片限制宽&高，如果分别存储的话，fieldDef可能需要包含两个子字段
        // 也就是说字段类型为Group和ImgSizeConstraint时，fields字段非空
        let observer = new Observable();
        detectVisibilityChange(fieldDef, observer);
        return {
            title: fieldDef.title,
            name: fieldDef.id,
            names: [fieldDef.fields[0].id, fieldDef.fields[1].id],
            observer,
            visible: !fieldDef.activateExpression,
            disable: fieldDef.disable || (global.widgetTreeState[fieldDef.id] && global.widgetTreeState[fieldDef.id].disable),
            fieldType: fieldDef.type,
            fieldValue: fieldDef.fieldValue,
            isDynamic: fieldDef.isDynamic,
            tooltip: fieldDef.tooltip,
            index: fieldDef.index
        };
    } 
}

export class DateRangeFieldPropsConvertor implements PropsConvertor<HjDateRangeProps> {
    fromFieldDef(fieldDef: FormFieldDef): HjImgSizeConstraintFieldProps {
        // TODO: 日期范围字段包含需要包含两个子字段
        // 也就是说字段类型为Group/ImgSizeConstraint/DateRange时，fields字段非空
        let observer = new Observable();
        detectVisibilityChange(fieldDef, observer);
        return {
            title: fieldDef.title,
            name: fieldDef.id,
            names: [fieldDef.fields[0].id, fieldDef.fields[1].id],
            observer,
            visible: !fieldDef.activateExpression,
            disable: fieldDef.disable || (global.widgetTreeState[fieldDef.id] && global.widgetTreeState[fieldDef.id].disable),
            fieldValue: fieldDef.fieldValue,
            fieldType: fieldDef.type,
            isDynamic: fieldDef.isDynamic,
            tooltip: fieldDef.tooltip,
            index: fieldDef.index
        };
    }
}

export class GenericFieldPropsConvertor implements PropsConvertor<HjFieldProps> {
    fromFieldDef(fieldDef: FormFieldDef): HjFieldProps {
        let observer = new Observable();
        detectVisibilityChange(fieldDef, observer);
        return {
            ...fieldDef,
            title: fieldDef.title,
            name: fieldDef.id,
            annotation: fieldDef.tooltip,
            observer,
            visible: !fieldDef.activateExpression,
            disable: fieldDef.disable || (global.widgetTreeState[fieldDef.id] && global.widgetTreeState[fieldDef.id].disable),
            fieldValue: fieldDef.fieldValue,
            fieldType: fieldDef.type,
            isDynamic: fieldDef.isDynamic,
            index: fieldDef.index
        };
    }
}