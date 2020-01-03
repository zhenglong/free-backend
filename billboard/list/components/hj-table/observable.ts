import { Dictionary } from "../../interfaces";

export const topic = {
    toggleButtonText: 'SwitchActionButtonData.toggleButtonText',
    visibilityChange: 'rules.visibilityChange'
};

export type subscriberCallback = (data: any) => void;

export interface VisibilityChangeData {
    newVal: any;
    oldVal: any;
}

/**
 * 
 * 可订阅对象
 * 
 */
export class Observable {
    text: string;
    topicStore: Dictionary<subscriberCallback[]>;

    constructor() {
        this.topicStore = {};
    }

    publish(topic: string, data: any) {
        if (!this.topicStore[topic]) {
            return;
        }
        let callbacks = this.topicStore[topic];
        for (let i = 0; i < callbacks.length; i++) {
            callbacks[i](data);
        }
    }

    subscribe(topic: string, cb: subscriberCallback) {
        if (!this.topicStore[topic]) {
            this.topicStore[topic] = [];
        }

        this.topicStore[topic].push(cb);
    }
}