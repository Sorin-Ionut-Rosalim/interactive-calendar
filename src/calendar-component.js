import { LitElement, html, css } from 'lit';

class CalendarComponent extends LitElement {
    static styles = css`
        :host {
            display: block;
            max-width: 350px;
            margin: 0 auto;
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
        }
        .day.today {
            background-color: #0078d7;
            color: white;
            font-weight: bold;
        }
        .empty {
            background-color: transparent;
        }
        .event {
            background-color: white;
            border-radius: 5px;
            padding: 2px;
            margin-top: 2px;
            font-size: 0.8em;
            color: black;
        }
    `;

    constructor() {
        super();
        this.currentDate = new Date();

        this.events = [
            { name: "Team Meeting", date: new Date().toISOString().slice(0, 10) } // Example event
        ];
    }

    render() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonthName = monthNames[this.currentDate.getMonth()];
        const currentYear = this.currentDate.getFullYear();

        return html`
            <div class="calendar-header">
                <button @click="${this.prevMonth}">&#9664;</button>
                <span>${currentMonthName} ${currentYear}</span>
                <button @click="${this.nextMonth}">&#9654;</button>
            </div>
            <div class="weekdays">
                ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => html`<div class="weekday">${day}</div>`)}
            </div>
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
            const isToday = day === today && this.currentDate.getMonth() === currentMonth && this.currentDate.getFullYear() === currentYear;
            const eventsToday = this.events.filter(event => event.date === dateString);
    
            days.push(html`
                <div class="day ${isToday ? 'today' : ''}" @click="${() => this.showEventInput(date)}">
                    <span class="date-number">${day}</span>
                    <div class="events">
                        ${eventsToday.map(event => html`
                            <div class="event" @click="${(e) => this.deleteEvent(e, event)}">
                                ${event.name}
                                <span class="delete-event">&#x274C;</span>
                            </div>`)}
                    </div>
                </div>`);
        }
    
        return days;
    }

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.requestUpdate();
    }
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.requestUpdate();
    }

    showEventInput(date) {
        const eventName = prompt('Enter event name:');
        if (eventName) {
            this.addEvent(date, eventName);
        }
    }
    
    addEvent(date, eventName) {
        this.events.push({ name: eventName, date: date.toISOString().slice(0, 10) });
        this.requestUpdate();
    }

    deleteEvent(e, event) {
        e.stopPropagation();
        this.events = this.events.filter(ev => ev !== event);
        this.requestUpdate();
    }
    
}

customElements.define('calendar-component', CalendarComponent);
