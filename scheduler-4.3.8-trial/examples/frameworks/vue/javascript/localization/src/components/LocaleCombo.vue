<!-- Locale combo -->
<template>
    <div></div>
</template>

<script>
import { Combo, LocaleManager } from '@bryntum/scheduler';

export default {
    name: 'locale-combo',
    mounted() {
        const value = (localStorage && localStorage.i18nextLng) || 'en';
        const config = {
                label: 'Select Language',
                width: 240,
                labelWidth: 120,
                height: '2.7em',
                editable: false,
                onChange: this.onLocaleChange,
                store: [
                    { id: 'en', text: 'English' },
                    { id: 'se', text: 'Swedish' },
                    { id: 'ru', text: 'Russian' }
                ],
                adopt: this.$el
            },
            i18next = this.$i18n.i18next;
        const combo = (this.combo = new Combo(config));
        combo.value = value;

        this.onLocaleChange({ value: combo.value });

        i18next.on('languageChanged', () => {
            document.title = i18next.t('title');
            combo.label = i18next.t('selectLanguage');
        });
    },

    methods: {
        onLocaleChange({ value: lng }) {
            const lang = 'en-US' === lng ? 'en' : lng;

            this.applySchedulerLocale(lang);
            this.$i18n.i18next.changeLanguage(lang);
            this.localValue = lang;
        },

        // applies scheduler locale
        applySchedulerLocale(lng) {
            let locale = lng;
            switch (lng) {
                case 'se':
                    locale = 'SvSE';
                    break;

                case 'ru':
                    locale = 'Ru';
                    break;

                default:
                    locale = 'En';
                    break;
            }
            LocaleManager.locale = locale;
        }
    }
};
</script>
