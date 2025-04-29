<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';

interface CalendarEvent {
  id: string;
  title: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  notes?: string;
  className?: string;
}

const events = ref<CalendarEvent[]>([]);
const selectedDate = ref<Date | null>(null);

const calendarRef = ref<any>(null);
const showPopup = ref(false);
const popupX = ref(0);
const popupY = ref(0);
const popupPosition = ref<'above' | 'below'>('below');
const isEditing = ref(false);
const editingEventId = ref<string | null>(null);
const errorMessage = ref('');

const form = ref({
  title: '',
  date: '',
  time: '',
  notes: '',
  color: '#3b86ff'
});

const calendarOptions = ref<CalendarOptions>({
  initialView: 'dayGridMonth',
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: 'today prev next',
    center: 'title',
    right: 'dayGridMonth timeGridWeek timeGridDay'
  },
  buttonText: {
    prev: 'Prev',
    next: 'Next'
  },
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: false,
  weekends: true,
  nowIndicator: true,
  height: '100%',
  fixedWeekCount: false,
  eventDisplay: 'block',
  allDaySlot: true,
  allDayText: 'all day',
  slotDuration: '02:00:00',
  slotLabelInterval: '02:00',
  slotLabelFormat: {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    meridiem: 'lowercase',
  },
  slotMinTime: '00:00:00',
  slotMaxTime: '24:00:00',
  dayHeaderFormat: {
    weekday: 'short',
    month: '2-digit',
    day: '2-digit',
    omitCommas: true
  },
  events: events.value,
  select: (info: any) => {
    openPopup(info.start, info.jsEvent.pageX, info.jsEvent.pageY, undefined, info.jsEvent);
  },
  eventClick: (info: any) => {
    openPopup(info.event.start, info.jsEvent.pageX, info.jsEvent.pageY, info.event, info.jsEvent, info.el);
  },
  eventDrop: (info: any) => {
    const event = events.value.find(e => e.id === info.event.id);
    if (event) {
      event.start = info.event.start;
      if (info.event.end) event.end = info.event.end;
      if (info.event.allDay) event.allDay = true;
      event.className = '';
      event.textColor = '#fff';
    }
  },
  dateClick: (info: any) => {
    selectedDate.value = new Date(info.dateStr);
  },
  dayCellDidMount: (info: any) => {
    const cellDate = new Date(info.date);
    const cellDateWithoutTime = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
    const selected = selectedDate.value && selectedDate.value.getTime() === cellDateWithoutTime.getTime();
    if (selected) {
      info.el.classList.add('selected-date');
    }
  }
});

const openPopup = (date: Date, x: number, y: number, event?: any, jsEvent?: any, eventElement?: HTMLElement) => {
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  selectedDate.value = dateWithoutTime;

  if (event) {
    isEditing.value = true;
    editingEventId.value = event.id;
    form.value.title = event.title;
    form.value.date = formatDate(event.start);
    form.value.time = event.allDay ? '' : formatTime(event.start);
    form.value.notes = event.extendedProps?.notes || '';
    form.value.color = event.backgroundColor || event.extendedProps?.backgroundColor || '#3b86ff';

    const eventIndex = events.value.findIndex(e => e.id === event.id);
    if (eventIndex !== -1) {
      events.value[eventIndex].className = 'editing';
      events.value[eventIndex].textColor = form.value.color;
      calendarOptions.value.events = [...events.value];
    }
  } else {
    isEditing.value = false;
    editingEventId.value = null;
    form.value.title = '';
    form.value.date = formatDate(date);
    form.value.time = '';
    form.value.notes = '';
    form.value.color = '#3b86ff';
  }

  const popupHeight = 331;
  const popupWidth = 200;
  const arrowHeight = 10;
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;

  let targetElement: HTMLElement | null = eventElement as HTMLElement | null;
  if (!targetElement && jsEvent) {
    targetElement = jsEvent.target.closest('.fc-daygrid-day') || jsEvent.target.closest('.fc-timegrid-slot');
  }

  let cellRect: DOMRect | undefined;
  if (targetElement) {
    cellRect = targetElement.getBoundingClientRect();
  }

  if (cellRect) {
    popupX.value = cellRect.left + (cellRect.width - popupWidth) / 2;
  } else {
    popupX.value = x - popupWidth / 2;
  }

  if (popupX.value + popupWidth > windowWidth) {
    popupX.value = windowWidth - popupWidth - 10;
  }
  if (popupX.value < 0) {
    popupX.value = 10;
  }

  const spaceBelow = windowHeight - y;
  if (spaceBelow >= popupHeight + arrowHeight + 10) {
    popupY.value = y + 10;
    popupPosition.value = 'below';
  } else {
    popupY.value = y - popupHeight - arrowHeight - 10;
    popupPosition.value = 'above';
  }

  if (popupY.value < 0) {
    popupY.value = 10;
    popupPosition.value = 'below';
  }

  errorMessage.value = '';
  showPopup.value = true;
};

