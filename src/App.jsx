import { useMemo, useState } from 'react'
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react'

const today = new Date()
const pad = (number) => String(number).padStart(2, '0')
const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const makeDate = (year, month, day) => new Date(year, month, day, 12)
const formatMonth = (date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
const formatLongDate = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

const initialEvents = (year, month) => {
  const at = (day) => dateKey(makeDate(year, month, day))
  return [
    { id: 1, title: 'Morning pages', date: at(3), time: '9:00 AM', color: 'lilac', category: 'Personal' },
    { id: 2, title: 'Weekly planning', date: at(5), time: '10:30 AM', color: 'blue', category: 'Focus' },
    { id: 3, title: 'Coffee with Alex', date: at(8), time: '11:00 AM', color: 'pink', category: 'Personal', location: 'Juniper Coffee' },
    { id: 4, title: 'Design review', date: at(11), time: '2:00 PM', color: 'blue', category: 'Work', location: 'Studio · Room 04' },
    { id: 5, title: 'Walk & reset', date: at(14), time: '4:30 PM', color: 'mint', category: 'Personal' },
    { id: 6, title: 'Project check-in', date: at(16), time: '10:00 AM', color: 'lilac', category: 'Work' },
    { id: 7, title: 'Lunch with Sam', date: at(18), time: '12:30 PM', color: 'pink', category: 'Personal', location: 'Little Fern' },
    { id: 8, title: 'Deep work', date: at(21), time: '9:00 AM', color: 'blue', category: 'Focus' },
    { id: 9, title: 'Team catch-up', date: at(23), time: '3:00 PM', color: 'mint', category: 'Work' },
    { id: 10, title: 'Book club', date: at(26), time: '6:00 PM', color: 'lilac', category: 'Personal' },
    { id: 11, title: 'Monthly reflection', date: at(29), time: '4:00 PM', color: 'pink', category: 'Personal' },
  ]
}

function CalendarGrid({ month, events, selectedDate, onSelectDate }) {
  const cells = useMemo(() => {
    const first = makeDate(month.getFullYear(), month.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - first.getDay())
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
  }, [month])

  return (
    <div className="calendar-grid" role="grid" aria-label={formatMonth(month)}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div className="weekday" key={day} role="columnheader">{day}</div>
      ))}
      {cells.map((date) => {
        const key = dateKey(date)
        const dayEvents = events.filter((event) => event.date === key)
        const isCurrentMonth = date.getMonth() === month.getMonth()
        const isToday = key === dateKey(today)
        const isSelected = key === selectedDate
        return (
          <button
            aria-label={`${formatLongDate(date)}${dayEvents.length ? `, ${dayEvents.length} events` : ''}`}
            aria-pressed={isSelected}
            className={`day-cell ${isCurrentMonth ? '' : 'outside-month'} ${isToday ? 'today' : ''} ${isSelected ? 'selected-day' : ''}`}
            key={key}
            onClick={() => onSelectDate(key)}
            role="gridcell"
            type="button"
          >
            <span className="day-number">{date.getDate()}</span>
            <span className="day-events">
              {dayEvents.slice(0, 2).map((event) => (
                <span className={`event-chip ${event.color}`} key={event.id}>
                  <span className="event-dot" />
                  <span className="event-title">{event.title}</span>
                </span>
              ))}
              {dayEvents.length > 2 && <span className="more-events">+{dayEvents.length - 2} more</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function MiniCalendar({ month, selectedDate, onSelectDate }) {
  const first = makeDate(month.getFullYear(), month.getMonth(), 1)
  const offset = first.getDay()
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  return (
    <div className="mini-calendar">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
        <span className="mini-weekday" key={`${day}-${index}`}>{day}</span>
      ))}
      {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} />)}
      {Array.from({ length: dayCount }, (_, index) => {
        const day = index + 1
        const key = dateKey(makeDate(month.getFullYear(), month.getMonth(), day))
        return (
          <button
            aria-label={formatLongDate(makeDate(month.getFullYear(), month.getMonth(), day))}
            aria-pressed={key === selectedDate}
            className={`mini-day ${key === selectedDate ? 'mini-selected' : ''} ${key === dateKey(today) ? 'mini-today' : ''}`}
            key={day}
            onClick={() => onSelectDate(key)}
            type="button"
          >
            {day}
          </button>
        )
      })}
    </div>
  )
}

