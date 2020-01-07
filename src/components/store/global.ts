import { SearchActionDescriber, IComputedValue } from './data-interface';
import {Store} from 'redux';
import { Dictionary } from '../../interfaces';
import { CacheScope, Cache } from '../../hj-cache';

interface GlobalConfiguation {
    queryFieldsAPI: string;
    saveFieldsAPI: string;
    getResourceValueAPI: string;
    searchAPI: string;
    enableAPI: string;
    disableAPI: string;
    editAPI: string;
    viewAPI: string;
    createAPI: string;
    deleteAPI: string;
    querySingleAPI: string;
    copyAPI: string;
}

interface WidgetState {
    disable: boolean;
}

interface GlobalInstance {
    store: Store<any>;
    actions: SearchActionDescriber;
    setActions: (actions: SearchActionDescriber) => void;
    config: GlobalConfiguation;
    cache: Cache;
    widgetTreeState: Dictionary<WidgetState>;
    /**
     * 
     * 表单中涉及到的所有表达式，例如：
     * {
     *     expr: IComputedValue,
     * }
     * 
     */
    expressionGroup: Dictionary<IComputedValue>;
}

const instance: GlobalInstance = {
    store: null,
    widgetTreeState: {},
    cache: new Cache(CacheScope.customized),
    /**
     * 
     * TODO: getter only
     * 
     */
    actions: {
        getQueryParam() {
            let currentState = instance.store.getState();
            return {
                paramData: currentState.queryConditions,
                pageNum: currentState.pagination.current,
                pageSize: currentState.pagination.size
            };
        }
    },
    setActions(actions: SearchActionDescriber): void {
        instance.actions = {
            ...instance.actions,
            ...actions
        };
    },
    config: {
        queryFieldsAPI: '/activity/v2/resource/form/fields',
        saveFieldsAPI: '/activity/v2/resource/form/fields',
        getResourceValueAPI: '/activity/v2/resource/form/fields/',
        searchAPI: '/activity/v2/resource/query',
        enableAPI: '/activity/v2/resource/{0}/enable',
        disableAPI: '/activity/v2/resource/{0}/disable',
        editAPI: '/billboard/detail/',
        viewAPI: '/billboard/detail/{0}?readonly=1',
        createAPI: '/billboard/new',
        deleteAPI: '/activity/v2/resource/activity/{0}/disable',
        querySingleAPI: '/activity/v2/resource/{0}',
        copyAPI: '/billboardContent/copy/'
    },
    expressionGroup: {}
};

export default instance;