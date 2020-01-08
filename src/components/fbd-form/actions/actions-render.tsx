
import { StateData } from "../../../interfaces";
import React, { ReactElement } from "react";
import FbdActionButton from './index';
import global from '../../store/global';
import FbdForm from '../index';
import Ajax from "../../../fbd-ajax";
import CommonUI from '../../../common-ui';
import cacheKey from '../../../cache-key';

export enum ActionButtonFlags {
    search = 1 << 0, /* 查询 */
    export = 1 << 1, /* 导出 */
    create = 1 << 2, /* 新建 */

    save = 1 << 3, /* 保存 */
    back = 1 << 4, /* 返回 */
}

interface ActionButtonDataClass {
    new(form: FbdForm<any, any>): ActionButtonData;
}

export interface SaveActionButtonInitData {
    confirmText?: string;
    localSave?: boolean;
    saveFields?: string[]
}

export interface CreateActionButtonInitData {
    postfix?: string;
}

export class ActionButtonType {
    flag: ActionButtonFlags;
    initData: any;

    constructor(flag: ActionButtonFlags, initData?: any) {
        this.flag = flag;
        this.initData = initData;
    }

    static search(initData?: any): ActionButtonType {
        return new ActionButtonType(ActionButtonFlags.search, initData);
    }

    static create(initData?: CreateActionButtonInitData): ActionButtonType {
        return new ActionButtonType(ActionButtonFlags.create, initData);
    }

    static save(initData?: SaveActionButtonInitData): ActionButtonType {
        return new ActionButtonType(ActionButtonFlags.save, initData);
    }

    static back(initData?: any): ActionButtonType {
        return new ActionButtonType(ActionButtonFlags.back, initData);
    }
}

/**
 * 
 * 需要识别到其所在的form对象
 * 
 */
abstract class ActionButtonData {
    text: string;
    form: FbdForm<any, any>;

    constructor(form: FbdForm<any, any>) {
        this.form = form;
    }

    init(intData: any): ActionButtonData {
        return this;
    }

    /**
     * 
     * 返回Promise，如果按钮点击会触发异步操作，后续还需要更多操作，例如更新按钮disable状态
     * 
     */
    onDo(): Promise<boolean> {
        if (!this.precheck()) {
            return Promise.resolve(true);
        }
        let data = this.onGetData();
        let param = this.processData(data);
        return this.onDoInternal(param);
    }

    /**
     * 
     * 数据预处理 
     * 
     * @param data - 待处理的数据对象 
     * 
     */
    processData(data: any): any {
        // 如果需要修改提交数据，重写此方法
        return data;
    }

    /**
     * 
     * 在执行动作前，检查是否继续执行；例如，表单验证
     * 
     */
    precheck(): boolean {
        return true;
    }

    /**
     * 
     * 返回actionbutton处理所需要的数据
     * 
     */
    onGetData(): any {
        return {};
    }
    abstract onDoInternal(data: any): Promise<boolean>;
    
}

class SearchActionButtonData extends ActionButtonData {
    constructor(form: FbdForm<any, any>) {
        super(form);
        this.text = '查询';
    }
    onDoInternal(data: StateData): Promise<boolean> {
        // 把表单的值保存下来
        // TODO: 是否需要支持配置
        global.cache.put(cacheKey.savedFieldValues, data);
        global.actions.updateDataSource(data);
        return Promise.resolve(true);
    }
    precheck(): boolean {
        return true;
    }
    onGetData(): any {
        global.actions.updateQueryCondition(this.form.getDataView());
        // 每次点击查询按钮时，重置当前分页为1
        global.actions.updatePagination({
            current: 1
        });
        return global.actions.getQueryParam();
    }
}

class CreateActionButtonData extends ActionButtonData {

    postfix?: string;

    constructor(form: FbdForm<any, any>) {
        super(form);
        this.text = '新建';
        this.postfix = '';
    }

    init(initData?: CreateActionButtonInitData) {
        if (initData) {
            this.postfix = initData.postfix;
        }
        
        return this;
    }

    onDoInternal(data: any): Promise<boolean> {
        window.location.href = global.config.createAPI + (this.postfix ? `/${this.postfix}` : '');
        return Promise.resolve(true);
    }
}

class SaveActionButtonData extends ActionButtonData {

    confirmText?: string;
    localSave?: boolean;
    saveFields?: string[];

    constructor(form: FbdForm<any, any>) {
        super(form);
        this.text = '保存';
        this.confirmText = '';
    }
    init(initData?: SaveActionButtonInitData) {
        this.confirmText = initData.confirmText;
        this.localSave = initData.localSave;
        this.saveFields = initData.saveFields;
        return this;
    }
    onDoInternal(data: any): Promise<boolean> {
        console.log(`${this.text}: ${JSON.stringify(data)}`);
        if (this.localSave) {
            let obj = data;
            if (this.saveFields && this.saveFields.length) {
                obj = {};
                for (let fieldName of this.saveFields) {
                    obj[fieldName] = data[fieldName];
                }
            }
            global.cache.put(cacheKey.saveNewFormValues, obj);
        }
        return new Promise((resolve, reject) => {
            const onOk = () => {
                Ajax.post(global.config.saveFieldsAPI, data).then(res => {
                    CommonUI.message.success('保存成功');
                    // 1秒钟后自动后退
                    resolve(false);
                    setTimeout(() => {
                        window.history.back();
                    }, 1000);
                }).catch(([msg]) => {
                    CommonUI.message.error(msg || '服务器出错啦～');
                    resolve(true);
                });
            };
            if (this.confirmText) {
                CommonUI.confirm({
                    title: this.confirmText,
                    onOk,
                    onCancel: () => {
                        resolve(true);
                    }
                });
            } else {
                onOk();
            }
        });
        
    }
    onGetData(): any {
        // TODO: store中的queryCondition应该改成更通用的名字
        // 方便store公用
        global.actions.updateQueryCondition(this.form.getDataView());
        // TODO: 是否可以直接访问store
        return global.store.getState().queryConditions;
    }
}

class BackActionButtonData extends ActionButtonData {
    constructor(form: FbdForm<any, any>) {
        super(form);
        this.text = '返回';
    }
    onDoInternal(data: any): Promise<boolean> {
        window.history.back();
        return Promise.resolve(true);
    }
}

let actionHandlers: [ActionButtonFlags, ActionButtonDataClass][] = [
    [ActionButtonFlags.search, SearchActionButtonData],
    [ActionButtonFlags.export, null],
    [ActionButtonFlags.create, CreateActionButtonData],
    [ActionButtonFlags.save, SaveActionButtonData],
    [ActionButtonFlags.back, BackActionButtonData]
];

export default function getActionDatas(buttons: ActionButtonType[], form: FbdForm<any, any>): ReactElement[] {
    if (!buttons || !buttons.length) {
        return null;
    }
    let res = [];
    for (let btnData of buttons) {
        for (let elem of actionHandlers) {
            if (btnData.flag & elem[0]) {
                res.push((new elem[1](form)).init(btnData.initData));
            }
        }
    }
    
    return res.map(d => <FbdActionButton text={d.text} onClick={() => {
        return d.onDo();
    }} />);
}