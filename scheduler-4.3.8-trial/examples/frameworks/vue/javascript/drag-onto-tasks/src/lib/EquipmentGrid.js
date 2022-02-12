/**
 * Equipment grid component
 *
 * Taken from the vanilla example
 */
import { Grid, StringHelper } from '@bryntum/scheduler';

export default class EquipmentGrid extends Grid {
    static get $name() {
        return 'equipmentGrid';
    }

    static get defaultConfig() {
        return {
            features : {
                filterBar : true,
                cellEdit  : false
            },

            rowHeight : 100,

            columns : [{
                text       : '',
                field      : 'name',
                htmlEncode : false,
                cellCls    : 'b-equipment',
                renderer   : data => StringHelper.xss`<i class="${data.record.iconCls}"></i>${data.record.name}`
            }]
        };
    }
}
