/**
 * Used to trigger Scheduler zooming
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    zoomAction: null
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        zoom: (state, action) => {
            // Converts direction to zoomIn/zoomOut names
            const direction = action.payload;
            state.zoomAction = ['In', 'Out'].includes(direction) ? `zoom${direction}` : null;
        }
    }
});

export const uiActions = uiSlice.actions;

const uiReducer = uiSlice.reducer;
export default uiReducer;
