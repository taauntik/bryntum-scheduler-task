import { Scheduler, DateHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    const
        createScheduler = async(labelConfig, schedulerConfig) => {
            scheduler && scheduler.destroy();

            scheduler = new Scheduler(Object.assign({
                features : {
                    labels       : labelConfig,
                    eventTooltip : false,
                    eventDrag    : {
                        showTooltip : false
                    }
                },
                columns : [
                    { field : 'name', width : 150 }
                ],
                resources : [
                    { id : 1, name : 'Steve', job : 'Carpenter' },
                    { id : 2, name : 'John', job : 'Contractor' }
                ],
                events : [
                    {
                        id         : 1,
                        name       : 'Work',
                        resourceId : 1,
                        startDate  : new Date(2017, 0, 1),
                        endDate    : new Date(2017, 0, 5)
                    },
                    {
                        id         : 2,
                        name       : 'Plan',
                        resourceId : 2,
                        startDate  : new Date(2017, 0, 2),
                        endDate    : new Date(2017, 0, 6)
                    }
                ],
                startDate             : new Date(2017, 0, 1),
                endDate               : new Date(2017, 0, 6),
                barMargin             : 0,
                rowHeight             : 55,
                appendTo              : document.body,
                enableEventAnimations : false
            }, schedulerConfig));

            await t.waitForProjectReady();
        },

        checkLabels     = (t, expected, msg = '') => {
            const labels = document.querySelectorAll('.b-sch-label');

            // TODO: guess there is no guarantee that browsers deliver elements in querySelectorAll in same order, might need to come up with more reliable checking
            t.is(labels.length, expected.length, 'Correct number of labels' + msg);

            for (let i = 0; i < labels.length; i++) {
                t.is(labels[i].innerHTML, expected[i], 'Correct label ' + expected[i]);
            }

            if (!scheduler.features.labels.top) {
                t.is(document.querySelectorAll('.b-sch-label-top').length, 0, 'No top labels found');
            }

            if (!scheduler.features.labels.bottom) {
                t.is(document.querySelectorAll('.b-sch-label-bottom').length, 0, 'No bottom labels found');
            }
        };

    t.it('Using fields', async t => {
        await createScheduler({
            top    : 'name',
            bottom : 'job'
        });

        checkLabels(t, ['Work', 'Carpenter', 'Plan', 'Contractor']);
    });

    t.it('Using renderers', async t => {
        await createScheduler({
            top    : ({ resourceRecord }) => resourceRecord.name,
            bottom : ({ eventRecord }) => eventRecord.name
        });

        checkLabels(t, ['Steve', 'Work', 'John', 'Plan']);
    });

    t.it('Only top or bottom', async t => {
        await createScheduler({
            top : 'name'
        });

        checkLabels(t, ['Work', 'Plan'], ' on top');

        await createScheduler({
            bottom : 'job'
        });

        checkLabels(t, ['Carpenter', 'Contractor'], ' on bottom');
    });

    t.it('Drag', async t => {
        await createScheduler({
            top : 'name'
        });

        await t.dragBy('.b-sch-event', [100, 0]);
        checkLabels(t, ['Work', 'Plan'], 'In same order');
    });

    t.it('Resize', async t => {
        await createScheduler({
            top : 'name'
        });
        await t.dragBy('.b-sch-event', [50, 0], null, null, null, true, ['100%-2', 10]);
        checkLabels(t, ['Work', 'Plan'], ' on top after resize');
    });

    t.it('Layout', async t => {
        await createScheduler({
            top    : 'name',
            bottom : 'job'
        });

        const wrapperEls = document.querySelectorAll('.b-sch-event-wrap');

        for (const wrapperEl of wrapperEls) {
            const topLabel    = wrapperEl.querySelector('.b-sch-label-top'),
                bottomLabel = wrapperEl.querySelector('.b-sch-label-bottom'),
                event       = wrapperEl.querySelector('.b-sch-event'),
                topRect     = topLabel.getBoundingClientRect(),
                bottomRect  = bottomLabel.getBoundingClientRect(),
                eventRect   = event.getBoundingClientRect();

            t.isLess(topRect.bottom, eventRect.top, 'Top label above event');
            t.isGreater(bottomRect.top, eventRect.bottom, 'Bottom label below event');
        }
    });

    t.it('Editing terminating with ENTER', async t => {
        await createScheduler({
            right : {
                field  : 'fullDuration',
                editor : {
                    type     : 'durationfield',
                    minWidth : 110
                },
                renderer : ({ eventRecord }) => eventRecord.duration + ' ' + DateHelper.getLocalizedNameOfUnit(eventRecord.durationUnit, eventRecord.duration !== 1)
            }
        });

        const
            event    = scheduler.eventStore.findByField('name', 'Work')[0].data,
            duration = event.duration;

        await t.doubleClick(`[data-event-id=${event.id}] .b-sch-label-right`);
        await t.waitFor(() => document.activeElement === scheduler.features.labels.right.editor.inputField.input);
        await t.click(scheduler.features.labels.right.editor.inputField.triggers.spin.upButton);
        await t.type(null, '[ENTER]');
        t.is(event.duration, duration + 1);
    });

    t.it('Editing, typing new duration value with magnitude only, terminating with ENTER', async t => {
        await createScheduler({
            right : {
                field  : 'fullDuration',
                editor : {
                    type     : 'durationfield',
                    minWidth : 110
                },
                renderer : ({ eventRecord }) => eventRecord.duration + ' ' + DateHelper.getLocalizedNameOfUnit(eventRecord.durationUnit, eventRecord.duration !== 1)
            }
        });

        const
            event    = scheduler.eventStore.findByField('name', 'Work')[0].data,
            duration = event.duration;

        await t.doubleClick(`[data-event-id=${event.id}] .b-sch-label-right`);
        await t.waitFor(() => document.activeElement === scheduler.features.labels.right.editor.inputField.input);
        await t.click(scheduler.features.labels.right.editor.inputField.input);
        await t.type(null, `${duration + 1}[ENTER]`, null, null, null, true);
        t.is(event.duration, duration + 1);
    });

    t.it('Editing terminating with focusout, with blurAction default, which is cancel', async t => {
        await createScheduler({
            right : {
                field  : 'fullDuration',
                editor : {
                    type     : 'durationfield',
                    minWidth : 110
                },
                renderer : ({ eventRecord }) => eventRecord.duration + ' ' + DateHelper.getLocalizedNameOfUnit(eventRecord.durationUnit, eventRecord.duration !== 1)
            }
        });

        const
            event    = scheduler.eventStore.findByField('name', 'Work')[0].data,
            duration = event.duration;

        await t.doubleClick(`[data-event-id=${event.id}] .b-sch-label-right`);
        await t.waitFor(() => document.activeElement === scheduler.features.labels.right.editor.inputField.input);
        // Spin up
        await t.click(scheduler.features.labels.right.editor.inputField.triggers.spin.upButton);
        scheduler.focus();
        await t.waitFor(() => !scheduler.features.labels.right.editor.isVisible);
        t.is(event.duration, duration);

    });

    t.it('Editing terminating with focusout, with blurAction: \'complete\'', async t => {
        await createScheduler({
            blurAction : 'complete',
            right      : {
                field  : 'fullDuration',
                editor : {
                    type     : 'durationfield',
                    minWidth : 110
                },
                renderer : ({ eventRecord }) => eventRecord.duration + ' ' + DateHelper.getLocalizedNameOfUnit(eventRecord.durationUnit, eventRecord.duration !== 1)
            }
        });

        const
            event    = scheduler.eventStore.findByField('name', 'Work')[0].data,
            duration = event.duration;

        await t.doubleClick(`[data-event-id=${event.id}] .b-sch-label-right`);
        await t.waitFor(() => document.activeElement === scheduler.features.labels.right.editor.inputField.input);
        // Spin up
        await t.click(scheduler.features.labels.right.editor.inputField.triggers.spin.upButton);
        scheduler.focus();
        await t.waitFor(() => !scheduler.features.labels.right.editor.isVisible);
        await scheduler.project.commitAsync();
        t.is(event.duration, duration + 1);
    });

    t.it('Event created from DragCreate', async t => {
        await createScheduler({
            top    : 'name',
            bottom : 'job'
        }, {
            events : []
        });

        await t.dragBy('.b-sch-timeaxis-cell', [50, 0], null, null, null, false, [20, 80]);
        await t.type(null, 'New event[ENTER]');
        t.elementIsVisible(`.b-sch-label-top:contains(New event)`);
        t.elementIsVisible(`.b-sch-label-bottom:contains(Contractor)`);
    });

    t.it('Should support disabling', async t => {
        await createScheduler({
            top : 'name'
        });

        t.selectorExists('.b-sch-label-top', 'Labels found when enabled');

        scheduler.features.labels.disabled = true;

        t.selectorNotExists('.b-sch-label-top', 'No labels found when disabled');

        scheduler.features.labels.disabled = false;

        t.selectorExists('.b-sch-label-top', 'Labels found when enabled');
    });

    // https://github.com/bryntum/support/issues/2147
    t.it('Layout mode, left labels', async t => {
        await createScheduler({
            labelLayoutMode : 'estimate',
            left            : {
                renderer : ({ eventRecord }) => `<i></i><u>${eventRecord.name}</u>`
            }
        }, {
            events : [
                {
                    id         : 1,
                    name       : 'Working hard',
                    resourceId : 2,
                    startDate  : new Date(2017, 0, 4, 12),
                    endDate    : new Date(2017, 0, 7)
                },
                {
                    id         : 2,
                    name       : 'Plan',
                    resourceId : 2,
                    startDate  : new Date(2017, 0, 2),
                    endDate    : new Date(2017, 0, 4)
                }
            ]
        });

        t.isApproxPx(t.rect('.b-grid-row[data-id="2"]').height, 111, 'Stacked with estimate');

        scheduler.features.labels.labelLayoutMode = 'measure';

        t.isApproxPx(t.rect('.b-grid-row[data-id="2"]').height, 111, 'Stacked with measure');

        // Shorter string, wont be stacked when measuring but still stacked when estimating
        // Using special string for FireFox because it has different width measuring results
        scheduler.eventStore.first.name = t.bowser.firefox ? 'Workini' : 'Working';

        t.isApproxPx(t.rect('.b-grid-row[data-id="2"]').height, 56, 'Not stacked with measure');

        scheduler.features.labels.labelLayoutMode = 'estimate';

        t.isApproxPx(t.rect('.b-grid-row[data-id="2"]').height, 111, 'Stacked with estimate');

        // Even shorter string, not stacked at all (also makes sure html is not part of estimate)
        scheduler.eventStore.first.name = 'Worker';

        t.isApproxPx(t.rect('.b-grid-row[data-id="2"]').height, 56, 'Not stacked with estimate');
    });

    // https://github.com/bryntum/support/issues/2147
    t.it('Layout mode, right labels', async t => {
        await createScheduler({
            labelLayoutMode : 'estimate',
            right           : 'name'
        }, {
            events : [
                {
                    id         : 1,
                    name       : 'Plan',
                    resourceId : 2,
                    startDate  : new Date(2017, 0, 4, 12),
                    endDate    : new Date(2017, 0, 7)
                },
                {
                    id         : 2,
                    name       : 'Working hard',
                    resourceId : 2,
                    startDate  : new Date(2017, 0, 2),
                    endDate    : new Date(2017, 0, 4)
                }
            ]
        });

        t.isApproxPx(t.rect('.b-grid-row[data-id="2"]').height, 111, 'Stacked with estimate');

        scheduler.features.labels.labelLayoutMode = 'measure';

        t.isApproxPx(t.rect('.b-grid-row[data-id="2"]').height, 111, 'Stacked with measure');

        // Using special string for FireFox because it has different width measuring results
        scheduler.eventStore.last.name =  t.bowser.firefox ? 'Workini' : 'Working';

        t.isApproxPx(t.rect('.b-grid-row[data-id="2"]').height, 56, 'Not stacked with measure');

        scheduler.features.labels.labelLayoutMode = 'estimate';

        t.isApproxPx(t.rect('.b-grid-row[data-id="2"]').height, 111, 'Stacked with estimate');
    });
});
