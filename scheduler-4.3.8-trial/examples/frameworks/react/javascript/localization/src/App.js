/**
 * Main App startup file
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// our stuff
import Main from './containers/Main.js';
import SettingsContext from './context/SettingsContext.js';

// styles
import './App.scss';

// locales
import './locales';
import { LocaleManager } from '@bryntum/scheduler/scheduler.umd';

const App = props => {

    // We maintain top-level locale state here.
    // The state is propagated to global context SettingsContext
    const
        { t, i18n } = useTranslation(),
        [locale, setLocale] = useState(i18n.language);

    /**
     * @param {String} locale Locale to set
     *
     * Sets state and changes language. The function is passed to the
     * global SettingsContext so that it can be called from any even
     * deeply nested components that are consumers of SettingsContext.
     */
    const changeLocale = locale => {
        // set our state
        setLocale(locale);

        // change locale in i18next
        i18n.changeLanguage(locale);

        // translate document title
        document.title = t('title');

        // change the scheduler locale
        applySchedulerLocale(locale);
    };

    /**
     *
     * @param {String} schedulerLocale
     * Applies scheduler locale. Called always when
     * locale changes by SettingContext setLocale
     */
    const applySchedulerLocale = schedulerLocale => {
        if(schedulerLocale === 'en-US') {
            changeLocale('en');
            return;
        }
        switch (schedulerLocale) {
            case 'se':
                LocaleManager.applyLocale('SvSE');
                break;

            case 'ru':
                LocaleManager.applyLocale('Ru');
                break;

            default:
                LocaleManager.applyLocale('En');
                break;
        }
    };

    // set the translated document title as soon as we have the locale
    document.title = t('title');

    // set scheduler locale at startup
    applySchedulerLocale(locale);

    return (
        <SettingsContext.Provider value={{ locale : locale, setLocale : changeLocale }}>
            <Main/>
        </SettingsContext.Provider>
    );

};

export default App;
