/**
 * Select language component
 */
// libraries
import React, { useRef, useEffect } from 'react';
import { WidgetHelper } from '@bryntum/scheduler/scheduler.umd';
import { useTranslation } from 'react-i18next';

import SettingsContext from '../context/SettingsContext.js';

const LocaleCombo = props => {

    const
        elRef = useRef(),
        inputRef = useRef(),
        { t, i18n } = useTranslation();

    // this will hold SettingContext function setLocale eventually
    let changeLocale = null;

    const input = inputRef.current = inputRef.current || WidgetHelper.createWidget({
        type       : 'combo',
        label      : 'Select Language:',
        cls        : 'locale-combo b-bright',
        inputWidth : '7em',
        editable   : false,
        onChange   : ({ value : locale }) => {
            changeLocale(locale);
        },
        store    : [
            { id : 'en', text : 'English' },
            { id : 'se', text : 'Swedish' },
            { id : 'ru', text : 'Russian' },
        ]
    });

    // initial combo rendering
    useEffect(() => {
        input.insertFirst = props.container || elRef.current;
        input.render();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // update label when language changes
    useEffect(() => {
        input.labelElement.innerText = t('selectLanguage') + ':';

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [i18n.language]);

    return (
        <SettingsContext.Consumer>
            {context => {
                // save the locale setter
                changeLocale = changeLocale || context.setLocale;

                // silently set the combo initial value
                input.suspendEvents();
                input.value = context.locale;
                input.resumeEvents();

                return (
                    props.container ? null : <div ref={elRef}></div>
                );
            }}
        </SettingsContext.Consumer>
    );

};

export default LocaleCombo;
