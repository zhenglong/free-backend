import React, {Component, ReactElement} from 'react';
import { HjFieldProps } from './hj-field';
import { Upload, Button, Icon } from 'antd';
import { UploadProps, RcFile, UploadChangeParam } from 'antd/lib/upload';
import { HjFieldWidget } from './interface';
import { UploadFile } from 'antd/lib/upload/interface';
import { fieldCollectorContext, FieldCollector } from '../field-collector-context';
import { topic, VisibilityChangeData } from '../../hj-table/observable';
import { FieldType } from '../../../interfaces';

export interface HjImgUploadProps extends UploadProps, HjFieldProps {
    
}

interface HjImgUploadState {
    /**
     * 
     * 已上传文件列表
     * 
     */
    fileList: UploadFile[],
    visible: boolean;
}

/**
 * 
 * 只能上传一张图片;如果重复上传，则之前的上传图片被覆盖
 * 
 */
export default class HjImgUploadField extends Component<HjImgUploadProps, HjImgUploadState> implements HjFieldWidget {

    constructor(props: HjImgUploadProps) {
        super(props);

        this.state = {
            fileList: this.props.fieldValue ? [{
                url: this.props.fieldValue,
                response: this.props.fieldValue,
                status: 'done',
                uid: (+new Date()).toString(),
                size: 0,
                type: '',
                name: this.props.fieldValue
            }] : [],
            visible: this.props.visible
        };

        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });

        this.onBeforeUpload = this.onBeforeUpload.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onRemove = this.onRemove.bind(this);
    }
    type(): FieldType {
        return this.props.fieldType;
    }
    getValue() {
        return {
            [this.props.id]: this.state.fileList.length ? this.state.fileList[0].response : ''
        };
    }

    onBeforeUpload(file: RcFile, fileList: RcFile[]): boolean {
        // 检查图片尺寸
        return true;
    }

    onChange(info: UploadChangeParam<UploadFile>) {
        this.setState({
            fileList: [info.file]
        });
    }

    onRemove(file: UploadFile) {
        if (this.props.disable) {
            return false;
        }
        this.setState(state => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {
                fileList: newFileList,
            };
        });
    }

    render(): ReactElement {
        return (
            <fieldCollectorContext.Consumer>
                {
                    (ctx: FieldCollector) => {
                        ctx.fieldWidgets.push(this);
                        return (
                            this.state.visible ? <div className="hj-img-upload">
                                <Upload disabled={this.props.disable} listType="picture" action="/home/upload?antd=1" fileList={this.state.fileList} beforeUpload={this.onBeforeUpload} onChange={this.onChange} onRemove={this.onRemove}>
                                    <Button disabled={this.props.disable}>
                                        <Icon type="upload"></Icon> {this.props.title || '选择文件上传'}
                                    </Button>
                                </Upload>
                                <p className="annotation">{this.props.annotation}</p>
                            </div> : null
                        );
                    }
                }
            </fieldCollectorContext.Consumer>
            
        );
    }
}