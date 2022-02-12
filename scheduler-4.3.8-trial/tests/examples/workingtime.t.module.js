StartTest(t => {
    let scheduler;

    t.it('sanity', t => {
        t.chain(
            { waitForSelector : '.b-sch-foreground-canvas' },

            (next, el) => {
                scheduler = bryntum.fromElement(el[0], 'scheduler');
                next();
            },

            () => t.checkGridSanity(scheduler)
        );
    });

    // https://github.com/bryntum/support/issues/639
    t.it('Should update working time', t => {
        t.chain(
            async() => {
                t.isDeeply(scheduler.workingTime, {
                    fromHour : 8,
                    toHour   : 17,
                    fromDay  : 1,
                    toDay    : 6
                }, 'Working time is correct');
            },

            { click : '[data-ref="workingTimeBtn"]' },

            async() => {
                t.notOk(scheduler.workingTime, 'Working time is not set');
            },

            { click : '[data-ref="workingTimeBtn"]' },

            async() => {
                t.isDeeply(scheduler.workingTime, {
                    fromHour : 8,
                    toHour   : 17,
                    fromDay  : 1,
                    toDay    : 6
                }, 'Working time is correct');
            }
        );
    });

    // Code editor not supported with umd bundle
    if (t.getMode() !== 'umd' && t.browser.chrome) {
        t.it('Code editor', t => {
            t.chain(
                { click : '[data-ref=codeButton]' },

                { waitForSelector : 'pre:contains(refreshWorkingTime)', desc : 'JS loaded' },

                { click : () => window.shared.codeEditor.widgetMap.autoApply.element },

                next => {
                    document.querySelector('code[data-owner-cmp]').innerHTML = '';
                    next();
                },

                { click : () => window.shared.codeEditor.widgetMap.applyButton.element },

                { waitForSelectorNotFound : '[data-reference=outer]', desc : 'Old elements removed' }
            );
        });
    }
});
