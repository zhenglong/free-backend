import {Action} from 'redux';

export interface HjAction<T> extends Action {
    data: T;
}