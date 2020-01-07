export const locationDataSource = [{
    key: 'intro',
    value: 'Intro页'
}, {
    key: 'paySuccess',
    value: '支付完成页'
}, {
    key: 'home',
    value: '选课中心'
}, {
    key: 'list',
    value: '列表页'
}];

export const locationMapping = {
    'intro': 'intro', // intro页
    'paySuccess': 'payed', // 支付完成页
    'home': 'home', // 首页
    'list': 'list' // 列表页
};

export const statusDataSource = [{ 
    key: '', 
    value: '全部' 
}, { 
    key: 0, 
    value: '未生效' 
}, { 
    key: 1, 
    value: '生效中' 
}, { 
    key: 2, 
    value: '已过期' 
}, { 
    key: 3, 
    value: '已作废' 
}];

export const platformDataSource = [{ 
    key: 'pc', 
    value: 'PC' 
}, { 
    key: 'mc', 
    value: '触屏' 
}, { 
    key: 'ios', 
    value: 'iosAPP' 
}, { 
    key: 'android', 
    value: 'androidAPP' 
}];