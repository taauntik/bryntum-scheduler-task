<!-- Application -->
<template>
    <div id="container">
        <bryntum-demo-header
            link="../../../../../#example-frameworks-vue-javascript-vue-renderer"
        />
        <bryntum-scheduler v-bind="schedulerConfig" />
    </div>
</template>

<script>
import {
    BryntumDemoHeader,
    BryntumScheduler
} from '@bryntum/scheduler-vue';
import { schedulerConfig } from './AppConfig';

export default {
    name: 'App',

    components: {
        BryntumScheduler,
        BryntumDemoHeader
    },

    data() {
        return { schedulerConfig };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
