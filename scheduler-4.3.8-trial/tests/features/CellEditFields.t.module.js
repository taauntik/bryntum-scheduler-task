import { ResourceStore, EventStore, Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    Object.assign(window, {
        Scheduler,
        EventStore,
        ResourceStore
    });

    let scheduler;

    t.beforeEach(t => {
        scheduler && scheduler.destroy();
        scheduler = null;
    });

    // https://github.com/bryntum/support/issues/1093
    t.it('Cell date editor should respect weekStartDay config', t => {
        scheduler = t.getScheduler({
            features : {
                cellEdit : true
            },
            columns : [
                { type : 'date', field : 'birthday' }
            ],
            weekStartDay : 1
        });

        t.chain(
            { doubleClick : '.b-grid-cell[data-column="birthday"]' },
            { click : '.b-pickerfield .b-icon-calendar' },
            {
                waitForSelector : '.b-calendar-day-header[data-column-index="0"][data-cell-day="1"]',
                desc            : 'Week starts with correct day'
            }
        );
    });

    t.it('Cell date editor should respect DateHelper.weekStartDay config', t => {
        scheduler = t.getScheduler({
            features : {
                cellEdit : true
            },
            columns : [
                { type : 'date', field : 'birthday' }
            ]
        });

        t.chain(
            { doubleClick : '.b-grid-cell[data-column="birthday"]' },
            { click : '.b-pickerfield .b-icon-calendar' },
            {
                waitForSelector : '.b-calendar-day-header[data-column-index="0"][data-cell-day="0"]',
                desc            : 'Week starts with correct day'
            }
        );
    });

});
