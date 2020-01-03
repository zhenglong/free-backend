import { FormFieldDef } from "./interfaces";

export function strFormat(fmt, ...params) {
    let s = fmt;
    for (let i = 0; i < params.length; i++) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'g'), params[i]);
    }
    return s;
};

export function travelFieldDef(fields: FormFieldDef[], cb: (field: FormFieldDef) => void) {
    for (let fieldDef of fields) {
        cb(fieldDef);
        if (fieldDef.fields && fieldDef.fields.length) {
            travelFieldDef(fieldDef.fields, cb);
        }
    }
}