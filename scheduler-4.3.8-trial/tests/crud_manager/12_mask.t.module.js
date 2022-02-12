import { Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler?.destroy());

    t.mockUrl('loadurl', {
        delay        : 100,
        responseText : JSON.stringify({
            success   : true,
            resources : {
                rows : [
                    { id : 'a' }
                ]
            },
            events : {
                rows : [
                    {
                        id         : 1,
                        resourceId : 'a',
                        startDate  : '2018-02-01',
                        endDate    : '2018-03-01'
                    }
                ]
            }
        })
    });

    t.mockUrl('syncurl', {
        delay        : 10,
        responseText : JSON.stringify({
            success : true,
            events  : {
                rows : [
                    { id : 11 }
                ]
            }
        })
    });

    t.mockUrl('syncfail', {
        delay        : 10,
        responseText : JSON.stringify({
            success : false,
            message : 'failure'
        })
    });

    t.mockUrl('loadrejected', {
        responseText  : JSON.stringify({ success : true }),
        delay         : 10,
        rejectPromise : true
    });

    // https://github.com/bryntum/support/issues/314
    t.it('Mask should show error message and hide after a delay if response is unsuccessful', async t => {
        scheduler = new Scheduler({
            appendTo    : document.body,
            startDate   : new Date(2018, 0, 30),
            endDate     : new Date(2018, 2, 2),
            crudManager : {
                autoLoad  : false,
                transport : {
                    sync : {
                        url : 'syncfail'
                    },
                    load : {
                        url : 'loadurl'
                    }
                }
            }
        });

        await scheduler.crudManager.load().catch(() => t.fail('should not fail'));

        await t.waitForProjectReady(scheduler);

        scheduler.resourceStore.first.name = 'foo';

        await scheduler.crudManager.sync().catch(() => t.pass('expected fail'));

        t.chain(
            { waitForSelector : '.b-mask .b-grid-load-failure', desc : 'Error message appeared' },
            { waitForSelectorNotFound : '.b-mask', desc : 'Sync mask disappeared' }
        );
    });

    // https://github.com/bryntum/support/issues/553
    t.it('Mask should show error message and hide after a delay if fetch() fails and rejects promise with an Error', t => {

        scheduler = new Scheduler({
            appendTo    : document.body,
            startDate   : new Date(2018, 0, 30),
            endDate     : new Date(2018, 2, 2),
            crudManager : {
                autoLoad  : false,
                transport : {
                    sync : {
                        url : 'syncurl'
                    },
                    load : {
                        url : 'loadrejected'
                    }
                }
            }
        });

        t.chain(
            async() => {
                try {
                    await scheduler.crudManager.load();
                    t.fail('load did not fail');
                }
                catch (e) {
                    t.pass('load failed as expected');
                }
            },
            { waitForSelector : '.b-mask .b-grid-load-failure', desc : 'Error message appeared' },
            { waitForSelectorNotFound : '.b-mask', desc : 'Sync mask disappeared' }
        );
    });

    t.it('loadMask is shown when loading is triggered on scheduler construction', async t => {
        t.chain(
            {
                waitForSelector : '.b-mask-content:contains(Loading)',
                desc            : 'loadMask showed up',
                trigger         : () => {
                    scheduler = new Scheduler({
                        appendTo    : document.body,
                        startDate   : new Date(2018, 0, 30),
                        endDate     : new Date(2018, 2, 2),
                        crudManager : {
                            autoLoad  : true,
                            transport : {
                                load : {
                                    url : 'loadurl'
                                }
                            }
                        },
                        loadMaskDefaults : {
                            showDelay : 0
                        }
                    });
                }
            },
            { waitForSelectorNotFound : '.b-mask-content:contains(Loading)', desc : 'loadMask disappeared' }
        );
    });

    t.it('loadMask is shown when loading is triggered after scheduler construction', t => {
        const async = t.beginAsync();

        scheduler = new Scheduler({
            appendTo    : document.body,
            startDate   : new Date(2018, 0, 30),
            endDate     : new Date(2018, 2, 2),
            crudManager : {
                autoLoad  : false,
                transport : {
                    sync : {
                        url : 'syncurl'
                    },
                    load : {
                        url : 'loadurl'
                    }
                }
            }
        });

        scheduler.crudManager.load();

        t.chain(
            { waitForSelector : '.b-mask-content:contains(Loading)', desc : 'loadMask showed up' },
            { waitForSelectorNotFound : '.b-mask-content:contains(Loading)', desc : 'loadMask disappeared' },
            () => t.endAsync(async)
        );
    });

    t.it('syncMask is shown when loading is triggered after scheduler construction', t => {
        const async = t.beginAsync();

        t.mockUrl('loadurl', {
            delay        : 10,
            responseText : JSON.stringify({
                success   : true,
                resources : {
                    rows : [
                        { id : 'a' }
                    ]
                },
                events : {
                    rows : [
                        {
                            id         : 1,
                            resourceId : 'a',
                            startDate  : '2018-02-01',
                            endDate    : '2018-03-01'
                        }
                    ]
                }
            })
        });

        t.mockUrl('syncurl', {
            delay        : 2000,
            responseText : JSON.stringify({
                success : true,
                events  : {
                    rows : [
                        { id : 11 }
                    ]
                }
            })
        });

        scheduler = new Scheduler({
            appendTo    : document.body,
            startDate   : new Date(2018, 0, 30),
            endDate     : new Date(2018, 2, 2),
            crudManager : {
                autoLoad  : false,
                transport : {
                    sync : {
                        url : 'syncurl'
                    },
                    load : {
                        url : 'loadurl'
                    }
                }
            }
        });

        t.chain(
            () => scheduler.crudManager.load(),

            { waitForProjectReady : scheduler },

            next => {
                scheduler.resourceStore.first.name = 'foo';
                scheduler.crudManager.sync();
                next();
            },
            { waitForSelector : '.b-mask-content:contains(Saving)', desc : 'syncMask showed up' },
            { waitForSelectorNotFound : '.b-mask-content:contains(Saving)', desc : 'syncMask disappeared' },
            () => t.endAsync(async)
        );
    });

    t.it('loadMask and syncMask are shown when showDelay is specified', t => {
        const async = t.beginAsync();

        t.mockUrl('loadurl', {
            delay        : 2000,
            responseText : JSON.stringify({
                success   : true,
                resources : {
                    rows : [
                        { id : 'a' }
                    ]
                },
                events : {
                    rows : [
                        {
                            id         : 1,
                            resourceId : 'a',
                            startDate  : '2018-02-01',
                            endDate    : '2018-03-01'
                        }
                    ]
                }
            })
        });

        t.mockUrl('syncurl', {
            delay        : 2000,
            responseText : JSON.stringify({
                success : true,
                events  : {
                    rows : [
                        { id : 11 }
                    ]
                }
            })
        });

        scheduler = new Scheduler({
            appendTo    : document.body,
            startDate   : new Date(2018, 0, 30),
            endDate     : new Date(2018, 2, 2),
            crudManager : {
                autoLoad  : false,
                autoSync  : false,
                transport : {
                    sync : { url : 'syncurl' },
                    load : { url : 'loadurl' }
                }
            },
            loadMask : {
                showDelay : 100
            },
            syncMask : {
                showDelay : 100
            }
        });

        t.chain(
            next => {
                scheduler.crudManager.load();
                next();
            },
            { waitForSelector : '.b-mask-content:contains(Loading)', desc : 'loadMask showed up' },
            { waitForSelectorNotFound : '.b-mask-content:contains(Loading)', desc : 'loadMask disappeared' },

            { waitForProjectReady : scheduler },

            next => {
                scheduler.resourceStore.first.name = 'foo';
                scheduler.crudManager.sync();
                next();
            },
            { waitForSelector : '.b-mask-content:contains(Saving)', desc : 'syncMask showed up' },
            { waitForSelectorNotFound : '.b-mask-content:contains(Saving)', desc : 'syncMask disappeared' },
            () => t.endAsync(async)
        );
    });

    t.it('Should hide "No records to display" when loading and show when loaded empty data', t => {
        const
            async = t.beginAsync();

        t.mockUrl('loadurl', {
            delay        : 10,
            responseText : JSON.stringify({
                success   : true,
                resources : {
                    rows : []
                },
                events : {
                    rows : []
                }
            })
        });

        scheduler = new Scheduler({
            appendTo    : document.body,
            startDate   : new Date(2018, 0, 30),
            endDate     : new Date(2018, 2, 2),
            crudManager : {
                autoLoad  : false,
                transport : {
                    load : {
                        url : 'loadurl'
                    },
                    sync : {
                        url : 'syncurl'
                    }
                }
            }
        });

        t.selectorExists('.b-grid-empty', 'Scheduler has the b-grid-empty class before load');

        scheduler.crudManager.load()
            .catch(() => t.fail('should not fail'))
            .then(() => t.pass('crud manager got loaded'));

        t.chain(
            { waitForSelector : '.b-mask-content:contains(Loading)', desc : 'loadMask showed up' },
            async() => t.selectorNotExists('.b-grid-empty', 'Scheduler has no b-grid-empty class when loading'),
            { waitForSelectorNotFound : '.b-mask-content:contains(Loading)', desc : 'loadMask is hidden' },
            { waitForSelector : '.b-grid-empty', desc : 'Scheduler has b-grid-empty after loaded empty rows' },
            () => t.endAsync(async)
        );
    });

});
