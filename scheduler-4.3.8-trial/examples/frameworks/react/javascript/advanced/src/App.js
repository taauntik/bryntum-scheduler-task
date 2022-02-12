/**
 * Main App script
 */
// libraries
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// styles
import './App.scss';

// locales
import './locales';
import { LocaleManager, Toast } from '@bryntum/scheduler/scheduler.umd';

// our stuff
import Scheduler from './components/Scheduler';
import Toolbar from './components/Toolbar';
import { BryntumDemoHeader, BryntumThemeCombo } from '@bryntum/scheduler-react';
import { useSelector } from 'react-redux';

const App = props => {
    const { t, i18n } = useTranslation();
    const locale = useSelector(state => state.locale.locale);

    // Handles locale changes
    useEffect(() => {
        const { language } = i18n;

        // Change language in i18next library
        if (locale !== language) {
            i18n.changeLanguage(locale);
        }

        // Translate document title
        document.title = t('title');

        // Change Bryntum Scheduler locale
        switch (locale) {
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
    }, [i18n, locale, t]);

    // error handler
    useEffect(() => {
        if (props.err) {
            Toast.show(t(props.err.message));
            props.clearError();
        }
    }, [props, props.err, t]);

    return (
        <>
            <BryntumDemoHeader
                href="../../../../../#example-frameworks-react-javascript-advanced"
                children={<BryntumThemeCombo />}
            />
            <Toolbar />
            <Scheduler />
        </>
    );
};

export default App;
