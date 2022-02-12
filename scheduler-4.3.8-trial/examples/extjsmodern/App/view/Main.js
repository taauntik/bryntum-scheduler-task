/* eslint-disable */
Ext.define('App.view.Main', {
    extend : 'Ext.Panel',
    alias  : 'widget.main-view',

    controller : 'main',
    layout     : 'hbox',
    title      : {
        html : '<a id="title" href="../#example-extjsmodern"><h1>ExtJS Modern App integration demo</h1></a>',
        cls  : 'title-link'
    },
    id         : 'main-view',

    viewModel : {
        data : {
            rowHeight : 45
        }
    },

    items : [
        {
            xtype     : 'panel',
            title     : 'Ext JS Modern List',
            width     : 250,
            cls       : 'ext-list',
            layout    : 'fit',
            resizable : {
                split : true,
                edges : 'east'
            },
            items     : {
                xtype   : 'list',
                itemTpl : '<div class="contact">{firstName} <b>{lastName}</b></div>',
                grouped : true,

                store : {
                    grouper : {
                        property : 'lastName',
                        groupFn  : function(record) {
                            return record.get('lastName')[0];
                        }
                    },

                    data : [
                        { firstName : 'Peter', lastName : 'Venkman' },
                        { firstName : 'Raymond', lastName : 'Stantz' },
                        { firstName : 'Egon', lastName : 'Spengler' },
                        { firstName : 'Winston', lastName : 'Zeddemore' }
                    ]
                }
            }
        },
        {
            title     : 'Bryntum Scheduler',
            xtype     : 'schedulerpanel',
            reference : 'schedulerPanel',
            flex      : 1,
            barMargin : 0,
            header    : {
                items : [{
                    xtype    : 'spinnerfield',
                    label    : 'Row height',
                    width    : '12.5em',
                    bind     : '{rowHeight}',
                    minValue : 20
                }, {
                    xtype   : 'button',
                    iconCls : 'b-fa b-fa-plus',
                    text    : 'Add Task',
                    ui      : 'action',
                    handler : 'addTask'
                }, {
                    xtype   : 'button',
                    iconCls : 'b-fa b-fa-plus',
                    text    : 'Add Time Range',
                    ui      : 'action',
                    handler : 'addTimeRange'
                }]
            },

            bind : {
                rowHeight : '{rowHeight}'
            },

            eventStore : {
                readUrl  : 'data/events.json',
                autoLoad : true
            },

            resourceStore : {
                readUrl  : 'data/resources.json',
                autoLoad : true
            },

            // features : {
            //     eventTooltip : true
            // },

            columns : [
                { text : 'Name', field : 'name', width : 130, locked : true }
            ],

            startDate  : new Date(2018, 3, 1, 12),
            endDate    : new Date(2018, 3, 1, 20),
            viewPreset : 'hourAndDay',

            eventRenderer : 'eventRenderer'
        }
    ]
});
