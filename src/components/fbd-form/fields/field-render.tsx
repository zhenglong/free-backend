
import FbdCheckbox from './checkbox';
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
import { FbdFieldProps } from './fbd-field';
import ImgSizeConstraintField from './imgSizeConstraintField';
import { Form } from 'antd';
import FbdDateRangeField from './dateRangeField';
import FbdClassListSelectField from './classList';
import FbdCouponBatchListSelectField from './couponBatchList';
import FbdImgUploadField from './imgUploadField';
import MaxLengthTextField from './maxLengthText';
import FbdHidden from './hidden';
import FbdRefreshSubFieldsDropdownField from './refreshSubFieldsDropdown';
import FbdForm from '..';
import { topic, VisibilityChangeData } from '../../fbd-table/observable';

interface PropsConvertorClass<T extends FbdFieldProps> {
    new(): PropsConvertor<T>;
}

interface FbdGroupFieldProps extends FbdFieldProps {
    fields: FormFieldDef[]
}

interface FbdGroupFieldState {
    visible: boolean;
}
class GroupField extends Component<FbdGroupFieldProps, FbdGroupFieldState> {
    constructor(props: FbdGroupFieldProps) {
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
                            return fieldRenders[field.type](field, this.props.fbdForm);
                        })
                    }
                </div>
            </Form.Item>
        );
    }
}

const mapping: [FieldType, ComponentClass, PropsConvertorClass<FbdFieldProps>][] = [
    [FieldType.checkbox, FbdCheckbox, CheckboxPropsConvertor],
    [FieldType.number, TextField, TextPropsConvertor],
    [FieldType.text, TextField, TextPropsConvertor],
    [FieldType.dropdown, DropdownField, DropdownPropsConvertor],
    [FieldType.refreshSubFields, FbdRefreshSubFieldsDropdownField, DropdownPropsConvertor],
    [FieldType.richTextField, RichTextField, RichTextFieldPropsConvertor],
    [FieldType.imgSizeConstraint, ImgSizeConstraintField, ImgSizeConstraintFieldPropsConvertor],
    [FieldType.group, GroupField, GenericFieldPropsConvertor],
    [FieldType.dateRange, FbdDateRangeField, DateRangeFieldPropsConvertor],
    [FieldType.classList, FbdClassListSelectField, GenericFieldPropsConvertor],
    [FieldType.couponBatchList, FbdCouponBatchListSelectField, GenericFieldPropsConvertor],
    [FieldType.imgUpload, FbdImgUploadField, GenericFieldPropsConvertor],
    [FieldType.maxLengthInput, MaxLengthTextField, TextPropsConvertor],
    [FieldType.hidden, FbdHidden, GenericFieldPropsConvertor],
];

type fieldHandlerFunc = (fieldDef: any, fbdForm: FbdForm<any, any>) => ReactElement;

function fieldHandler(WidgetClass: ComponentClass, converter: PropsConvertor<FbdFieldProps>): fieldHandlerFunc {
    return (fieldDef: any, fbdForm: FbdForm<any, any>): ReactElement => {
        return (
            <WidgetClass { ...{...converter.fromFieldDef(fieldDef), ...{fbdForm}} } />
        );
    };
}

let fieldRenders: Dictionary<fieldHandlerFunc> = {};

for (let elem of mapping) {
    let converter = new elem[2]();
    fieldRenders[elem[0]] = fieldHandler(elem[1], converter);
}

export default fieldRenders;