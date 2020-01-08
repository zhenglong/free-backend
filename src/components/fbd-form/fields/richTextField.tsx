import React, { Component, RefObject, ChangeEvent } from "react";
import BraftEditor, { BraftEditorProps, EditorState } from 'braft-editor';
import 'braft-editor/dist/index.css'

import { FbdFieldProps } from "./fbd-field";
import { Form, Modal } from "antd";
import { FbdFieldWidget } from "./interface";
import { fieldCollectorContext, FieldCollector } from "../field-collector-context";
import { topic, VisibilityChangeData } from '../../fbd-table/observable';
import { FieldType } from "../../../interfaces";
import TextArea from "antd/lib/input/TextArea";
import { ContentUtils } from 'braft-utils';

export interface FbdRichTextFieldProps extends FbdFieldProps {

}

interface FbdRichTextFieldState {
    editorState: EditorState;
    visible: boolean;
    html: string;
    htmlModalVisible: boolean;
    isReading: boolean;
}

/**
 * 
 * 富文本编辑器
 * 
 */
export default class RichTextField extends Component<FbdRichTextFieldProps, FbdRichTextFieldState> implements FbdFieldWidget {

    editorRef: RefObject<BraftEditor>;

    constructor(props: FbdRichTextFieldProps) {
        super(props);

        this.editorRef = React.createRef();
        this.state = {
            editorState: BraftEditor.createEditorState(this.removeBR(props.fieldValue || '')),
            visible: this.props.visible,
            html: props.fieldValue,
            htmlModalVisible: false,
            isReading: false,
        };
        this.props.observer.subscribe(topic.visibilityChange, (data: VisibilityChangeData) => {
            this.setState({
                visible: data.newVal
            });
        });

        this.onEditorChange = this.onEditorChange.bind(this);
        this.onHtmlModalOk = this.onHtmlModalOk.bind(this);
        this.onHtmlModalCancel = this.onHtmlModalCancel.bind(this);
        this.onChangeHtml = this.onChangeHtml.bind(this);
    }
    type(): FieldType {
        return this.props.fieldType;
    }
    getValue(): any {
        return {
            [this.props.name]: this.addBR(this.state.editorState.toHTML())
        }
    }

    onEditorChange(editorState: EditorState) {
        this.setState({
            editorState
        });
    }

    addBR(html: string) {
        // TODO: 最好采用富文本编辑器级别的优化，目前只是移除首尾的空<p></p>
        html = html.replace(/^(<p><\/p>)+/g, '');
        html = html.replace(/(<p><\/p>)+$/g, '');
        return html.replace(/<p><\/p>/g, "<p><br/></p>");
    }

    removeBR(html: string) {
        return html.replace(/<p><br\/><\/p>/g, "<p></p>");
    }

    onHtmlModalOk() {
        if (!this.state.isReading) {
            // 在光标处插入html
            let {html} = this.state;
            let newEditorState = ContentUtils.insertHTML(this.state.editorState, html, 'insert-html');
            this.editorRef.current.setValue(newEditorState);
        }
        
        this.setState({
            htmlModalVisible: false,
            html: ''
        });
    }

    onHtmlModalCancel() {
        this.setState({
            htmlModalVisible: false,
            html: ''
        });
    }

    onChangeHtml(e: ChangeEvent<HTMLTextAreaElement>) {
        this.setState({
            html: e.target.value
        });
    }

    render() {
        const editorProps: BraftEditorProps = {
            value: this.state.editorState,
            placeholder: '请输入文字内容',
            onChange: this.onEditorChange,
            extendControls: [{
                key: 'displayHTML',
                type: 'button',
                text: '显示HTML',
                onClick: () => {
                    this.setState({
                        htmlModalVisible: true,
                        isReading: true,
                        html: this.addBR(this.state.editorState.toHTML())
                    });
                }
            }, {
                key: 'insertHTML',
                type: 'button',
                text: '插入HTML',
                onClick: () => {
                    this.setState({
                        htmlModalVisible: true,
                        isReading: false,
                        html: ''
                    });
                }
            }, {
                key: 'preview',
                type: 'button',
                text: '预览',
                onClick: () => {
                    let w = window.open();
                    $(w.document.body).html(`<html><head><meta charset="UTF-8"><title>富文本内容预览</title></head><body>${this.addBR(this.state.editorState.toHTML())}</body></html>`);
                }
            }],
            controls: [
                'redo',
                'undo',
                'font-size',
                'text-color',
                'bold',
                'italic',
                'underline',
                'strike-through',
                'link',
                'list-ul',
                'list-ol',
                'media',
            ],
            media: {
                uploadFn: (param) => {
                    const serverURL = '/home/upload?antd=1';
                    const xhr = new XMLHttpRequest();
                    const fd = new FormData();
                    const successFn = (response) => {
                        param.success({
                            url: xhr.responseText,
                            meta: null
                        })
                    }

                    const errorFn = (response) => {
                        param.error({
                            msg: '上传失败'
                        })
                    };
                    xhr.addEventListener("load", successFn, false);
                    xhr.addEventListener("error", errorFn, false);
                    xhr.addEventListener("abort", errorFn, false);

                    fd.append('file', param.file);
                    xhr.open('POST', serverURL, true);
                    xhr.send(fd);
                }
            }
        };
        return (
            [
                <fieldCollectorContext.Consumer>
                    {
                        (ctx: FieldCollector) => {
                            ctx.fieldWidgets.push(this);
                            return (
                                this.state.visible ? <Form.Item label={this.props.title}>
                                    <BraftEditor {...editorProps} ref={this.editorRef} ></BraftEditor>
                                </Form.Item> : null
                            );
                        }
                    }
                </fieldCollectorContext.Consumer>,
                <Modal title={this.state.isReading ? "显示HTML源码" : '插入HTML'} 
                    visible={this.state.htmlModalVisible} onOk={this.onHtmlModalOk} onCancel={this.onHtmlModalCancel} >
                    <TextArea readOnly={this.state.isReading ? true : false} rows={10} value={this.state.html} onChange={this.onChangeHtml} />
                </Modal>
            ]
            
            
        );
    }
}