import { Scheduler, DateHelper } from '../../../build/scheduler.module.js?456730';

StartTest(t => {

    let scheduler;

    t.beforeEach(t => scheduler?.destroy?.());

    t.it('Display date format should have priority over view preset', async t => {
        scheduler = await t.getSchedulerAsync({
            displayDateFormat : 'foo'
        });

        const tip = scheduler.features.scheduleTooltip.hoverTip;

        t.chain(
            { waitForAnimationFrame : null },

            { moveMouseTo : '.b-sch-timeaxis-cell', offset : [20, '50%'] },

            { waitForSelector : '.b-sch-scheduletip:not(.b-hidden)', desc : 'Waiting for cell tooltip' },

            async() => {
                t.is(tip.contentElement.querySelector('.b-sch-clock-text').innerText, 'foo', 'Tip contained correct data');
            },

            { moveMouseTo : '.b-grid-header' },

            { waitForSelectorNotFound : '.b-sch-scheduletip:not(.b-hidden)', desc : 'Waiting for cell tooltip' },

            async() => {
                scheduler.zoomToLevel(5);
            },

            { waitForAnimationFrame : null },

            { moveMouseTo : '.b-grid-header', offset : ['150%', '150%'] },

            { waitForSelector : '.b-sch-scheduletip:not(.b-hidden)', desc : 'Waiting for cell tooltip' },

            () => {
                t.is(tip.contentElement.querySelector('.b-sch-clock-text').innerText, 'foo', 'Tip contained correct data');
            }
        );
    });

    t.it('Should refresh correctly when returning to initial preset', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'hourAndDay',
            startDate  : new Date(2011, 0, 4),
            endDate    : new Date(2011, 0, 5)
        });

        scheduler.viewPreset = 'dayAndWeek';

        t.firesOnce(scheduler, 'beforePresetChange');
        t.firesOnce(scheduler.timeAxisViewModel, 'reconfigure');

        scheduler.viewPreset = 'hourAndDay';
    });

    t.it('Should format time correctly for all presets with time value', async t => {
        const viewPresetsWithTime = [
            'secondAndMinute',
            'secondAndMinute-60by40',
            'secondAndMinute-130by40',
            'minuteAndHour',
            'minuteAndHour-30by60',
            'minuteAndHour-130by60',
            'minuteAndHour-60by60',
            'minuteAndHour-100by60',
            'hourAndDay',
            'hourAndDay-64by40',
            'hourAndDay-100by40',
            'hourAndDay-64by40-2',
            'weekAndDay',
            'weekAndDay-54by80',
            'dayAndWeek'
        ];

        scheduler = await t.getSchedulerAsync({
            viewPreset : 'secondAndMinute',
            startDate  : new Date(2017, 0, 1, 1, 0),
            endDate    : new Date(2017, 0, 1, 8, 0),
            events     : [
                {
                    id         : 1,
                    name       : 'Work',
                    resourceId : 'r1',
                    startDate  : new Date(2017, 0, 1, 1, 0),
                    endDate    : new Date(2017, 0, 1, 2, 0)
                }
            ]
        });

        for (let i = 0; i < viewPresetsWithTime.length; i++) {
            const preset = viewPresetsWithTime[i];
            const val = preset.includes('secondAndMinute') ? '1:00:00 AM' : '1 AM';

            t.diag(`Preset ${preset}`);
            await t.waitForAnimationFrame();
            await t.moveMouseTo([0, 0]);
            await t.waitForSelectorNotFound('.b-sch-event-tooltip');

            scheduler.viewPreset = preset;

            await t.moveMouseTo([500, 0]);

            await scheduler.scrollEventIntoView(scheduler.eventStore.first);
            await t.waitForAnimationFrame();
            await t.moveMouseTo('[data-event-id=1]', null, null, [3, 10]);
            await t.waitForSelector('.b-sch-event-tooltip');

            t.selectorExists(`.b-sch-event-tooltip:contains(${val})`, `Correct format for preset ${preset}`);
        }
    });

    // https://github.com/bryntum/support/issues/1889
    t.it('Should apply viewPreset config object when subclassing', async t => {
        class MyScheduler extends Scheduler {
            static get configurable() {
                return {
                    viewPreset : {
                        base      : 'weekAndDayLetter',
                        tickWidth : 300,
                        headers   : [
                            {
                                unit       : 'month',
                                align      : 'center',
                                dateFormat : 'MMMM YY'
                            },
                            {
                                unit       : 'd',
                                align      : 'center',
                                dateFormat : 'd0'
                            }
                        ]
                    }
                };
            }
        }

        scheduler = new MyScheduler({
            appendTo : t.global.document.body
        });

        await t.waitForProjectReady(scheduler);
        t.is(t.rect('.b-sch-header-row.b-lowest .b-sch-header-timeaxis-cell').width, 300, 'viewPreset tickWidth config applied');
    });

    // https://github.com/bryntum/support/issues/2598
    t.it('Should be possible to detect in DOM what ViewPreset is used', async t => {
        scheduler = await t.getSchedulerAsync();

        await t.waitForSelector(`.b-scheduler[data-preset-id="${scheduler.viewPreset.id}"]`);

        scheduler.zoomIn();

        await t.waitForSelector(`.b-scheduler[data-preset-id="${scheduler.viewPreset.id}"]`);
    });

    // https://github.com/bryntum/support/issues/223
    t.it('Should support showing any number of headers stretching the grid header', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate : new Date(2022, 4, 1),
            endDate   : new Date(2022, 6, 1),
            resources : [
                { id : 1, name : 'Bob' }
            ],
            events : [
                { id : 1, resourceId : 1, startDate : new Date(2022, 4, 3), duration : 5, name : 'A cool task' }
            ],
            viewPreset : {
                timeResolution : {
                    unit      : 'day',
                    increment : 1
                },

                headers : [
                    {
                        unit       : 'month',
                        dateFormat : 'MMM YYYY',
                        align      : 'start'
                    },
                    {
                        unit     : 'week',
                        renderer : (startDate, endDate) => `Week ${DateHelper.format(startDate, 'WW')}`
                    },
                    {
                        unit       : 'day',
                        dateFormat : 'dd'
                    },
                    {
                        unit       : 'day',
                        dateFormat : 'DD'
                    },
                    {
                        unit     : 'day',
                        renderer : (startDate, endDate, headerConfig, index) => index % 4 === 0 ? Math.round(Math.random() * 5) : ''
                    }
                ]
            },

            columns : [
                { field : 'name', text : 'Name', width : 100 }
            ]
        });

        const rows = t.query('.b-sch-header-row');

        t.isApprox(rows[0].offsetHeight, 28, 'Reasonable height');
        t.isApprox(rows[1].offsetHeight, 28, 'Reasonable height');
        t.isApprox(rows[2].offsetHeight, 28, 'Reasonable height');
        t.isApprox(rows[3].offsetHeight, 28, 'Reasonable height');
    });
});
