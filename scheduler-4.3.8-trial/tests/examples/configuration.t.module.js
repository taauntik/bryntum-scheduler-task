StartTest(t => {
    const
        scheduler = bryntum.query('scheduler'),
        combo     = scheduler.widgetMap.presetCombo;

    t.it('sanity', t => {
        t.chain(
            { waitForSelector : '.b-sch-foreground-canvas' },

            () => t.checkGridSanity(scheduler)
        );
    });

    t.it('Should not crash when clicking hint', t => {
        t.click('.b-hint').then(() => t.pass('Did not crash'));
    });

    t.it('Event editor should work', t => {
        const eventEdit = scheduler.features.eventEdit,
            chain = [],
            addStep = event => {
                chain.push(
                    next => {
                        eventEdit.editEvent(event);
                        next();
                    },

                    { waitForElementVisible : '.b-eventeditor' },

                    // The min/max checking must not invalidate
                    // valid field values.
                    next => {
                        t.selectorNotExists('.b-invalid');
                        next();
                    },

                    { type : '[ESC]' }
                );
            };

        scheduler.eventStore.forEach(addStep);

        t.chain(chain);
    });

    t.it('Preset combo works', t => {
        if (!combo) {
            t.exit('Preset combo not found  ');
        }

        t.ok(combo.isVisible, 'Combo is visible');
        t.is(combo.store.count, 12, 'Combo has correct number of items');

        t.chain(
            // Collect steps for each item
            combo.store.map((rec, index) => [
                { click : '[data-ref=presetCombo]', desc : `Combo ${index + 1} clicked` },

                {
                    waitForEvent : [scheduler, 'presetchange'],
                    trigger      : { click : `.b-list-item[data-index="${index}"][data-id="${rec.id}"]` }
                },

                next => {
                    // https://github.com/bryntum/support/issues/2121
                    // Going from text being wrapped->unwrapped or vice versa fooled DomSync.
                    // Text was left behind in cells from previous rendering.
                    // All cell text is wrapped now.
                    Array.from(document.querySelectorAll('.b-sch-header-row.b-lowest .b-sch-header-timeaxis-cell')).forEach(cell => {
                        t.isLessOrEqual(cell.scrollWidth, scheduler.tickSize);
                    });

                    t.is(combo.value, rec.id);
                    next();
                }
            ])
        );
    });

    t.it('Should not be affected by XSS injection', async t => {
        t.injectXSS(scheduler);
        t.pass('Ok');
    });

});
