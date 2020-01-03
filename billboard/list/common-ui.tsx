import { Modal, message } from 'antd';
import { ModalFuncProps } from 'antd/lib/modal';
import { MessageApi } from 'antd/lib/message';
/**
 * 
 * 可以直接控制反馈性UI，例如confirm，alert
 * 
 */

 interface CommonUI {
     confirm: (props: ModalFuncProps) => void;
     message: MessageApi
 }

 const obj: CommonUI = {
     confirm(props: ModalFuncProps) {
         Modal.confirm(props);
     },
     message
 };

export default obj;