/**
 * @file TemplateEngine.spec.ts
 * @author anbang02@baidu.com
 */

import TemplateEngine from '../src/TemplateEngine';

describe('template.js', function () {
    it('have one filter', () => {
        let a = new TemplateEngine({
            filters: {
                add(a) {
                    return a;
                }
            }
        });
        let render = a.compile(`
            <ul class="list">
                {% for (val of list) { %}
                    {% if (val.show){ %}<li>{{ val.num | add }}</li>{% } %}
                {% } %}
            </ul>
        `);

        const html = render({
            list: [{
                show: true,
                num: 2
            }, {
                show: true,
                num: 4
            }]
        })
        expect(html.replace(/[\s]\s+/g, "")).toBe('<ul class="list"><li>2</li><li>4</li></ul>');
    })
    it('no filter', () => {
        let a = new TemplateEngine();
        let render = a.compile(`
            <ul class="list">
                {% for (val of list) { %}
                    {% if (val.show){ %}<li>{{ val.num + val.index }}</li>{% } %}
                {% } %}
            </ul>
        `);

        const html = render({
            list: [{
                show: true,
                num: 2,
                index: 0
            }, {
                show: true,
                num: 4,
                index: 1
            }]
        })
        expect(html.replace(/[\s]\s+/g, "")).toBe('<ul class="list"><li>2</li><li>5</li></ul>');
    })
    it('have filters', () => {
        let a = new TemplateEngine({
            filters: {
                add(a, b) {
                    return a + b;
                },
                double(a) {
                    return a*2;
                }
            }
        });
        let render = a.compile(`
            <ul class="list">
                {% for (val of list) { %}
                    {% if (val.show){ %}<li>{{ val.num | add(1) | double }}</li>{% } %}
                {% } %}
            </ul>
        `);

        const html = render({
            list: [{
                show: true,
                num: 2
            }, {
                show: true,
                num: 4
            }]
        })
        expect(html.replace(/[\s]\s+/g, "")).toBe('<ul class="list"><li>6</li><li>10</li></ul>');
    })
})