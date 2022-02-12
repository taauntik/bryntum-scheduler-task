/* eslint-disable */
// import Scheduler from '../../lib/Scheduler/view/Scheduler.js';

Ext.Loader.setPath('Bryntum', './Bryntum');

Ext.application({
    name: 'Main',

    requires: [
        'App.view.Main',
        'App.view.MainController',
        'Bryntum.Compat',
        'Bryntum.SchedulerPanel',
        'Bryntum.TimeField'
    ],

    launch : function() {
        Ext.Viewport.add({
            xtype: 'main-view'
        });
    }
});
