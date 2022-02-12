/**
 * Scheduler Data slice. Handles only dataset (file) name
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // filename without extension in `public/data`
    dataset: 'data'
};

const schedulerDataSlice = createSlice({
    name: 'schedulerData',
    initialState,
    reducers: {
        toggleDataset: state => {
            // converted to immutable by redux toolkit
            state.dataset = state.dataset === 'data' ? 'data1' : 'data';
        }
    }
});

export const schedulerDataActions = schedulerDataSlice.actions;

const schedulerDataReducer = schedulerDataSlice.reducer;
export default schedulerDataReducer;
