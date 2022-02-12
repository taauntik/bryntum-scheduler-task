<!-- Application -->
<template>
    <div id="container">
        <bryntum-demo-header
            link="../../../../../#example-frameworks-vue-javascript-drag-between-schedulers"
        />

        <bryntum-scheduler
            ref="scheduler1"
            v-bind="scheduler1Config"
        />
        <bryntum-splitter />
        <bryntum-scheduler
            ref="scheduler2"
            v-bind="scheduler2Config"
        />
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumSplitter,
    BryntumDemoHeader
} from '@bryntum/scheduler-vue';
import { scheduler1Config, scheduler2Config } from './AppConfig';
export default {
    name: 'App',

    components: {
        BryntumDemoHeader,
        BryntumScheduler,
        BryntumSplitter
    },

    mounted() {
        // make schedulers partnered so that they scroll together
        this.$refs.scheduler2.instance.addPartner(this.$refs.scheduler1.instance);
    },

    data() {
        return {
            scheduler1Config,
            scheduler2Config
        };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
