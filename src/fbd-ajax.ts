import axios from 'axios';
import querystring from './querystring';

export interface FbdResponse {
    data?: any;
    status: number;
    message?: string;
}

export default class Ajax {
    static get(url: string, params?: any): Promise<FbdResponse> {
        if (params) {
            let str = querystring.stringify(params);
            url = `${url}?${str}`;
        }
        return axios.get(url).then(res => {
            if (typeof res.data == 'string') {
                res.data = JSON.parse(res.data);
            }
            if (res.status == 200) {
                if (res.data && res.data.status !== 0) {
                    throw [res.data.message, res];
                }
                return res.data;
            } else {
                throw [res.data.message, res];
            }
        });
    }

    static post(url: string, params?: object): Promise<FbdResponse> {
        return axios.post(url, params).then(res => {
            if (typeof res.data == 'string') {
                res.data = JSON.parse(res.data);
            }
            if (res.status == 200) {
                if (res.data && res.data.status) {
                    throw [res.data.message, res];
                }
                return res.data;
            } else {
                throw [res.data.message, res];
            }
        });
    }

    static put(url: string, params?: object): Promise<FbdResponse> {
        return axios.put(url, params).then(res => {
            if (typeof res.data == 'string') {
                res.data = JSON.parse(res.data);
            }
            if (res.status == 200) {
                if (res.data && res.data.status) {
                    throw [res.data.message, res];
                }
                return res.data;
            } else {
                throw [res.data.message, res];
            }
        });
    }
}