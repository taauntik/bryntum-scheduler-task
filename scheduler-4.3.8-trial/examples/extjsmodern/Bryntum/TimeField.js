/* eslint-disable */
Ext.define('Bryntum.TimeField', {
    extend: 'Ext.field.Select',
    alias: 'widget.timefield',

    options: [
        '00:00',
        '00:30',
        '01:00',
        '01:30',
        '02:00',
        '02:30',
        '03:00',
        '03:30',
        '04:00',
        '04:30',
        '05:00',
        '05:30',
        '06:00',
        '06:30',
        '07:00',
        '07:30',
        '08:00',
        '08:30',
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
        '18:00',
        '18:30',
        '19:00',
        '19:30',
        '20:00',
        '20:30',
        '21:00',
        '21:30',
        '22:00',
        '22:40',
        '23:00',
        '23:30'
    ],

    applyOptions : function(options) {
        return Ext.Array.map(options, function(option) {
            // Parse with a zero timezone offset
            var d = Ext.Date.parse(option + '-0', 'H:iZ') % (1000 * 60 * 60 * 24);
            return { text: option, value: new Date(d)};
        });
    },

    setValue : function(v) {
        if (!this.reconcilingValue) {
            if (typeof v === 'string') {
                var r = this.getStore().byText.get(v);
                v = r ? r.get('value') : null;
            }

            this.callParent([v]);
        }
    }
});
