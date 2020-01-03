import React from 'react';
import { HjFieldWidget } from './fields/interface';

export const fieldCollectorContext = React.createContext({
    fieldWidgets: []
});

export interface FieldCollector {
    fieldWidgets: HjFieldWidget[]
}