function EventDialog({ date, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState(date)
  const [time, setTime] = useState('10:00')
  const [category, setCategory] = useState('Work')
  const [location, setLocation] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim()) return
    onSave({
      id: Date.now(),
      title: title.trim(),
      date: eventDate,
      time: new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      category,
      location: location.trim(),
      color: category === 'Work' ? 'blue' : category === 'Focus' ? 'lilac' : 'pink',
    })
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form aria-labelledby="dialog-title" className="event-dialog glass-panel" onSubmit={handleSubmit}>
        <div className="dialog-top">
          <div>
            <p className="eyebrow">MAKE SOME SPACE</p>
            <h2 id="dialog-title">New event</h2>
          </div>
          <button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <label className="field-label" htmlFor="event-title">What’s happening?</label>
        <input autoFocus className="text-input" id="event-title" onChange={(event) => setTitle(event.target.value)} placeholder="Give it a name" required value={title} />
        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="event-date">Date</label>
            <input className="text-input" id="event-date" onChange={(event) => setEventDate(event.target.value)} type="date" value={eventDate} />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="event-time">Time</label>
            <input className="text-input" id="event-time" onChange={(event) => setTime(event.target.value)} type="time" value={time} />
          </div>
        </div>
        <label className="field-label" htmlFor="event-category">Calendar</label>
        <select className="text-input" id="event-category" onChange={(event) => setCategory(event.target.value)} value={category}>
          <option>Work</option><option>Personal</option><option>Focus</option>
        </select>
        <label className="field-label" htmlFor="event-location">Location <span className="optional">· optional</span></label>
        <input className="text-input" id="event-location" onChange={(event) => setLocation(event.target.value)} placeholder="Add a place" value={location} />
        <div className="dialog-actions">
          <button className="quiet-button" onClick={onClose} type="button">Cancel</button>
          <button className="primary-button" type="submit"><Plus size={16} /> Add event</button>
        </div>
      </form>
    </div>
  )
}

