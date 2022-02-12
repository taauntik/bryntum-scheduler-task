/**
 * Configuration file for i18next
 */
// libraries
import i18next from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
    // load translation using xhr -> see /public/locales
    // learn more: https://github.com/i18next/i18next-xhr-backend
    .use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        fallbackLng : 'en',
        // debug: true,

        interpolation : {
            escapeValue : false, // not needed for react as it escapes by default
        },
        backend :{
            loadPath : 'locales/{{lng}}/{{ns}}.json'
        },
        // prevent loading en-US as the default locale
        load: 'languageOnly'
    }, () => {
        document.title = i18next.t('title');
    })
;

export default i18next;
