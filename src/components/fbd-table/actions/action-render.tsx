
import React, { ReactElement } from "react";
import FbdActionButton from './index';
import {  Dictionary, RecordIdGetter } from "../../../interfaces";
import { Observable, topic } from "../observable";
import commonUI from '../../../common-ui';
import Ajax from "../../../fbd-ajax";
import global from '../../store/global';
import {strFormat} from '../../../util';
import * as remoteData from '../../../remote-data';

export enum ActionButtonFlags {
    edit = 1 << 2, /* 编辑 */
    toggle = 1 << 3, /* 切换状态 */
    delete = 1 << 4, /* 作废 */
    view = 1 << 5, /* 查看 */
    copy = 1 << 6
}

export class ActionButtonType {
    flag: ActionButtonFlags;
    initData: any;

    constructor(flag: ActionButtonFlags, initData?: any) {
        this.flag = flag;
        this.initData = initData;
    }

    static edit(initData?: EditActionButtonInitData): ActionButtonType {
        return new ActionButtonType(ActionButtonFlags.edit, initData);
    }

    static view(initData?: any): ActionButtonType {
        return new ActionButtonType(ActionButtonFlags.view, initData);
    }

    static delete(initData?: DeleteActionButtonInitData): ActionButtonType {
        return new ActionButtonType(ActionButtonFlags.delete, initData);
    }

    static toggle(initData?: SwitchAtionButtonDataInitialization): ActionButtonType {
        return new ActionButtonType(ActionButtonFlags.toggle, initData);
    }

    static copy(initData?: any) {
        return new ActionButtonType(ActionButtonFlags.copy, initData);
    }
}

interface ActionButtonDataClass {
    new(): ActionButtonData;
}

interface ActionButtonInitData {
    /**
     * 
     * 按钮是否可见
     * 
     */
    visibleGetter?: (record: any) => boolean;
}

/**
 * 
 * ActionButtonData应该是可观察对象
 * 
 */
abstract class ActionButtonData extends Observable {
    visible: boolean;

    constructor() {
        super();

        this.visible = true;
    }

    init(initData: ActionButtonInitData, rowData: any): ActionButtonData {
        if (initData.visibleGetter) {
            this.visible = initData.visibleGetter(rowData);
        }
        return this;
    }
    onDo(rowData: any) {
        if (!this.precheck()) {
            return;
        }
        let param = this.processData(rowData);
        this.onDoInternal(param);
    }
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
    abstract onDoInternal(data: any): void;
}

class ViewActionButtonData extends ActionButtonData {
    recorderIdGetter: RecordIdGetter;
    
    constructor() {
        super();
        this.text = '查看';
        this.recorderIdGetter = rowData => rowData.resourceId;
    }

    onDoInternal(rowData: any) {
        window.location.href = `${strFormat(global.config.viewAPI, this.recorderIdGetter(rowData))}`;
    }
    init(initData: EditActionButtonInitData, rowData: any): ActionButtonData {
        super.init(initData, rowData);
        this.recorderIdGetter = initData.recorderIdGetter;
        return this;
    }
}

interface EditActionButtonInitData extends ActionButtonInitData {
    recorderIdGetter: RecordIdGetter;
}

class EditActionButtonData extends ActionButtonData {
    recorderIdGetter: RecordIdGetter;

    constructor() {
        super();
        this.text = '编辑';
        this.recorderIdGetter = rowData => rowData.resourceId;
    }
    onDoInternal(rowData: any) {
        window.location.href = `${global.config.editAPI}${this.recorderIdGetter(rowData)}`;
    }
    init(initData: EditActionButtonInitData, rowData: any): ActionButtonData {
        super.init(initData, rowData);
        this.recorderIdGetter = initData.recorderIdGetter;
        return this;
    }
}

export interface SwitchAtionButtonDataInitialization extends ActionButtonInitData {
    defaultValGetter: (record: any) => boolean;
    textSet?: Dictionary<string>;
    recorderIdGetter?: RecordIdGetter;
}
class SwitchActionButtonData extends ActionButtonData {
    textSet: Dictionary<string>;
    state: boolean;
    recorderIdGetter: RecordIdGetter;

    constructor() {
        super();
        this.textSet = {
            'true': '禁用',
            'false': '启用'
        }
        this.state = true;
        this.text = this.textSet[this.state + ''];
        this.recorderIdGetter = rowData => rowData.resourceId;
    }

