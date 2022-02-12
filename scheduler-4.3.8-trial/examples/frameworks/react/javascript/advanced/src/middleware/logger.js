/**
 * Logger middleware. You don't need it in production.
 */
const logger = store => {
    return next => {
        return action => {
            console.log('[Logger]  Dispatching: ', action);
            const result = next(action);
            console.log('[Logger] New state is:', store.getState());

            return result;
        };
    };
};

export default logger;
