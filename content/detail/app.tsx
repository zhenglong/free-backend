import formCreator from '../../billboard/list/creators/form-creator';
import global from '../../billboard/list/components/store/global';
import './index.scss';

global.config.queryFieldsAPI = '/activity/v2/resource/activity/form/fields';
global.config.getResourceValueAPI = '/activity/v2/resource/activity/form/fields/';
global.config.saveFieldsAPI = '/activity/v2/resource/activity/form/fields';
formCreator(['resourceId', 'location'], $('#item-id').val(), $('#value-id').val(), {
    localSave: true,
    saveFields: ['location', 'resourceId']
});