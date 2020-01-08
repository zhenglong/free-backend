import React from 'react';
import { FbdFieldWidget } from './fields/interface';

export const fieldCollectorContext = React.createContext({
    fieldWidgets: []
});

export interface FieldCollector {
    fieldWidgets: FbdFieldWidget[]
}