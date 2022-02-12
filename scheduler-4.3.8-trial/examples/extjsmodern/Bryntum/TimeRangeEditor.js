/* eslint-disable */
Ext.define('Bryntum.TimeRangeEditor', {
    extend : 'Ext.Dialog',
    xtype  : 'timerangeeditor',

    defaultFocus: 'textfield',

    title: 'Time Range',

    closeAction: 'hide',

    layout: 'fit',

    draggable: false,

    items: [{
        xtype: 'formpanel',
        reference: 'timerangeeditorForm',
        defaults: {
            required : true
        },
        items: [{
            xtype : 'textfield',
            name  : 'name',
            label : 'Name'
        }, {
            xtype: 'fieldcontainer',
            label: 'Start',
            layout: 'hbox',
            items: [{
                xtype: 'datefield',
                name: 'startDate',
                flex : 6,
                margin : '0 10 0 0',
                required : true
            }, {
                xtype: 'timefield',
                name: 'startTime',
                flex: 4,
                required : true
            }]
        }, {
            label: 'Start',
            xtype: 'fieldcontainer',
            layout: 'hbox',
            items: [{
                xtype: 'datefield',
                name: 'endDate',
                flex : 6,
                margin : '0 10 0 0',
                required : true
            }, {
                xtype: 'timefield',
                name: 'endTime',
                flex: 4,
                required : true
            }]
        }]
    }],

    // Link up the ENTER key to saving the time range
    keyMap: {
        ENTER: 'saveTimeRange'
    },

    bbar: {
        layout: {
            pack: 'space-between'
        },
        items: [ {
            reference: 'saveButton',
            text: 'Save',
            handler: 'saveTimeRange'
        }, {
            text: 'cancel',
            handler: 'up.close'
        }]
    }
});
