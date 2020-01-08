import { DictionaryEntry } from "../../interfaces";
import * as moment from '../../fbd-moment';

enum TableFieldType {
    text,
    selection,
    date,
    dateRange,
    bool
}

export class TableField {
    type: TableFieldType;
    format?: string;
    dateFormat?: string;
    valueSet?: DictionaryEntry[];
    multiple?: boolean;

    constructor(fieldType: TableFieldType) {
        this.type = fieldType;

        this.render = this.render.bind(this);
    }

    render(val: any): string {
        switch (this.type) {
            case TableFieldType.text:
                return (this.format ? this.format.replace('{0}', val) : (val + ''));
            case TableFieldType.selection:
                try {
                    return !this.multiple ? this.valueSet.find(elem => elem.key == (val + '')).value : val.map(item => this.valueSet.find(elem => elem.key == (item + '')).value).join(' | ');
                } catch(ex) {
                    console.log(ex);
                    return '';
                }
            case TableFieldType.bool:
                return this.valueSet.find(elem => elem.key == ((!!val) + '')).value;
            case TableFieldType.date:
                return moment.format(val, this.dateFormat);
            case TableFieldType.dateRange:
                return `${moment.format(val[0], this.dateFormat)} 至 ${moment.format(val[1], this.dateFormat)}`
            default:
                return val + '';
        }
    }

    /**
     * 默认是简单文本，直接输出
     * 
     * @param {string} fmt - 按指定格式输出文本
     * 
     */
    static text(fmt: string): TableField {
        let obj = new TableField(TableFieldType.text);
        obj.format = fmt;
        return obj;
    }
    /**
     * 指定集合中的key，显示对应value
     * 
     * @param {DictionaryEntry[]} valueSet - 值集合
     * 
     */
    static selection(valueSet: DictionaryEntry[], multiple: boolean = false): TableField {
        let obj = new TableField(TableFieldType.selection);
        obj.valueSet = valueSet;
        obj.multiple = multiple;
        return obj;
    }
    /**
     * 日期类型
     * 
     * @param {string} fmt - Y/y(年) M(月) D/d(日) H/h(时) m(分) S/s(秒)
     * 默认显示YYYY-MM-DD hh:mm:ss
     * 
     */
    static date(fmt: string): TableField {
        let obj = new TableField(TableFieldType.date);
        obj.dateFormat = fmt;
        return obj;
    }

    static dateRange(fmt: string): TableField {
        let obj = new TableField(TableFieldType.dateRange);
        obj.dateFormat = fmt;
        return obj;
    }

    /**
     * boolean值，可以指定true/false时显示值
     * 
     * @param {string[]} arr - [trueText, falseText]；默认显示"是/否“
     * 
     */
    static bool(arr: string[]): TableField {
        if (!arr) {
            arr = ['是', '否'];
        }
        let obj = new TableField(TableFieldType.bool);
        obj.valueSet = [{
            key: 'true',
            value: arr[0]
        }, {
            key: 'false',
            value: arr[1]
        }];
        return obj;
    }
}