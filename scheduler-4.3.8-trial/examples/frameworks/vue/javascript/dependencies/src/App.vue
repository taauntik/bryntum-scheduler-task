<!--
/**
 * Application implementation
 */
 -->
<template>
    <div id="container">
        <bryntum-demo-header
            link="../../../../../#example-frameworks-vue-javascript-dependencies"
        />
        <bryntum-scheduler ref="scheduler" v-bind="schedulerConfig" />
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader
} from '@bryntum/scheduler-vue';
import { schedulerConfig } from './AppConfig';

export default {
    name: 'app',

    components: {
        BryntumDemoHeader,
        BryntumScheduler
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
