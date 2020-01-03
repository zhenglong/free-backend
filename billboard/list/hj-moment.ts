// format
// yyyy - 年；MM - 月；dd - 日；hh - 时；mm - 分；ss - 秒
// 下列符号表示，如果该位不足两位，也不用前置用零补足；
// M - 月；
// d - 日，
// h - 时，
// m - 分；
// s - 秒
function format(dateObj, fmt) {
    if (!fmt) {
        return fmt;
    }
    let v = toDate(dateObj);
    let res = [];
    let i = 0;
    while (i < fmt.length) {
        switch (fmt[i]) {
            case 'y':
            case 'Y':
                if (fmt[i + 1] == fmt[i] && fmt[i + 2] == fmt[i] && fmt[i + 3] == fmt[i]) {
                    res.push(v.getFullYear());
                    i += 4;
                }
                break;
            case 'M':
                if (fmt[i + 1] == fmt[i]) {
                    res.push(prefixWithZero(v.getMonth() + 1));
                    i += 2;
                } else {
                    res.push(v.getMonth() + 1);
                    i++;
                }
                break;
            case 'd':
            case 'D':
                if (fmt[i + 1] == fmt[i]) {
                    res.push(prefixWithZero(v.getDate()));
                    i += 2;
                } else {
                    res.push(v.getDate());
                    i++;
                }
                break;
            case 'h':
            case 'H':
                if (fmt[i + 1] == fmt[i]) {
                    res.push(prefixWithZero(v.getHours()));
                    i += 2;
                } else {
                    res.push(v.getHours());
                    i++;
                }
                break;
            case 'm':
                if (fmt[i + 1] == fmt[i]) {
                    res.push(prefixWithZero(v.getMinutes()));
                    i += 2;
                } else {
                    res.push(v.getMinutes());
                    i++;
                }
                break;
            case 's':
            case 'S':
                if (fmt[i + 1] == fmt[i]) {
                    res.push(prefixWithZero(v.getSeconds()));
                    i += 2;
                } else {
                    res.push(v.getSeconds());
                    i++;
                }
                break;
            default:
                res.push(fmt[i]);
                i++;
        }
    }
    return res.join('');
}



function prefixWithZero(num) {
    if (num < 10) return `0${num}`;
    return ('' + num);
}

function toDate(obj) {

    let objType = typeof obj;
    if (Object.prototype.toString.call(obj) == '[object Date]') {
        return obj;
    }
    if (objType == 'string') {
        // 处理ISO-8601日期格式
        let matches = obj.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+\d{4}$/);
        if (matches && matches.length) {
            let total = 6;
            let args = [];
            for (let i = 1; i <= total; i++) {
                args.push(parseInt(matches[i], 10));
            }
            args[1] -= 1; // 对于月份，减少1
            return new Date(args[0], args[1], args[2], args[3], args[4], args[5]);
        } else if (/^\d+$/.test(obj)) {
            return new Date(parseInt(obj, 10));
        } else {
            try {
                return new Date(obj);
            } catch (e) {
                console.log(e);
            }
        }
    } else if (objType == 'number') {
        return new Date(obj);
    }
    return null;
}

function timespanStr(startTime, endTime) {
    let start = toDate(startTime);
    let end = toDate(endTime);
    let ticks = end - start;

    const ticksPerSecond = 1000;
    const ticksPerMinute = 60 * ticksPerSecond;
    const ticksPerHour = 60 * ticksPerMinute;
    const ticksPerDay = 24 * ticksPerHour;

    let arr = [];
    let units = [ticksPerDay, ticksPerHour, ticksPerMinute, ticksPerSecond];
    for (let i = 0; i < units.length; i++) {
        if (!ticks) {
            break;
        }
        let temp = Math.floor(ticks / units[i]);
        arr.push(temp);
        ticks = ticks % units[i];
    }
    let days = arr[0] || 0;
    let hours = arr[1] || 0;
    let minutes = arr[2] || 0;
    let seconds = arr[3] || 0;
    return `${days}天${hours}时${minutes}分${seconds}秒`;
};

export {
    format,
    toDate,
    timespanStr
}