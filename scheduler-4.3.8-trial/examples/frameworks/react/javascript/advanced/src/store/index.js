/**
 * Uses Redux Toolkit to combine store from various slices
 */
import { configureStore } from '@reduxjs/toolkit';

// Import slices and apis
import uiReducer from './uiSlice';
import localeReducer from './localeSlice';
import schedulerDataReducer from './schedulerDataSlice';
import { dataApi } from '../services/data';

import logger from '../middleware/logger';

const store = configureStore({
    reducer: {
        ui: uiReducer,
        locale: localeReducer,
        schedulerData: schedulerDataReducer,

        // dataApi is responsible for fetching data from the server
        [dataApi.reducerPath]: dataApi.reducer
    },
    // Middleware from React Toolkit Query - handles asynchronous server requests
    // Logger is for demo purposes only, not needed for production
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(dataApi.middleware).concat(logger)
});

export default store;
