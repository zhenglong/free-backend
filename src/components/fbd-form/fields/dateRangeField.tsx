import React, {Component, ReactElement} from 'react';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import {DatePicker, Form} from 'antd';
import { RangePickerProps } from 'antd/lib/date-picker/interface';
import { FbdFieldProps } from './fbd-field';
import { FbdFieldWidget } from './interface';
import { fieldCollectorContext, FieldCollector } from '../field-collector-context';
import { topic, VisibilityChangeData } from '../../fbd-table/observable';
import moment from 'moment';
import { FieldType } from '../../../interfaces';

const {RangePicker} = DatePicker;

export interface FbdDateRangeProps extends RangePickerProps, FbdFieldProps {
    /**
     *
     * 0: beginTime字段id；1: endTime字段id
     *
     */
    names: string[]
}

interface FbdDateRangeState {
    visible: boolean;
}

const isoDateFormat = 'YYYY-MM-DDTHH:mm:ss+0800';
const displayDateFormat = "YYYY-MM-DD HH:mm:ss";
const displayTimeFormat = 'HH:mm:ss';

export default class FbdDateRangeField extends Component<FbdDateRangeProps, FbdDateRangeState> implements FbdFieldWidget {

    val: (string|moment.Moment)[];
    constructor(props: FbdDateRangeProps) {
        super(props);

        this.state = {
            visible: this.props.visible
        };

        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });

        let {fieldValue} = this.props;
        if (fieldValue) {
            this.val = [
                moment(fieldValue[0], isoDateFormat),
                moment(fieldValue[1], isoDateFormat)
            ];
        } else {
            this.val = [];
        }
        
        this.onChange = this.onChange.bind(this);
    }
    type(): FieldType {
        return this.props.fieldType;
    }
    getValue() {
        return {
            [this.props.names[0]]: ((this.val.length && this.val[0]) ? moment(this.val[0], displayDateFormat).format(isoDateFormat) : null),
            [this.props.names[1]]: ((this.val.length && this.val[1]) ? moment(this.val[1], displayDateFormat).format(isoDateFormat) : null)
        };
    }

    onChange(dates, dateStrings) {
        this.val = dateStrings;
    }

    render(): ReactElement {
        return (
            <fieldCollectorContext.Consumer>
                {
                    (ctx: FieldCollector) => {
                        ctx.fieldWidgets.push(this);
                        return (
                            this.state.visible ? <Form.Item label={this.props.title} className="fbd-date-range-field">
                                <RangePicker
                                    disabled={this.props.disable}
                                    locale={locale}
                                    defaultValue={this.props.fieldValue ? [moment(this.props.fieldValue[0], displayDateFormat), moment(this.props.fieldValue[1], displayDateFormat)] : null}
                                    showTime={{ format: displayTimeFormat, defaultValue: [moment('00:00:00', displayTimeFormat), moment('23:59:59', displayTimeFormat)] }}
                                    format={displayDateFormat}
                                    placeholder={['开始时间', '结束时间']}
                                    onChange={this.onChange}></RangePicker>
                            </Form.Item> : null
                        );
                    }
                }
            </fieldCollectorContext.Consumer>
        
        );
    }
} 