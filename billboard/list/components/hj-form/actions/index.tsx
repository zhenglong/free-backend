import {Button} from 'antd';
import React, { Component } from 'react';
import './index.scss';

export interface HjActionButtonProps {
    text: string;
    onClick: () => Promise<boolean>;
}

export interface HjActionButtonState {
    disabled: boolean;
}

export default class HjActionButton extends Component<HjActionButtonProps, HjActionButtonState> {
    constructor(props: HjActionButtonProps) {
        super(props);

        this.state = {
            disabled: false
        };

        this.onClick = this.onClick.bind(this);
    }

    enable() {
        this.setState({
            disabled: false
        });
    }

    disable() {
        this.setState({
            disabled: true
        });
    }

    onClick() {
        if (this.state.disabled) {
            // 避免重复点击
            return;
        }
        this.disable();
        if (this.props.onClick) {
            this.props.onClick().then(res => {
                if (!res) {
                    return;
                }
                this.enable();
            });
        } else {
            this.enable();
        }
    }

    render() {
        return (
            <Button disabled={this.state.disabled} className="hj-action-button" type="primary" onClick={this.onClick}>{this.props.text}</Button>
        )
    }
}