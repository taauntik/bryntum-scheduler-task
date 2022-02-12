/**
 * Popup Component
 */
import React from 'react';
import './Popup.scss';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDateTimePicker
} from '@material-ui/pickers';

class Popup extends React.Component {

    /**
     * Constructor (initializes state and binds handlers)
     * @param {Object} props
     */
    constructor(props) {
        super();

        // Extract values used in the editor and keep them in state
        const { eventRecord } = props;
        this.state = {
            name:'',
            startDate:null,
            endDate:null,
            eventType:'Meeting',
            location:'',
            resourceId:null
        };
        for (const key in this.state) {
            if(eventRecord[key]) {
                this.state[key] = eventRecord[key]
            }
        }

        // shortcuts to handlers
        this.dataChangedHandler = this.dataChangedHandler.bind(this);
        this.saveClickHandler = this.saveClickHandler.bind(this);
        this.startDateChangeHandler = this.startDateChangeHandler.bind(this);
        this.endDateChangeHandler = this.endDateChangeHandler.bind(this);

    }

    /**
     * Sets the changed value to state
     * @param {HTMLElement} target The input that changed
     */
    dataChangedHandler({ target }) {
        this.setState(prevState => {
            return {
                ...prevState,
                [target.name] : target.value
            }
        })
    }

    /**
     * Updates state with startDate
     * @param {Date} startDate
     */
    startDateChangeHandler(startDate) {
        this.setState(prevState => {
            return {
                ...prevState,
                startDate : startDate
            }
        })
    }

    /**
     * Updates state with endDate
     * @param {Date} endDate
     */
    endDateChangeHandler(endDate) {
        this.setState(prevState => {
            return {
                ...prevState,
                endDate : endDate
            }
        })
    }

    /**
     * Saves the modified form data to the record being edited
     */
    saveClickHandler() {
        const eventRecord = this.props.eventRecord;

        // We need to reset this flag to tell scheduler that this is a real event
        eventRecord.isCreating = false;

        // Update the eventRecord using the default setters
        eventRecord.beginBatch();
        for (const key in this.state) {
            eventRecord[key] = this.state[key];
        }

        // Add the eventRecord to the eventStore if it is not already there
        if (!eventRecord.eventStore) {
            this.props.eventStore.add(eventRecord);
        }
        eventRecord.endBatch();

        this.props.closePopup();
    }

    /**
     * @return The markup to render
     */
    render() {

        const resourceItems = this.props.resourceStore.map(resource => (
            <MenuItem key={resource.id} value={resource.id}>{resource.name}</MenuItem>
        ));

        return (
            <div className='popup-mask'>
                <div className='popup'>
                    <header>{this.state.name}&nbsp;</header>
                    <article>
                        <TextField
                            name="name"
                            label="Event name"
                            onChange={this.dataChangedHandler}
                            value={this.state.name}
                            fullWidth
                            style={{ marginBottom : 10 }}
                        />
                        <FormControl style={{ marginBottom : 10, width : '100%' }}>
                            <InputLabel>Staff</InputLabel>
                            <Select
                                name="resourceId"
                                onChange={this.dataChangedHandler}
                                value={this.state.resourceId}
                            >
                                {resourceItems}
                            </Select>
                        </FormControl>
                        <TextField
                            name="location"
                            label="Event location"
                            onChange={this.dataChangedHandler}
                            value={this.state.location}
                            // fullWidth
                            style={{ marginBottom : 10, width : '49%', marginRight : 5 }}
                        />
                        <FormControl style={{ marginBottom : 10, width : '49%', marginLeft : 5 }}>
                            <InputLabel>Event type</InputLabel>
                            <Select
                                name="eventType"
                                onChange={this.dataChangedHandler}
                                value={this.state.eventType}
                            >
                                <MenuItem value="Meeting">Meeting</MenuItem>
                                <MenuItem value="Appointment">Appointment</MenuItem>
                            </Select>
                        </FormControl>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDateTimePicker
                                name="startDate"
                                label="Start"
                                ampm={false}
                                format="yyyy-MM-dd HH:mm"
                                style={{ width : '49%', marginRight : 5 }}
                                value={this.state.startDate}
                                onChange={this.startDateChangeHandler}
                            ></KeyboardDateTimePicker>
                            <KeyboardDateTimePicker
                                name="endDate"
                                label="End"
                                ampm={false}
                                format="yyyy-MM-dd HH:mm"
                                style={{ width : '49%', marginLeft : 5 }}
                                value={this.state.endDate}
                                onChange={this.endDateChangeHandler}
                            ></KeyboardDateTimePicker>
                        </MuiPickersUtilsProvider>
                    </article>
                    <footer>
                        <Button variant="contained" color="secondary" onClick={this.props.closePopup}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={this.saveClickHandler}>Save</Button>
                    </footer>
                </div>
            </div>
        );
    }
}

export default Popup;

