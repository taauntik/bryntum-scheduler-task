<!-- Application -->
<template>
    <v-app>
        <bryntum-demo-header
            link="../../../../../#example-frameworks-vue-javascript-custom-event-editor"
        />
        <bryntum-scheduler
            ref="scheduler"
            v-bind="schedulerConfig"
            :listeners="listeners"
        />
        <event-editor
            v-model="showEditor"
            :eventRecord="eventRecord"
            :eventStore="eventStore"
            :resourceId="resourceId"
            @close="onCloseEditor"
        />
    </v-app>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader
} from '@bryntum/scheduler-vue';
import { schedulerConfig } from './AppConfig';
import EventEditor from './components/EventEditor.vue';

export default {
    name: 'App',

    components: {
        BryntumDemoHeader,
        BryntumScheduler,
        EventEditor
    },

    data() {
        return {
            schedulerConfig,
            showEditor  : false,
            eventRecord : null,
            eventStore  : null,
            resourceId  : null,
            listeners   : {
                beforeEventEdit : this.beforeEventEditHandler
            }
        };
    },

    methods: {
        beforeEventEditHandler(event) {
            this.openEditor(event);
            return false;
        },

        openEditor({ source, resourceRecord, eventRecord }) {
            Object.assign(this, {
                eventStore: source.eventStore,
                resourceId: resourceRecord.id,
                eventRecord: eventRecord,
                showEditor: true
            });
        },

        onCloseEditor() {
            const scheduler = this.$refs.scheduler.instance;
            if (scheduler) {
                scheduler.refresh();
            }
        }
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
