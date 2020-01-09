const Koa = require('koa');
const koaStatic = require('koa-static');
const fs = require('fs');
const path = require('path');
const app = new Koa();

const mappings = {
    /* api path, http method, json file name */
    '/activity/v2/resource/activity/query': ['1.json','POST'],
    '/activity/v2/resource/effectives?location=paySuccess': ['2.json', 'GET'],
    '/activity/v2/resource/effectives?location=intro': ['3.json', 'GET'],
    '/activity/v2/resource/effectives?location=home': ['4.json', 'GET'],
    '/activity/v2/resource/effectives?location=list': ['5.json', 'GET'],
};
app.use(koaStatic(path.resolve(__dirname, '..')));
app.use(async function(ctx) {
    let resInfo = mappings[ctx.href.replace(ctx.origin, '')];
    ctx.response.set('Content-Type', 'application/json;charset=UTF-8');
    if (resInfo) {
        ctx.response.body = fs.readFileSync(path.resolve(__dirname, path.join('api-mock', resInfo[0])));
    } else {
        ctx.response.body = '{}';
    }
});

app.listen(3000);