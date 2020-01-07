import { FieldType } from "../../../interfaces";
import { HjFieldProps } from "./hj-field";

/**
 * 
 * 返回控件的值
 * 
 */
export interface HjFieldWidget {
    getValue(): any;
    type(): FieldType;
    props: HjFieldProps;
}