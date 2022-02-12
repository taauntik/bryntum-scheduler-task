/**
 * Application toolbar
 *
 * It is implemented as a functional component using React hooks that
 * were introduced in React 16.8.0. If you cannot upgrade to that or
 * later version of React then you must convert this component to class.
 */
// libraries
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uiActions } from '../store/uiSlice';
import { schedulerDataActions } from '../store/schedulerDataSlice';
import { localeActions } from '../store/localeSlice';

// our stuff (buttons)
import { BryntumButton, BryntumCombo } from '@bryntum/scheduler-react';
import { useTranslation } from 'react-i18next';

const Toolbar = props => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const locale = useSelector(state => state.locale.locale);

    return (
        <div className="demo-toolbar align-right">
            <BryntumCombo
                label={t('selectLanguage')}
                editable={false}
                value={locale}
                inputWidth="7em"
                store={[
                    { id: 'en', text: 'English' },
                    { id: 'se', text: 'Swedish' },
                    { id: 'ru', text: 'Russian' }
                ]}
                onChange={({ value }) => {
                    dispatch(localeActions.setLocale(value));
                }}
            />
            <BryntumButton
                icon="b-fa-sync"
                tooltip={t('reload')}
                onAction={() => {
                    dispatch(schedulerDataActions.toggleDataset());
                }}
            />
            <BryntumButton
                icon="b-icon-search-minus"
                tooltip={t('zoomOut')}
                onAction={() => {
                    dispatch(uiActions.zoom('Out'));
                }}
            ></BryntumButton>
            <BryntumButton
                icon="b-icon-search-plus"
                tooltip={t('zoomIn')}
                onAction={() => {
                    dispatch(uiActions.zoom('In'));
                }}
            ></BryntumButton>
        </div>
    );
};

export default Toolbar;
