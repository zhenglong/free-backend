import {Action} from 'redux';

export interface FbdAction<T> extends Action {
    data: T;
}