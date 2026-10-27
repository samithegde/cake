import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Cake,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
const dateFromKey = (key) => {
  const [year, month, day] = key.split('-').map(Number)
  return makeDate(year, month - 1, day)
}
const birthdayDateForYear = (event, year) => {
  const [, month, day] = event.date.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return makeDate(year, month - 1, Math.min(day, lastDay))
}
const matchesBirthdayDate = (event, date) =>
  dateKey(birthdayDateForYear(event, date.getFullYear())) === dateKey(date)
const nextBirthday = (event, from = today) => {
  const thisYear = birthdayDateForYear(event, from.getFullYear())
  const startOfToday = makeDate(from.getFullYear(), from.getMonth(), from.getDate())
  return thisYear >= startOfToday
    ? thisYear
    : birthdayDateForYear(event, from.getFullYear() + 1)
}
const birthdayLabel = (event) => `${event.name}’s birthday`
const birthdayAge = (event, year) => year - Number(event.date.slice(0, 4))
const formatMonth = (date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
const formatLongDate = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

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
        const dayEvents = events.filter((event) => matchesBirthdayDate(event, date))
        const isCurrentMonth = date.getMonth() === month.getMonth()
        const isToday = key === dateKey(today)
        const isSelected = key === selectedDate
        return (
          <button
            aria-label={`${formatLongDate(date)}${dayEvents.length ? `, ${dayEvents.length} birthdays` : ''}`}
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
                <span className="event-chip pink" key={event.id}>
                  <span className="event-dot" />
                  <span className="event-title">{event.name}</span>
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

function WeekStrip({ events, selectedDate, onSelectDate, onShiftWeek }) {
  const selected = dateFromKey(selectedDate)
  const firstDay = new Date(selected)
  firstDay.setDate(selected.getDate() - selected.getDay())
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(firstDay)
    date.setDate(firstDay.getDate() + index)
    return date
  })

  return (
    <div aria-label="Week calendar" className="mobile-week-strip">
      <button aria-label="Previous week" className="week-shift" onClick={() => onShiftWeek(-7)} type="button"><ChevronLeft size={17} /></button>
      {days.map((date) => {
        const key = dateKey(date)
        const isSelected = key === selectedDate
        return (
          <button
            aria-label={formatLongDate(date)}
            aria-pressed={isSelected}
            className={`week-day ${isSelected ? 'week-day-selected' : ''}`}
            key={key}
            onClick={() => onSelectDate(key)}
            type="button"
          >
            <span>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <strong>{date.getDate()}</strong>
            <i aria-hidden="true" className={`week-day-dot ${events.some((event) => matchesBirthdayDate(event, date)) ? 'has-birthday' : ''}`} />
          </button>
        )
      })}
      <button aria-label="Next week" className="week-shift" onClick={() => onShiftWeek(7)} type="button"><ChevronRight size={17} /></button>
    </div>
  )
}

function EventDialog({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return
    onSave({
      id: Date.now(),
      name: name.trim(),
      date: birthday,
    })
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form aria-labelledby="dialog-title" className="event-dialog glass-panel" onSubmit={handleSubmit}>
        <div className="dialog-top">
          <div>
            <p className="eyebrow">SAVE THE DATE</p>
            <h2 id="dialog-title">Add a birthday</h2>
          </div>
          <button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <label className="field-label" htmlFor="birthday-name">Who’s celebrating?</label>
        <input autoFocus className="text-input" id="birthday-name" onChange={(event) => setName(event.target.value)} placeholder="Their name" required value={name} />
        <label className="field-label" htmlFor="birthday-date">Date of birth</label>
        <input className="text-input" id="birthday-date" max={dateKey(today)} onChange={(event) => setBirthday(event.target.value)} required type="date" value={birthday} />
        <p className="form-note">Birthdays repeat every year. The birth year helps track milestone ages.</p>
        <div className="dialog-actions">
          <button className="quiet-button" onClick={onClose} type="button">Cancel</button>
          <button className="primary-button" type="submit"><Plus size={16} /> Add birthday</button>
        </div>
      </form>
    </div>
  )
}

