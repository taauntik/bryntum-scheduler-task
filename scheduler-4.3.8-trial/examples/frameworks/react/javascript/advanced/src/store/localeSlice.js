/**
 * Locale state slice
 */
import { createSlice } from '@reduxjs/toolkit';

let savedLocale = localStorage.getItem('i18nextLng');
savedLocale = !savedLocale || savedLocale === 'en-US' ? 'en' : savedLocale;

const initialState = {
    locale: savedLocale
};

const localeSlice = createSlice({
    name: 'locale',
    initialState,
    reducers: {
        setLocale: (state, action) => {
            // converted to immutable by redux toolkit
            state.locale = action.payload;

            localStorage.setItem('i18nextLng', action.payload);
        }
    }
});

export const localeActions = localeSlice.actions;

const localeReducer = localeSlice.reducer;
export default localeReducer;
