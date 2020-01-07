import formCreator from '@free-backend/creators/form-creator';
import './index.scss';

let resourceId = $('#item-id').val();
// 编辑模式下，需要弹框确认
formCreator(['resourceType'], resourceId, resourceId, {confirmText: resourceId ? '再次保存后会影响已存在的活动信息配置，确认保存么？' : ''});