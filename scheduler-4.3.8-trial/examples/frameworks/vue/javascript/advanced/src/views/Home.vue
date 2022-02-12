<!--
 * Home component
 -->

<template>
    <div class="home">
        <bryntum-scheduler
            ref="scheduler"
            v-bind="schedulerConfig"
        />
    </div>
</template>

<script>
    // @ is an alias to /src
    import { BryntumScheduler } from '@bryntum/scheduler-vue';
    import { schedulerConfig } from '@/AppConfig';

    // export home view
    export default {
        name: 'home',
        data() {
            return {
                schedulerConfig,
                storedOriginalColors : false,
                storedOriginalStyles : false
            }
        },
        components: {
            BryntumScheduler
        },

        mounted() {
            this.$store.subscribe(this.handleMutation)
        },
        methods : {
            handleMutation(mutation) {
                this[mutation.type](mutation.payload);
            },

            setEventColor(color) {
                const eventStore = this.$refs.scheduler.instance.eventStore;

                eventStore.forEach(eventRecord => {
                    if (!this.storedOriginalColors) {
                        eventRecord.originalColor = eventRecord.eventColor;
                    }

                    if (color === 'mixed') {
                        eventRecord.eventColor = eventRecord.originalColor;
                    }
                    else {
                        eventRecord.eventColor = color;
                    }
                });

                this.storedOriginalColors = true;

            },

            setEventStyle(style) {
                const eventStore = this.$refs.scheduler.instance.eventStore;

                eventStore.forEach(eventRecord => {
                    if (!this.storedOriginalStyles) {
                        eventRecord.originalStyle = eventRecord.eventStyle;
                    }

                    if (style === 'mixed') {
                        eventRecord.eventStyle = eventRecord.originalStyle;
                    }
                    else {
                        eventRecord.eventStyle = style;
                    }
                });

                this.storedOriginalStyles = true;

            },
        }
    }
</script>
