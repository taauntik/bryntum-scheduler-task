import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

// this instance handles buttons and slider events
export const eventBus = new Vue();

new Vue({
    render: h => h(App),
}).$mount('#app');
