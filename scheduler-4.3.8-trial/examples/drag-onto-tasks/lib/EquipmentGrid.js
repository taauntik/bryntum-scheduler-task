import Grid from '../../../lib/Grid/view/Grid.js';
import '../../../lib/Grid/feature/FilterBar.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

export default class EquipmentGrid extends Grid {

    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @return {string}
     */
    static get $name() {
        return 'EquipmentGrid';
    }

    // Factoryable type name
    static get type() {
        return 'equipmentgrid';
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
};

// Register this widget type with its Factory
EquipmentGrid.initClass();
