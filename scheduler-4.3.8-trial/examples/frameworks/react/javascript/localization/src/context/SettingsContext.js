/**
 * Settings context
 */
import React from 'react';

const settingsContext = React.createContext({
    locale    : 'en',
    setLocale : () => {}
});

export default settingsContext;
