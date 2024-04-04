import { LitElement, html, css } from 'lit';

class CalendarComponent extends LitElement {

    static styles = css`
        :host {
            display: block;
            max-width: 350px;
            margin: 0 auto;h
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
        }
        .calendar-header button {
            background-color: #0078d7;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .calendar-header button:hover {
            background-color: #0056b3;
        }
        .weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            padding: 5px 0;
        }
        .weekday {
            font-weight: bold;
        }
        .calendar {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            grid-gap: 5px;
            text-align: center;
        }
        .day {
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 5px;
            position: relative; /* Needed to position the popup absolutely within the day */
        }
        .events-popup {
            display: none;
            position: absolute;
            left: 100%; /* Adjust as necessary to position the popup */
            top: 0;
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            z-index: 2;
            white-space: nowrap; /* Prevents the text from wrapping */
            border-radius: 5px;
            font-size: 2em;
        }
        .day:hover .events-popup {
            display: block; /* Show the popup on hover */
        }
        .day.few-events { /* 0-1 events */
            background-color: green;
        }
        .day.some-events { /* 2-3 events */
            background-color: yellow;
        }
        .day.many-events { /* 4+ events */
            background-color: red;
        }
        .day.today {
            background-color: #0078d7;
            color: white;
            font-weight: bold;
        }
        .empty {
            background-color: transparent;
        }
    `;

    static get properties() {
        return {
            currentDate: { type: Object },
            primaryColor: { type: String },
            accentColor: { type: String }
        };
    }
    
    constructor() {
        super();
        this.currentDate = new Date(); // Default to current date
        this.primaryColor = '#0078d7'; // Default primary color
        this.accentColor = '#ffeded'; // Default accent color for events
        this.events = []; // Initialize the events array to ensure it's never undefined
    }    

    render() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonthName = monthNames[this.currentDate.getMonth()];
        const currentYear = this.currentDate.getFullYear();

        return html`
            <div class="calendar-header">
                <slot name="header-start"></slot>
                <button @click="${this.prevMonth}">&#9664;</button>
                <span>${currentMonthName} ${currentYear}</span>
                <button @click="${this.nextMonth}">&#9654;</button>
                <slot name="header-end"></slot>
            </div>
            <!-- rest of the template -->
            <!--
            <div class="weekdays">
                ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => html`<div class="weekday">${day}</div>`)}
            </div>
            --->
            <div class="calendar">
                ${this.generateCalendarDays()}
            </div>
        `;
    }

    generateCalendarDays() {
        const days = [];
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
        const numOfDays = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
        const today = new Date().getDate();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
    
        for (let i = 0; i < firstDay; i++) {
            days.push(html`<div class="day empty"></div>`);
        }
    
        for (let day = 1; day <= numOfDays; day++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dateString = date.toISOString().slice(0, 10);
            let eventsToday = this.events.filter(event => event.date === dateString);
            // Sort events by time
            eventsToday = eventsToday.sort((a, b) => {
                const timeA = a.time ? a.time.split(':').map(Number) : [0, 0];
                const timeB = b.time ? b.time.split(':').map(Number) : [0, 0];
                return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
            });
            
            const eventCount = eventsToday.length;
            const eventClass = eventCount <= 1 ? 'few-events' : eventCount <= 3 ? 'some-events' : 'many-events';
            const isToday = day === today && this.currentDate.getMonth() === currentMonth && this.currentDate.getFullYear() === currentYear;
    
            days.push(html`
                <div class="day ${isToday ? 'today' : ''} ${eventClass}" @click="${() => this.showEventInput(date)}">
                    <span class="date-number">${day}</span>
                    <div class="events-popup">
                        ${eventsToday.map((event) => html`
                            <div class="event" @click="${(e) => this.deleteEvent(e, event, dateString)}">
                                ${event.time} - ${event.name}
                                <span class="delete-event">&#x274C;</span>
                            </div>`)}
                    </div>
                </div>`);
        }
    
        return days;
    }

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.dispatchEvent(new CustomEvent('month-changed', {detail: {currentDate: this.currentDate}}))
        this.requestUpdate();
    }
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.dispatchEvent(new CustomEvent('month-changed', {detail: {currentDate: this.currentDate}}))
        this.requestUpdate();
    }

    showEventInput(date) {
        const eventName = prompt('Enter event name:');
        if (eventName) {
            let eventTime = prompt('Enter event time (HH:MM):');
            if (eventTime) {
                const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
                if (!timePattern.test(eventTime)) {
                    eventTime = '00:00';  // Default time if input is invalid
                    alert('Invalid time format, setting default time to 00:00.');
                }
                this.addEvent(date, eventName, eventTime);
            } else {
                console.log('No time entered, event not added.');
            }
        }
    }
    
    addEvent(date, eventName, eventTime) {
        this.events.push({ name: eventName, time: eventTime, date: date.toISOString().slice(0, 10) });
        this.requestUpdate();
    }

    deleteEvent(e, event) {
        e.stopPropagation();
        this.events = this.events.filter(ev => ev !== event);
        this.requestUpdate();
    }
    
}

customElements.define('calendar-component2', CalendarComponent);
