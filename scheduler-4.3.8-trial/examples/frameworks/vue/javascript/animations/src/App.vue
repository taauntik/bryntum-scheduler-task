<!-- Application -->
<template>
    <div id="container">
        <bryntum-demo-header
            link="../../../../../#example-frameworks-vue-javascript-animations"
        />
        <div class="demo-toolbar">
            <bryntum-slider
                text="Animation duration"
                v-bind="sliderConfig"
                @change="sliderChangeHandler"
            ></bryntum-slider>
            <bryntum-button text="Max 1hr" @click="maxHandler"></bryntum-button>
            <bryntum-button text="Move to after lunch" @click="moveHandler"></bryntum-button>
            <bryntum-button text="Random update" @click="randomHandler"></bryntum-button>
        </div>

        <bryntum-scheduler ref="scheduler" v-bind="schedulerConfig" />
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumButton,
    BryntumSlider
} from '@bryntum/scheduler-vue';
import { DateHelper } from '@bryntum/scheduler';
import { schedulerConfig, sliderConfig } from './AppConfig';

export default {
    name: 'App',
    components: {
        BryntumDemoHeader,
        BryntumScheduler,
        BryntumButton,
        BryntumSlider
    },

    data() {
        return { schedulerConfig, sliderConfig, scheduler: null };
    },

    mounted() {
        // save bryntum scheduler instance for easier access in methods
        this.$data.scheduler = this.$refs.scheduler.instance;

        // set the default animation duration
        this.changeDuration(600);
    },

    methods: {
        sliderChangeHandler({ value }) {
            this.changeDuration(value);
        },

        // set time of all Meetings to max 1 hour
        maxHandler() {
            const {
                scheduler: { eventStore }
            } = this;
            eventStore
                .query(task => task.eventType === 'Meeting')
                .forEach(task => (task.duration = Math.min(task.duration, 1)));
        },

        // moves events of type "Meeting" after lunch
        moveHandler() {
            const {
                scheduler,
                scheduler: { eventStore }
            } = this;
            if (scheduler.features) {
                const lunchFinishTime = scheduler.features.timeRanges.store.getById('lunch')
                    .endDate;
                eventStore
                    .query(task => task.eventType === 'Meeting')
                    .forEach(
                        task =>
                            (task.startDate = DateHelper.max(task.startDate, lunchFinishTime))
                    );
            }
        },

        // randomizes the events
        randomHandler() {
            const {
                scheduler,
                scheduler: { eventStore }
            } = this;
            const indices = [];
            const nbrToAnimate = Math.min(eventStore.count, 4);

            // Grab a bunch of random events to change
            while (indices.length < nbrToAnimate) {
                const index = Math.floor(Math.random() * eventStore.count);

                if (!indices.includes(index)) {
                    indices.push(index);
                }
            }
            indices.forEach(index => {
                const ev = eventStore.getAt(index);

                if (ev && ev.resource) {
                    ev.beginBatch();
                    ev.resourceId =
                        ((scheduler.resourceStore.indexOf(ev.resource) + 2) % 8) + 1;
                    ev.setStartDate(
                        DateHelper.add(
                            ev.startDate,
                            ev.startDate.getHours() % 2 ? 1 : -1,
                            'hour'
                        ),
                        true
                    );
                    ev.endBatch();
                }
            });
        },

        // handle animation duration change
        changeDuration(value) {
            const scheduler = this.$refs.scheduler.instance;
            let styleNode = this.styleNode;

            if (!styleNode) {
                styleNode = this.styleNode = document.createElement('style');
                document.head.appendChild(styleNode);
            }

            scheduler.transitionDuration = value;
            styleNode.innerHTML = `.b-grid-row,.b-sch-event-wrap { transition-duration: ${value /
                1000}s !important; }`;
        }
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
