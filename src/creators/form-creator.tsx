import React from "react";
import ReactDOM from 'react-dom';
import HjForm, { HjFormProps } from '../components/hj-form';
import { FormFieldDef, FieldType } from "../interfaces";
import { ActionButtonType, SaveActionButtonInitData } from "../components/hj-form/actions/actions-render";

import initStore from '../components/store';
import Ajax from "../hj-ajax";
import { getFieldType, getDictionaryEntryArray, getValidationRule } from '../business';
import global from '../components/store/global';
import querystring from '../querystring';

import cacheKey from "../cache-key";

/**
 * 
 * 只有编辑模式下，disabledFieldNames才有效；
 * 如果页面名称强制指定了默认值，则页面名称disable；
 * 
 * @param disabledFieldNames 哪些字段要disable；
 * @param fieldsId 表单字段来源id
 * @param valuesId 表单值来源id
 * @param saveConfirmText 保存前的确认文案
 */
export default function formCreator(disabledFieldNames: string[], fieldsId, valuesId, saveButtonInitData?: SaveActionButtonInitData) {
    let isEditMode = !!valuesId; // 编辑模式
    let resourceValue = null; // 编辑模式或有本地缓存的情况下，表单字段值
    let qs = querystring.parse();
    const disableAll = qs.readonly == '1';
    let activityId = $('#hdn-activity-id').val(); // 表单复制的字段来源
    let formByResourceId = $('#hdn-resource-id').val();// 表单复制的值来源
    let defaultLocation = $('#hdn-location').val();
    let needToRequestWithLocation = false;

    // 只有新建模式并且指定了localsave为true，才会保存上次提交的表单数据
    if (saveButtonInitData && saveButtonInitData.localSave) {
        saveButtonInitData.localSave = !isEditMode;
    }

    if (!isEditMode) {
        if (saveButtonInitData.localSave) {
            let savedFormData = global.cache.get(cacheKey.saveNewFormValues);
            if (savedFormData) {
                resourceValue = savedFormData;
            }
        }
        if (defaultLocation) {
            needToRequestWithLocation = !resourceValue || (defaultLocation != resourceValue.location);
            // 强制指定的location与缓存发生变化时，需要抛弃缓存
            if (needToRequestWithLocation) {
                resourceValue = { location: defaultLocation };
            }
            
        }
    }

    /**
     * 编辑模式或有本地缓存的情况下需要获取表单对应值
     * @param obj - formFieldDef
     */
    const restoreModeFunc = (obj: any) => {
        if (!resourceValue) {
            return;
        }
        if (isEditMode && (disableAll || (disabledFieldNames.includes(obj.id)))) {
            obj.disable = true;
        }
        switch (obj.type) {
            case FieldType.dateRange:
            case FieldType.imgSizeConstraint:
                obj.fieldValue = resourceValue[obj.fields[0].name] && resourceValue[obj.fields[1].name] ? [resourceValue[obj.fields[0].name], resourceValue[obj.fields[1].name]] : undefined;
                break;
            default:
                obj.fieldValue = resourceValue[obj.id];
        }
    };
    /**
     * 
     * 数据映射，把后端返回的值转换成HjFieldDef
     * @param elem - 后端返回的数据
     */
    const fieldMap = (elem: any): FormFieldDef => {
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
        obj.fieldValue = elem.defaultValue;
        restoreModeFunc(obj);
        // 避免老的缓存覆盖指定的页面名称
        if (defaultLocation && obj.id == 'location') {
            obj.disable = true;
        }
        global.widgetTreeState[obj.id] = {
            disable: obj.disable
        };
        return obj;
    };
    /**
     * 表单渲染
     * @param data - 渲染数据
     * @param needLayout - 是否需要使用ECLayout
     */
    const renderFunc = (data: any, needLayout: boolean = false) => {
        let formProps: HjFormProps = {
            fields: data.map(fieldMap),
            actions: disableAll ? [ActionButtonType.back()] : [ActionButtonType.save(saveButtonInitData), ActionButtonType.back()]
        };
        // global.actions.updateQueryCondition(resourceValue);
        ReactDOM.render(<HjForm {...formProps}></HjForm>, document.getElementById('root'));
    }

    initStore();
    
    let param = null;
    if (isEditMode) {
        param = {
            resourceId: fieldsId
        };
    } else if(formByResourceId) {
        param = { resourceId: formByResourceId}
    } else if (resourceValue) {
        if (needToRequestWithLocation) {
            param = { location: resourceValue.location };
        } else if (resourceValue.resourceId) {
            param = { resourceId: resourceValue.resourceId };
        } 
    } 

    Ajax.get(global.config.queryFieldsAPI, param).then(({ data }) => {
        // 编辑模式下需要获取值
        if (isEditMode || activityId) {
            Ajax.get(global.config.getResourceValueAPI + (valuesId || activityId)).then(res1 => {
                resourceValue = res1.data;
                if(activityId){
                    resourceValue.activityId = null
                }
                renderFunc(data, true);
            });
        } else {
            renderFunc(data, true);
        }
    });
}
