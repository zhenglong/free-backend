
import HjCheckbox from './checkbox';
import TextField from './textField';
import DropdownField from './dropdown';
import RichTextField from './richTextField';
import {FieldType, FormFieldDef} from '../../../interfaces';
import React, { ComponentClass, ReactElement, Component } from 'react';
import { 
    PropsConvertor, 
    TextPropsConvertor,  
    DropdownPropsConvertor,
    RichTextFieldPropsConvertor,
    ImgSizeConstraintFieldPropsConvertor,
    GenericFieldPropsConvertor,
    CheckboxPropsConvertor,
    DateRangeFieldPropsConvertor
} from '../props-convertor';
import { Dictionary } from '../../../interfaces';
import { HjFieldProps } from './hj-field';
import ImgSizeConstraintField from './imgSizeConstraintField';
import { Form } from 'antd';
import HjDateRangeField from './dateRangeField';
import HjClassListSelectField from './classList';
import HjCouponBatchListSelectField from './couponBatchList';
import HjImgUploadField from './imgUploadField';
import MaxLengthTextField from './maxLengthText';
import HjHidden from './hidden';
import HjRefreshSubFieldsDropdownField from './refreshSubFieldsDropdown';
import HjForm from '..';
import { topic, VisibilityChangeData } from '../../hj-table/observable';

interface PropsConvertorClass<T extends HjFieldProps> {
    new(): PropsConvertor<T>;
}

interface HjGroupFieldProps extends HjFieldProps {
    fields: FormFieldDef[]
}

interface HjGroupFieldState {
    visible: boolean;
}
class GroupField extends Component<HjGroupFieldProps, HjGroupFieldState> {
    constructor(props: HjGroupFieldProps) {
        super(props);

        this.state = {
            visible: this.props.visible
        };

        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });
    }

    render(): ReactElement {
        const hiddenStyle = {
            display: 'none'
        };
        return (
            <Form.Item label={this.props.title} style={this.state.visible ? null : hiddenStyle}>
                <div style={{ border: '1px solid #ebedf0', padding: '8px' }}>
                    {
                        this.props.fields.map(field => {
                            return fieldRenders[field.type](field, this.props.hjForm);
                        })
                    }
                </div>
            </Form.Item>
        );
    }
}

const mapping: [FieldType, ComponentClass, PropsConvertorClass<HjFieldProps>][] = [
    [FieldType.checkbox, HjCheckbox, CheckboxPropsConvertor],
    [FieldType.number, TextField, TextPropsConvertor],
    [FieldType.text, TextField, TextPropsConvertor],
    [FieldType.dropdown, DropdownField, DropdownPropsConvertor],
    [FieldType.refreshSubFields, HjRefreshSubFieldsDropdownField, DropdownPropsConvertor],
    [FieldType.richTextField, RichTextField, RichTextFieldPropsConvertor],
    [FieldType.imgSizeConstraint, ImgSizeConstraintField, ImgSizeConstraintFieldPropsConvertor],
    [FieldType.group, GroupField, GenericFieldPropsConvertor],
    [FieldType.dateRange, HjDateRangeField, DateRangeFieldPropsConvertor],
    [FieldType.classList, HjClassListSelectField, GenericFieldPropsConvertor],
    [FieldType.couponBatchList, HjCouponBatchListSelectField, GenericFieldPropsConvertor],
    [FieldType.imgUpload, HjImgUploadField, GenericFieldPropsConvertor],
    [FieldType.maxLengthInput, MaxLengthTextField, TextPropsConvertor],
    [FieldType.hidden, HjHidden, GenericFieldPropsConvertor],
];

type fieldHandlerFunc = (fieldDef: any, hjForm: HjForm<any, any>) => ReactElement;

function fieldHandler(WidgetClass: ComponentClass, converter: PropsConvertor<HjFieldProps>): fieldHandlerFunc {
    return (fieldDef: any, hjForm: HjForm<any, any>): ReactElement => {
        return (
            <WidgetClass { ...{...converter.fromFieldDef(fieldDef), ...{hjForm}} } />
        );
    };
}

let fieldRenders: Dictionary<fieldHandlerFunc> = {};

for (let elem of mapping) {
    let converter = new elem[2]();
    fieldRenders[elem[0]] = fieldHandler(elem[1], converter);
}

export default fieldRenders;