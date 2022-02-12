/**
 * i18next options, functions, initializations
 *
 * Platform and Environment providers/directives/pipes
 */
import {
    I18NextModule,
    defaultInterpolationFormat,
    ITranslationService,
    I18NextLoadResult,
    I18NEXT_SERVICE
} from 'angular-i18next';

import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import * as i18nextXHRBackend from 'i18next-xhr-backend';
import * as i18nextLanguageDetector from 'i18next-browser-languagedetector';

// options
export const i18nextOptions = {
    whitelist         : ['en', 'se', 'ru'],
    fallbackLng       : 'en',
    returnEmptyString : false,
    // debug: true,

    ns : [
        'translation',
        'error'
    ],

    interpolation : {
        format : I18NextModule.interpolationFormat(defaultInterpolationFormat)
    },

    // backend plugin options
    backend : {
        loadPath : function(lang: string, ns: string) {
            return 'locales/{{lng}}.{{ns}}.json';
        }
    },

    // lang detection plugin options
    detection : {
        // order and from where user language should be detected
        order : ['cookie'],

        // keys or params to lookup language from
        lookupCookie : 'lang',

        // cache user language on
        caches : ['cookie'],

        // optional expire and domain for set cookie
        cookieMinutes : 10080 // 7 days
        // cookieDomain: 'localhost'
    }
};

export function appInit(i18next: ITranslationService) {
    return () => {
        const promise: Promise<I18NextLoadResult> = i18next
            .use(i18nextXHRBackend)
            .use(i18nextLanguageDetector)
            .init(i18nextOptions);
        return promise;
    };
}

export function localeIdFactory(i18next: ITranslationService)  {
    return i18next.language;
}

export const I18N_PROVIDERS = [
    {
        provide    : APP_INITIALIZER,
        useFactory : appInit,
        deps       : [I18NEXT_SERVICE],
        multi      : true
    },
    {
        provide    : LOCALE_ID,
        deps       : [I18NEXT_SERVICE],
        useFactory : localeIdFactory
    }
];