    init(data: SwitchAtionButtonDataInitialization, rowData: any): SwitchActionButtonData {
        super.init(data, rowData);

        if (!data) {
            return this;
        }
        let { defaultValGetter, textSet, recorderIdGetter } = data;
        this.state = defaultValGetter(rowData);
        if (textSet) {
            this.textSet = textSet;
        }
        this.text = this.textSet[this.state + ''];

        if (recorderIdGetter) {
            this.recorderIdGetter = recorderIdGetter;
        }
        return this;
    }

    onDoInternal(rowData: any) {
        // 需要把按钮文本修改成“启用”
        commonUI.confirm({
            title: `确认${this.text}吗？`,
            onOk: () => {
                console.log(`提交请求：${JSON.stringify(rowData)}`);
                let itemKey = this.recorderIdGetter(rowData);
                Ajax.post(strFormat(this.state ? global.config.disableAPI : global.config.enableAPI, itemKey), {}).then((res) => {
                    commonUI.message.success('操作成功');
                    // 获取当前行的最新状态并更新
                    remoteData.querySingle(itemKey).then(item => {
                        global.actions.updateRowInDataSource(item, this.recorderIdGetter);

                        // this.state = !this.state;
                        // this.publish(topic.toggleButtonText, this.textSet[this.state + '']);
                    });
                }).catch(([msg]) => {
                    commonUI.message.error(msg || '操作失败');
                });
            }
        });
    }
}

interface DeleteActionButtonInitData extends ActionButtonInitData {
    recorderIdGetter: RecordIdGetter;
}

/**
 * 
 * TODO: 需要判断按钮是否可见
 * 
 */
class DeleteActionButtonData extends ActionButtonData {
    recorderIdGetter: RecordIdGetter;

    constructor() {
        super();
        this.text = '作废';
        this.recorderIdGetter = rowData => rowData.resourceId;
    }
    onDoInternal(rowData: any) {
        commonUI.confirm({
            title: `确认${this.text}吗？`,
            onOk: () => {
                console.log(`提交请求：${JSON.stringify(rowData)}`);
                let recordKey = this.recorderIdGetter(rowData);
                Ajax.post(strFormat(global.config.deleteAPI, recordKey), {}).then((res) => {
                    commonUI.message.success('操作成功');
                    // 获取当前行的最新状态并更新
                    remoteData.querySingle(recordKey).then(item => {
                        global.actions.updateRowInDataSource(item, this.recorderIdGetter);
                    });
                }).catch(([msg]) => {
                    commonUI.message.error(msg || '操作失败');
                });
            }
        });
    }
    init(initData: DeleteActionButtonInitData, rowData: any): ActionButtonData {
        super.init(initData, rowData);
        this.recorderIdGetter = initData.recorderIdGetter;
        return this;
    }
}
interface CopyActionButtonInitData extends ActionButtonInitData {
    recorderIdGetter: RecordIdGetter;
}
class CopyActionButtonData extends ActionButtonData {
    recorderIdGetter?: RecordIdGetter;

    constructor() {
        super();
        this.text = '拷贝';
        this.recorderIdGetter = rowData => rowData.activityId;
    }
    onDoInternal(rowData: any) {
        window.location.href = global.config.copyAPI + this.recorderIdGetter(rowData);
    }
    init(initData: CopyActionButtonInitData, rowData: any): ActionButtonData {
        super.init(initData, rowData);
        if (initData && initData.recorderIdGetter) {
            this.recorderIdGetter = initData.recorderIdGetter;
        }
        return this;
    }
}

let actionHandlers: [ActionButtonFlags, ActionButtonDataClass][] = [
    [ActionButtonFlags.edit, EditActionButtonData],
    [ActionButtonFlags.toggle, SwitchActionButtonData],
    [ActionButtonFlags.delete, DeleteActionButtonData],
    [ActionButtonFlags.view, ViewActionButtonData],
    [ActionButtonFlags.copy, CopyActionButtonData]
];

export default function getActionDatas(buttons: ActionButtonType[], rowData: any): ReactElement[] {
    if (!buttons || !buttons.length) {
        return null;
    }
    let res: ActionButtonData[] = [];
    
    for (let btnData of buttons) {
        for (let elem of actionHandlers) {
            if (btnData.flag & elem[0]) {
                res.push((new elem[1]()).init(btnData.initData, rowData));
            }
        }
    }
    
    return res.map(d => d.visible ? <FbdActionButton observer={d} text={ d.text } onClick = {() => {
        d.onDo(rowData);
    }} /> : null);
}