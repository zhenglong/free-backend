import {Button} from 'antd';
import React, { Component } from 'react';
import { Observable, topic } from '../observable';

export interface HjActionButtonProps {
    text: string;
    onClick: () => void;
    observer?: Observable;
}

interface HjActionButtonState {
    btnText: string;
}

export default class HjActionButton extends Component<HjActionButtonProps, HjActionButtonState> {
    constructor(props: HjActionButtonProps) {
        super(props);
        this.state = {
            btnText: this.props.text
        };
        if (this.props.observer) {
            this.props.observer.subscribe(topic.toggleButtonText, (txt) => {
                this.changeText(txt);
            });
        }
        
        this.changeText = this.changeText.bind(this);
    }

    /**
     * 
     * 修改按钮文案
     * 
     * @param txt - 按钮文案
     * 
     */
    changeText(txt: string) {
        this.setState({
            btnText: txt
        });
    }

    render() {
        return (
            <Button type="link" onClick={this.props.onClick}>{this.props.text}</Button>
        )
    }
}