const closePopup = () => {
  if (isEditing.value && editingEventId.value) {
    const eventIndex = events.value.findIndex(e => e.id === editingEventId.value);
    if (eventIndex !== -1) {
      events.value[eventIndex].className = '';
      events.value[eventIndex].textColor = '#fff';
      calendarOptions.value.events = [...events.value];
    }
  }

  isEditing.value = false;
  editingEventId.value = null;
  showPopup.value = false;
  errorMessage.value = '';
  selectedDate.value = null;
};

const saveEvent = () => {
  if (form.value.title.trim().length === 0) {
    errorMessage.value = 'Title cannot be empty!';
    return;
  }

  if (form.value.title.length > 30) {
    errorMessage.value = 'Title cannot be longer than 30 characters!';
    return;
  }

  const [year, month, day] = form.value.date.split('-').map(Number);
  const isAllDay = !form.value.time;
  const eventDate = isAllDay
    ? new Date(year, month - 1, day)
    : new Date(`${form.value.date}T${form.value.time || '00:00'}`);

  const now = new Date();

  if (isAllDay) {
    const eventDateOnly = new Date(year, month - 1, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (eventDateOnly < today) {
      errorMessage.value = 'Event date cannot be in the past!';
      return;
    }
  } else {
    if (eventDate < now) {
      errorMessage.value = 'Event date and time cannot be in the past!';
      return;
    }
  }

  const startDate = eventDate;
  const endDate = isAllDay ? undefined : new Date(startDate.getTime() + 60 * 60 * 1000);

  if (isEditing.value && editingEventId.value) {
    const eventIndex = events.value.findIndex(e => e.id === editingEventId.value);
    if (eventIndex !== -1) {
      const updatedEvent = {
        ...events.value[eventIndex],
        title: form.value.title,
        start: startDate,
        end: endDate,
        allDay: isAllDay,
        notes: form.value.notes,
        backgroundColor: form.value.color,
        borderColor: form.value.color,
        textColor: '#fff',
        className: ''
      };
      events.value[eventIndex] = updatedEvent;
    }
  } else {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: form.value.title,
      start: startDate,
      end: endDate,
      allDay: isAllDay,
      notes: form.value.notes,
      backgroundColor: form.value.color,
      borderColor: form.value.color,
      textColor: '#fff',
      className: ''
    };
    events.value.push(newEvent);
  }
  calendarOptions.value.events = [...events.value];
  closePopup();
};

const deleteEvent = () => {
  if (isEditing.value && editingEventId.value) {
    events.value = events.value.filter(e => e.id !== editingEventId.value);
    calendarOptions.value.events = [...events.value];
    closePopup();
  }
};

watch(selectedDate, () => {
  if (calendarRef.value) {
    const calendarEl = calendarRef.value.el as HTMLElement;
    if (calendarEl) {
      const dayCells = calendarEl.querySelectorAll('.fc-daygrid-day') as NodeListOf<HTMLElement>;
      dayCells.forEach((el: HTMLElement) => {
        const cellDateStr = el.getAttribute('data-date');
        if (cellDateStr) {
          const cellDate = new Date(cellDateStr);
          const cellDateWithoutTime = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
          const selected = selectedDate.value && selectedDate.value.getTime() === cellDateWithoutTime.getTime();
          if (selected) {
            el.classList.add('selected-date');
          } else {
            el.classList.remove('selected-date');
          }
        }
      });
    }
  }
});
</script>