function App() {
  const [month, setMonth] = useState(() => makeDate(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(dateKey(today))
  const [events, setEvents] = useState(() => initialEvents(today.getFullYear(), today.getMonth()))
  const [showDialog, setShowDialog] = useState(false)
  const [dialogDate, setDialogDate] = useState(dateKey(today))
  const [view, setView] = useState('month')
  const [query, setQuery] = useState('')

  const selected = makeDate(...selectedDate.split('-').map(Number).map((part, index) => index === 1 ? part - 1 : part))
  const selectedEvents = events
    .filter((event) => event.date === selectedDate)
    .sort((left, right) => left.time.localeCompare(right.time))
  const upcoming = events
    .filter((event) => event.date >= dateKey(today))
    .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`))
    .slice(0, 4)
  const filteredUpcoming = upcoming.filter((event) => event.title.toLowerCase().includes(query.toLowerCase()))

  function moveMonth(amount) {
    setMonth((current) => makeDate(current.getFullYear(), current.getMonth() + amount, 1))
  }

  function selectDate(key) {
    setSelectedDate(key)
    const [year, monthIndex] = key.split('-').map(Number)
    setMonth((current) => current.getFullYear() === year && current.getMonth() === monthIndex - 1
      ? current
      : makeDate(year, monthIndex - 1, 1))
  }

  function openDialog(date = selectedDate) {
    setDialogDate(date)
    setShowDialog(true)
  }

  function saveEvent(event) {
    if (event && typeof event === 'object') setEvents((current) => [...current, event])
    setShowDialog(false)
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <div className="workspace">
        <aside className="sidebar glass-panel">
          <div className="sidebar-brand">
            <div className="brand-mark"><CalendarDays size={20} strokeWidth={1.8} /></div>
            <span>Calendar</span>
            <button aria-label="Switch calendar" className="brand-switch"><ChevronDown size={15} /></button>
          </div>

          <button className="create-button" onClick={() => openDialog()} type="button">
            <Plus size={18} strokeWidth={2.2} /> <span>Create event</span>
          </button>

          <div className="mini-heading">
            <h2>{formatMonth(month)}</h2>
            <div className="mini-controls">
              <button aria-label="Previous month" className="icon-button small-icon" onClick={() => moveMonth(-1)}><ChevronLeft size={16} /></button>
              <button aria-label="Next month" className="icon-button small-icon" onClick={() => moveMonth(1)}><ChevronRight size={16} /></button>
            </div>
          </div>
          <MiniCalendar month={month} onSelectDate={selectDate} selectedDate={selectedDate} />

          <div className="sidebar-divider" />
          <div className="section-heading"><span>MY CALENDARS</span><button aria-label="Add calendar" className="subtle-plus" onClick={() => openDialog()}><Plus size={15} /></button></div>
          <div className="calendar-list">
            <button className="calendar-item" type="button"><span className="calendar-color color-blue"><Check size={11} /></span><span>Work</span><span className="item-count">{events.filter((event) => event.category === 'Work').length}</span></button>
            <button className="calendar-item" type="button"><span className="calendar-color color-pink"><Check size={11} /></span><span>Personal</span><span className="item-count">{events.filter((event) => event.category === 'Personal').length}</span></button>
            <button className="calendar-item" type="button"><span className="calendar-color color-lilac"><Check size={11} /></span><span>Focus time</span><span className="item-count">{events.filter((event) => event.category === 'Focus').length}</span></button>
          </div>

          <div className="sidebar-bottom">
            <div className="sidebar-tip">
              <div className="tip-icon"><Sparkles size={16} /></div>
              <p>A little room to breathe goes a long way.</p>
              <span>MAKE TODAY YOURS</span>
            </div>
          </div>
        </aside>

        <section className="main-panel glass-panel">
          <header className="topbar">
            <div className="breadcrumb"><span>Calendar</span><span className="breadcrumb-slash">/</span><strong>{view === 'month' ? 'Month view' : 'Agenda view'}</strong></div>
            <div className="topbar-actions">
              <button aria-label="Search upcoming events" className="search-box"><Search size={16} /><input aria-label="Search events" onChange={(event) => setQuery(event.target.value)} placeholder="Search events" value={query} /><kbd>⌘ K</kbd></button>
              <button aria-label="Notifications" className="icon-button notification-button"><Bell size={17} /><span /></button>
            </div>
          </header>

          <div className="calendar-content">
            <div className="calendar-heading">
              <div>
                <p className="eyebrow"><span className="eyebrow-dot" /> YOUR TIME, WELL SPENT</p>
                <h1>{formatMonth(month)}</h1>
              </div>
              <div className="heading-actions">
                <button className="today-button" onClick={() => { setMonth(makeDate(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(dateKey(today)) }} type="button">Today</button>
                <div className="month-navigation">
                  <button aria-label="Previous month" className="icon-button" onClick={() => moveMonth(-1)}><ArrowLeft size={17} /></button>
                  <button aria-label="Next month" className="icon-button" onClick={() => moveMonth(1)}><ArrowRight size={17} /></button>
                </div>
                <div aria-label="Calendar view" className="view-switch">
                  <button aria-label="Month view" aria-pressed={view === 'month'} className={view === 'month' ? 'view-active' : ''} onClick={() => setView('month')}><LayoutGrid size={15} /></button>
                  <button aria-label="Agenda view" aria-pressed={view === 'agenda'} className={view === 'agenda' ? 'view-active' : ''} onClick={() => setView('agenda')}><List size={16} /></button>
                </div>
                <button className="primary-button header-create" onClick={() => openDialog()} type="button"><Plus size={16} /> <span>New event</span></button>
              </div>
            </div>

            {view === 'month' ? (
              <CalendarGrid events={events} month={month} onSelectDate={selectDate} selectedDate={selectedDate} />
            ) : (
              <div className="agenda-list">
                {events.filter((event) => event.date.slice(0, 7) === dateKey(month).slice(0, 7))
                  .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`))
                  .map((event) => (
                    <button className="agenda-row" key={event.id} onClick={() => selectDate(event.date)} type="button">
                      <span className="agenda-date">{makeDate(...event.date.split('-').map(Number).map((part, index) => index === 1 ? part - 1 : part)).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
                      <span className={`agenda-mark ${event.color}`} />
                      <span className="agenda-title">{event.title}</span>
                      <span className="agenda-time">{event.time}</span>
                    </button>
                  ))}
              </div>
            )}

            <div className="bottom-content">
              <section className="day-detail">
                <div className="detail-heading">
                  <div className="detail-date-mark">{selected.getDate()}</div>
                  <div><p className="eyebrow">YOUR DAY AT A GLANCE</p><h2>{formatLongDate(selected)}</h2></div>
                </div>
                {selectedEvents.length > 0 ? (
                  <div className="detail-events">
                    {selectedEvents.map((event) => (
                      <div className="detail-event" key={event.id}>
                        <div className={`detail-event-marker ${event.color}`} />
                        <span className="detail-event-time"><Clock3 size={13} />{event.time}</span>
                        <div className="detail-event-info"><strong>{event.title}</strong><span>{event.category}{event.location ? ` · ${event.location}` : ''}</span></div>
                        <button aria-label={`Remove ${event.title}`} className="remove-event" onClick={() => setEvents((current) => current.filter((item) => item.id !== event.id))}><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button className="empty-day" onClick={() => openDialog(selectedDate)} type="button">
                    <span className="empty-plus"><Plus size={16} /></span>
                    <span><strong>A little open space</strong><small>Add something to your day</small></span>
                    <ArrowRight size={16} className="empty-arrow" />
                  </button>
                )}
              </section>

              <aside className="upcoming-card">
                <div className="upcoming-header"><div><p className="eyebrow">COMING UP</p><h2>Next on your list</h2></div><ArrowDownUp size={15} /></div>
                {filteredUpcoming.length ? filteredUpcoming.map((event) => {
                  const date = makeDate(...event.date.split('-').map(Number).map((part, index) => index === 1 ? part - 1 : part))
                  return (
                    <button className="upcoming-event" key={event.id} onClick={() => selectDate(event.date)} type="button">
                      <div className="upcoming-date"><strong>{date.getDate()}</strong><span>{date.toLocaleDateString('en-US', { month: 'short' })}</span></div>
                      <span className={`upcoming-mark ${event.color}`} />
                      <span className="upcoming-copy"><strong>{event.title}</strong><small>{event.time} <span>·</span> {event.category}</small></span>
                    </button>
                  )
                }) : <p className="no-upcoming">Nothing found on the horizon.</p>}
                <button className="see-all" onClick={() => setView('agenda')} type="button">See full agenda <ArrowRight size={14} /></button>
              </aside>
            </div>
            <footer className="calendar-footer"><span>Taking it one day at a time.</span><span><span className="footer-dot" /> ALL CAUGHT UP</span></footer>
          </div>
        </section>
      </div>

      {showDialog && (
        <EventDialog
          date={dialogDate}
          onClose={() => setShowDialog(false)}
          onSave={saveEvent}
        />
      )}
    </main>
  )
}

export default App
