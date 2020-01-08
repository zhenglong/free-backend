import { FieldType } from "../../../interfaces";
import { FbdFieldProps } from "./fbd-field";

/**
 * 
 * 返回控件的值
 * 
 */
export interface FbdFieldWidget {
    getValue(): any;
    type(): FieldType;
    props: FbdFieldProps;
}