<template>
    <div id="container">
        <bryntum-demo-header
            :title="$t('title')"
            link="../../../../../#example-frameworks-vue-javascript-localization"
        />
        <div class="demo-toolbar align-right">
            <locale-combo />
        </div>
        <bryntum-scheduler ref="scheduler" v-bind="schedulerConfig" />
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader
} from '@bryntum/scheduler-vue';
import { schedulerConfig } from './AppConfig.js';
import LocaleCombo from './components/LocaleCombo';

// import Bryntum locales
import './locales/index.js';

export default {
    name: 'App',

    components: {
        BryntumDemoHeader,
        BryntumScheduler,
        LocaleCombo
    },

    data() {
        return {
            schedulerConfig
        };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
