StartTest(t => {
    //const scheduler = bryntum.query('scheduler');

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

    t.it('First tab', t => {
        // Check demo specific time axis customization

        t.selectorNotExists('[data-ref=custom1] .b-sch-header-timeaxis-cell:textEquals(7)', 'No header for 7');

        for (let i = 8; i < 22; i++) {
            t.selectorExists(`[data-ref=custom1] .b-sch-header-timeaxis-cell:textEquals(${i})`, 'Header for ' + i);
        }

        t.selectorNotExists('[data-ref=custom1] .b-sch-header-timeaxis-cell:textEquals(22)', 'No header for 22');
    });

    t.it('Second tab', t => {
        t.chain(
            { click : '.b-tabpanel-tab[data-index="1"]' },

            () => {
                const dayElements = Array.from(document.querySelectorAll('.sch-hdr-startend'));
                const getText = i => dayElements[i].innerText.replace(/\n/g, '');

                t.selectorCountIs('[data-ref=custom2] .b-sch-header-timeaxis-cell', 10, 'Correct header cell count');
                t.is(dayElements.length, 5, 'Correct day header count');
                t.is(getText(0), '816', 'Correct text in day header');
                t.is(getText(1), '816', 'Correct text in day header');
                t.is(getText(2), '816', 'Correct text in day header');
                t.is(getText(3), '816', 'Correct text in day header');
                t.is(getText(4), '1016', 'Correct text in day header');
            }
        );
    });

    t.it('Third tab', t => {
        t.chain(
            { click : '.b-tabpanel-tab[data-index="2"]' },

            () => {
                const texts = Array.from(document.querySelectorAll('[data-ref=filterable] .b-sch-header-row-2 .b-sch-header-timeaxis-cell')).map(el => el.innerText.trim());

                t.is(texts[0], '1', 'Correct sum for sunday');
                t.is(texts[1], '0', 'Correct sum for monday');
                t.is(texts[2], '0', 'Correct sum for tuesday');
                t.is(texts[3], '0', 'Correct sum for wednesday');
                t.is(texts[4], '0', 'Correct sum for thursday');
                t.is(texts[5], '1', 'Correct sum for friday');
                t.is(texts[6], '1', 'Correct sum for saturday');
            }
        );
    });

    t.it('Fourth tab', t => {
        t.chain(
            { click : '.b-tabpanel-tab[data-index="3"]' },

            () => {
                const texts = Array.from(document.querySelectorAll('[data-ref=filterable] .b-sch-header-row-2 .b-sch-header-timeaxis-cell')).map(el => el.innerText.trim());

                t.is(texts[0], '1', 'Correct sum for sunday');
                t.is(texts[1], '0', 'Correct sum for monday');
                t.is(texts[2], '0', 'Correct sum for tuesday');
                t.is(texts[3], '0', 'Correct sum for wednesday');
                t.is(texts[4], '0', 'Correct sum for thursday');
                t.is(texts[5], '1', 'Correct sum for friday');
                t.is(texts[6], '1', 'Correct sum for saturday');
            }
        );
    });
});