<template>
  <div class="calendar">
    <h1 class="calendar-title">
      Calendar
    </h1>
    <div class="calendar-body">
      <div class="calendar-body__title">
        Calendar View
      </div>
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
      <div v-if="showPopup" class="popup" :style="{ top: `${popupY}px`, left: `${popupX}px` }"
        :class="{ 'popup-above': popupPosition === 'above', 'popup-below': popupPosition === 'below' }">
        <div class="popup-content">
          <div class="popup-header">
            <button class="close-btn" @click="closePopup">&times;</button>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="input-group">
            <label for="title">event name</label>
            <input v-model="form.title" id="title" name="title" />
          </div>
          <div class="input-group">
            <label for="date">event date</label>
            <input type="date" id="date" name="date" v-model="form.date" />
          </div>
          <div class="input-group">
            <label for="time">event time</label>
            <input type="time" id="time" name="time" v-model="form.time" />
          </div>
          <div class="input-group">
            <label for="notes">notes</label>
            <textarea name="notes" id="notes" v-model="form.notes" rows="1" />
          </div>
          <div class="color-picker">
            <span v-for="color in ['#3b86ff', '#f87171', '#34d399', '#facc15']" :key="color" class="color-circle"
              :class="{ active: form.color === color }" :style="{ backgroundColor: color }"
              @click="form.color = color" />
          </div>
          <div class="buttons">
            <button v-if="isEditing" class="discard-btn" @click="closePopup">Discard</button>
            <button v-else class="cancel-btn" @click="closePopup">Cancel</button>
            <button v-if="isEditing" class="edit-btn" @click="saveEvent">Edit</button>
            <button v-else class="save-btn" @click="saveEvent">Save</button>
            <button v-if="isEditing" class="delete-btn" @click="deleteEvent">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar {
  padding: 32px 95px 100px 75px;
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 32px;

  &-title {
    font-size: 28px;
    line-height: calc(40 / 28);
    color: var(--text-dark);
  }

  &-body {
    background-color: var(--white);
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    max-height: 100% !important;
    box-shadow: 0 2px 6px #0000000a;
    -webkit-box-shadow: 0 2px 6px #0000000a;
    -moz-box-shadow: 0 2px 6px #0000000a;
    -o-box-shadow: 0 2px 6px #0000000a;
    -ms-box-shadow: 0 2px 6px #0000000a;
    padding: 20px;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    aspect-ratio: 1.36;
    position: relative;

    &-title {
      position: absolute;
      font-size: 18px;
    }

    >.fc {
      flex-grow: 1;
      min-height: 0;
      height: 100% !important;
    }

    >div {
      flex-grow: 1;
      min-height: 0;
      height: 100% !important;
    }

    .fc-event {
      background-color: inherit !important;
    }

    .popup {
      position: fixed;
      background: white;
      box-shadow: 0 3px 18px #00000029;
      border-radius: 10px;
      width: 200px;
      z-index: 1000;
      padding: 0;
      border: 1px solid var(--text-dark);
      height: fit-content !important;
      transition: all 0.3s ease;

      &::after {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
        border-right: 5px solid transparent;
        border-left: 5px solid transparent;

        border-top: 0;
      }

      &.popup-below::after {
        border-bottom: 9px solid var(--text-dark);
        top: -9px;
        left: 50%;
        transform: translateX(-50%);
      }

      &.popup-above::after {
        border-top: 9px solid var(--text-dark);
        bottom: -9px;
        left: 50%;
        transform: translateX(-50%);
      }

      &-content {
        display: flex;
        flex-direction: column;
      }

      &-header {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 6px 7px;
      }

      .close-btn {
        background: none;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        color: #d6d6d6;
        font-weight: 500;
        height: 20px;
        width: 20px;
        padding: 0;
        margin: 0;
        border-radius: 100%;
        border: 2px solid #d6d6d6;
      }

      .error-message {
        padding: 10px 15px;
        color: #ff4d4f;
        font-size: 14px;
        text-align: center;
        background-color: #fff1f0;
      }
    }

    .input-group {
      margin: 0 27.5px 20px 25.5px;
      border-bottom: 1px solid var(--grey);
      display: flex;
      flex-direction: column;
      gap: 2px;

      label {
        font-size: 9px;
        line-height: 1;
        color: var(--light-grey);
      }

      input,
      textarea {
        flex: 1;
        border: none;
        outline: none;
        font-size: 12px;
        color: var(--text-dark);
        background: transparent;
        padding: 2px 0;
        height: 14px;
        font-family: "Source Sans 3", sans-serif;
      }

      input[type="date"],
      input[type="time"] {
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
      }

      textarea {
        resize: none;
        line-height: 1.5;
      }

      .icon {
        color: #6b7280;

        svg {
          width: 16px;
          height: 16px;
        }
      }

      .hint {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
        display: block;
      }
    }

    .color-picker {
      display: flex;
      gap: 8px;
      margin: 0 27.5px 10px 25.5px;
    }

    .color-circle {
      width: 24px;
      height: 24px;
      border-radius: 20%;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }

    .color-circle {
      &:hover {
        border-color: var(--text-dark);
      }
    }

    .color-circle {
      &.active {
        border-color: var(--text-dark) !important;
      }
    }

    .buttons {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      padding: 17px 27.5px 25px 25.5px;
    }

    button {
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }

    .cancel-btn {
      background: none;
      color: var(--red);
    }

    .discard-btn {
      background: none;
      color: var(--red);
      text-transform: uppercase;
    }

    .edit-btn {
      background: none;
      color: var(--save-color);
      text-transform: uppercase;
    }

    .delete-btn {
      background: none;
      color: var(--red);
      text-transform: uppercase;
    }

    .save-btn {
      background: none;
      color: var(--save-color);
    }
  }
}
</style>