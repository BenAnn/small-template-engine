/**
 * @file TemplateEnging.ts
 * @author anbang02@baidu.com
 */

interface TemplateConfig {
    varControls?: string[];
    tagControls?: string[];
    filters? : {};
}

export default class TemplateEngine {
    varControls: string[];
    tagControls: string[];
    tagControlsLeft: RegExp;
    tagControlsRight: RegExp;
    varControlsReg: RegExp;
    middleStr: string;
    filters: any;

    constructor(params?: TemplateConfig) {
        // 根据用户是否传入参数做容错处理
        if (params) {
            if (params.varControls && params.varControls.length > 0) {
                this.varControls = params.varControls;
            }
            else {
                this.varControls = ['{{', '}}'];
            }
            if (params.tagControls && params.tagControls.length > 0) {
                this.tagControls = params.tagControls;
            }
            else {
                this.tagControls = ['{%', '%}'];
            }
            if (this.tagControls[0].includes(this.varControls[0])) {
                throw Error('自定义的限制符号太接近了，请重新设置');
            }
        }
        else {
            this.varControls = ['{{', '}}'];
            this.tagControls = ['{%', '%}'];
        }
        this.init(params);
    }

    init(params?: TemplateConfig): void {
        this.tagControlsLeft = new RegExp(this.tagControls[0], 'g');
        this.tagControlsRight = new RegExp(this.tagControls[1], 'g');
        this.varControlsReg = new RegExp(this.varControls[0] + '\\s*([^' + this.varControls[1] + ']+?)\\s*' + this.varControls[1], 'g');
        this.filters = (params && params.filters) || {};
    }

    handleMiddleStr(tpl: string): void {
        // 将filter里的方法转换为字符串
        let funcStr = '';
        if (this.filters !== {}) {
            for (let key in this.filters) {
                funcStr += this.filters[key].toString().replace(key, 'function ' + key) + ';';
            }
        }
        // 获取模板中变量，如果存在filter，则执行，
        let handleFilter = `function handleFilter(str){
            if (str.includes("|")) {
                let arr = str.replace(/\\s*/g,"").split("|");
                let res = "";
                for (let i = 1; i < arr.length; i++) {
                    let beforeArr = '';
                    if (res) {
                        beforeArr = res;
                    }
                    else {
                        beforeArr = arr[i - 1];
                    }
                    if (arr[i].includes('(')){
                        res = arr[i].split(")").join('') + ',' + beforeArr + ')';
                    }
                    else {
                        res = arr[i] + '(' + beforeArr + ')';
                    }
                    res = eval(res);
                };
                p.push(res);
            }
            else {
                let res = eval(str)
                p.push(res);
            }
        };`
        // 模板处理
        let headStr = `let p = []; p.push('`;
        let middleStr =  tpl.replace(/[\r\n\t]/g, '')
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(this.varControlsReg, "'); handleFilter('$1'); p.push('")
            .replace(this.tagControlsLeft, "');")
            .replace(this.tagControlsRight, "p.push('");
        let footStr = "'); return p.join('');";
        this.middleStr = funcStr + handleFilter + headStr + middleStr + footStr;
    }

    compile(tpl: string): Function {
        // 处理模板
        this.handleMiddleStr(tpl);
        // 把模板变量赋值到闭包作用域内
        let startStr = 'var html = (function(__params__, __filters__) {' +
            'var __str__ = "";' +
            'for(var key in __params__) {' +
                '__str__ += "var " + key + "= __params__[\'" + key + "\'];"' +
            '};' +
            'eval(__str__);';
        let endStr = '})(__params__, __filters__); return html';
        let result = startStr + this.middleStr + endStr;
        return new Function('__params__', '__filters__', result);
    }
}
