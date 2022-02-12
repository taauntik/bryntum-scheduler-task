<!--
 * Header with title and buttons
-->
<template>
    <div>
        <div id="tools" class="demo-toolbar align-right">
            <ul class="nav nav-pills justify-content-end">
                <li class="nav-item"><router-link class="nav-link" active-class="active" to="/" exact>Home</router-link></li>
                <li class="nav-item"><router-link class="nav-link" active-class="active" to="/tasks">Tasks</router-link></li>
            </ul>
            <div class="spacer"></div>
            <styles-combo v-show="this.$route.path==='/'"/>
            <colors-combo v-show="this.$route.path==='/'"/>
        </div>
    </div>
</template>

<script>
    import ColorsCombo from './ColorsCombo.vue';
    import StylesCombo from './StylesCombo.vue';

    export default {
        name  : 'app-header',
        props : {
            link  : { type : String, default : '..' },
            title : { type : String, default : 'Example Header' }
        },
        components : {
            ColorsCombo,
            StylesCombo
        }
    } // exports the header components
</script>

<style lang="scss">
    .demo-header {
        display: flex;
        #title {
            flex: 1;
        }
    }

    #tools {
        .b-field {
            margin-left : 1em;
            input {
                padding: 0.7em;
            }
            label {
                margin-bottom : 0;
                margin-right  : 0.5em;
                padding-top: 0.2em;
            }
        }
    }

    .nav-item {
        margin-left : 0.5em;
        color : #a0a0a0;;
    }
    .nav-pills .nav-link {
        padding-top : 0.59rem;
        padding-bottom : 0.59rem;
        border-radius : 2px;
    }
    .nav-link.active {
        color : white;
    }

    .color-box {
        width: 1em;
        height: 1em;
        margin-right: .5em;
    }

    .style-list .b-list-item {
        height: 3em;

        .b-sch-event-wrap {
            height: 2em;
            width: calc(100% - 1.5em);
        }

        .b-sch-event:not(.b-sch-style-colored) {
            color : #fff !important;
        }
    }

</style>