function App() {
  const [month, setMonth] = useState(() => makeDate(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(dateKey(today))
  const [events, setEvents] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [view, setView] = useState('month')
  const [mobileScreen, setMobileScreen] = useState('day')
  const [query, setQuery] = useState('')

  const selected = dateFromKey(selectedDate)
  const selectedEvents = events.filter((event) => matchesBirthdayDate(event, selected))
  const upcoming = events
    .map((event) => ({ event, date: nextBirthday(event) }))
    .sort((left, right) => left.date - right.date)
  const filteredUpcoming = upcoming.filter(({ event }) =>
    event.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
  const birthdaysInMonth = events
    .filter((event) => birthdayDateForYear(event, month.getFullYear()).getMonth() === month.getMonth())
    .sort((left, right) => birthdayDateForYear(left, month.getFullYear()) - birthdayDateForYear(right, month.getFullYear()))

  function moveMonth(amount) {
    const nextMonth = makeDate(month.getFullYear(), month.getMonth() + amount, 1)
    const selectedDay = Number(selectedDate.slice(-2))
    const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()
    setMonth(nextMonth)
    setSelectedDate(dateKey(makeDate(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      Math.min(selectedDay, lastDay),
    )))
  }

  function selectDate(key) {
    setSelectedDate(key)
    const [year, monthIndex] = key.split('-').map(Number)
    setMonth((current) => current.getFullYear() === year && current.getMonth() === monthIndex - 1
      ? current
      : makeDate(year, monthIndex - 1, 1))
  }

  function selectMobileDate(key) {
    setMobileScreen('day')
    selectDate(key)
  }

  function goToToday() {
    setMonth(makeDate(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(dateKey(today))
  }

  function openDialog() {
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
            <span>Birthdays</span>
          </div>

          <button className="create-button" onClick={() => openDialog()} type="button">
            <Plus size={18} strokeWidth={2.2} /> <span>Add birthday</span>
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
          <div className="section-heading"><span>BIRTHDAYS</span><button aria-label="Add birthday" className="subtle-plus" onClick={() => openDialog()}><Plus size={15} /></button></div>
          <div className="calendar-list">
            <div className="calendar-item"><span className="calendar-color color-pink"><Sparkles size={10} /></span><span>Friends &amp; family</span><span className="item-count">{events.length}</span></div>
          </div>

          <div className="sidebar-bottom">
            <div className="sidebar-tip">
              <div className="tip-icon"><Sparkles size={16} /></div>
              <p>Little reminders make the best days.</p>
              <span>MAKE THEIR DAY</span>
            </div>
          </div>
        </aside>

        <section className={`main-panel glass-panel ${mobileScreen === 'month' ? 'show-mobile-month' : ''}`}>
          <header className="topbar">
            <div className="breadcrumb"><span>Birthdays</span><span className="breadcrumb-slash">/</span><strong>{view === 'month' ? 'Month view' : 'Agenda view'}</strong></div>
            <div className="topbar-actions">
              <label className="search-box"><Search size={16} /><input aria-label="Search birthdays" onChange={(event) => setQuery(event.target.value)} placeholder="Search birthdays" value={query} /><kbd>⌘ K</kbd></label>
            </div>
          </header>

          <div className="mobile-topbar">
            <button className="mobile-today" onClick={goToToday} type="button">Today</button>
            <div className="mobile-date-heading">
              <span className="mobile-app-label">BIRTHDAYS</span>
              <strong>{selected.toLocaleDateString('en-US', { weekday: 'long' })}</strong>
              <span>{selected.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <button aria-label="Open month calendar" className="mobile-calendar-button" onClick={() => { setMobileScreen('month'); setView('month') }} type="button"><CalendarDays size={20} /></button>
          </div>
          <WeekStrip
            events={events}
            onSelectDate={selectMobileDate}
            onShiftWeek={(days) => {
              const next = new Date(selected)
              next.setDate(next.getDate() + days)
              selectDate(dateKey(next))
            }}
            selectedDate={selectedDate}
          />

          <div className="calendar-content">
            <div className="calendar-heading">
              <div>
                <h1>{formatMonth(month)}</h1>
              </div>
              <div className="heading-actions">
                <button className="today-button" onClick={goToToday} type="button">Today</button>
                <div className="month-navigation">
                  <button aria-label="Previous month" className="icon-button" onClick={() => moveMonth(-1)}><ArrowLeft size={17} /></button>
                  <button aria-label="Next month" className="icon-button" onClick={() => moveMonth(1)}><ArrowRight size={17} /></button>
                </div>
                <div aria-label="Calendar view" className="view-switch">
                  <button aria-label="Month view" aria-pressed={view === 'month'} className={view === 'month' ? 'view-active' : ''} onClick={() => setView('month')}><LayoutGrid size={15} /></button>
                  <button aria-label="Agenda view" aria-pressed={view === 'agenda'} className={view === 'agenda' ? 'view-active' : ''} onClick={() => setView('agenda')}><List size={16} /></button>
                </div>
                <button className="primary-button header-create" onClick={() => openDialog()} type="button"><Plus size={16} /> <span>Add birthday</span></button>
              </div>
            </div>

            {view === 'month' ? (
              <CalendarGrid events={events} month={month} onSelectDate={selectMobileDate} selectedDate={selectedDate} />
            ) : (
              <div className="agenda-list">
                {birthdaysInMonth.length ? birthdaysInMonth.map((event) => {
                    const date = birthdayDateForYear(event, month.getFullYear())
                    const age = birthdayAge(event, month.getFullYear())
                    return (
                      <button className="agenda-row" key={event.id} onClick={() => selectDate(dateKey(date))} type="button">
                        <span className="agenda-date">{date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
                        <span className="agenda-mark pink" />
                        <span className="agenda-title">{birthdayLabel(event)}</span>
                        <span className="agenda-time">{age > 0 ? `Turning ${age}` : 'Birthday'}</span>
                      </button>
                    )
                  }) : (
                    <div className="agenda-empty">
                      <p>No birthdays in {month.toLocaleDateString('en-US', { month: 'long' })} yet.</p>
                      <button className="see-all" onClick={() => openDialog()} type="button"><Plus size={14} /> Add a birthday</button>
                    </div>
                  )}
              </div>
            )}

            <div className="bottom-content">
              <section className="day-detail">
                <div className="detail-heading">
                  <div className="detail-date-mark"><Cake size={18} /></div>
                  <div><p className="eyebrow">ON THIS DAY</p><h2>Birthdays to celebrate</h2></div>
                </div>
                {selectedEvents.length > 0 ? (
                  <div className="detail-events">
                    {selectedEvents.map((event) => (
                      <div className="detail-event" key={event.id}>
                        <div className="detail-event-icon"><Cake size={19} /></div>
                        <div className="detail-event-info">
                          <strong>{event.name}</strong>
                          <span>{birthdayAge(event, selected.getFullYear()) > 0 ? `Celebrating ${birthdayAge(event, selected.getFullYear())}` : 'Birthday today'}</span>
                        </div>
                        <button aria-label={`Remove ${birthdayLabel(event)}`} className="remove-event" onClick={() => setEvents((current) => current.filter((item) => item.id !== event.id))}><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button className="empty-day" onClick={openDialog} type="button">
                    <span className="empty-plus"><Plus size={16} /></span>
                    <span><strong>A day all to yourself</strong><small>No birthdays on this date</small></span>
                    <ArrowRight size={16} className="empty-arrow" />
                  </button>
                )}
              </section>

              <aside className="upcoming-card">
                <div className="upcoming-header"><div><p className="eyebrow">DON’T FORGET</p><h2>Upcoming birthdays</h2></div></div>
                {filteredUpcoming.length ? filteredUpcoming.map(({ event, date }) => {
                  const age = birthdayAge(event, date.getFullYear())
                  return (
                    <button className="upcoming-event" key={event.id} onClick={() => selectDate(dateKey(date))} type="button">
                      <div className="upcoming-date"><strong>{date.getDate()}</strong><span>{date.toLocaleDateString('en-US', { month: 'short' })}</span></div>
                      <span className="upcoming-mark pink" />
                      <span className="upcoming-copy"><strong>{event.name}</strong><small>{date.toLocaleDateString('en-US', { weekday: 'short' })} <span>·</span> {age > 0 ? `Turning ${age}` : 'Birthday'}</small></span>
                    </button>
                  )
                }) : <p className="no-upcoming">{query ? 'No matching birthdays.' : 'Add a birthday to get started.'}</p>}
                <button className="see-all" onClick={() => openDialog()} type="button"><Plus size={14} /> Add a birthday</button>
              </aside>
            </div>
            <footer className="calendar-footer"><span>Make every birthday feel remembered.</span><span><span className="footer-dot" /> BIRTHDAYS, EVERY YEAR</span></footer>
          </div>

          <div className="mobile-bottom-action">
            <button className="mobile-add-button" onClick={() => openDialog()} type="button"><Plus size={20} /><span>Add a birthday</span></button>
          </div>
        </section>
      </div>

      {showDialog && (
        <EventDialog
          onClose={() => setShowDialog(false)}
          onSave={saveEvent}
        />
      )}
    </main>
  )
}

export default App
