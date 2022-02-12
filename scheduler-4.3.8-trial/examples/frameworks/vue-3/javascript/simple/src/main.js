import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

// remove this line to re-enable warnings
// and resolve all compatibility Vue warns
app.config.warnHandler = args => {
    console.log(args);
    return null;
};

app.mount('#container');
