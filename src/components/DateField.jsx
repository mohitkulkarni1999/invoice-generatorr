import { useEffect, useRef, useState } from 'react'

const pad = (n) => String(n).padStart(2, '0')

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const isValidDate = (year, month, day) => {
    const date = new Date(year, month, day)
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
}

const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const parseInput = (raw) => {
    const trimmed = (raw || '').trim()
    if (!trimmed) return null

    let m = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
    if (m) {
        const [, day, month, year] = m.map(Number)
        if (isValidDate(year, month - 1, day)) return new Date(year, month - 1, day)
        return null
    }

    m = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (m) {
        const [, year, month, day] = m.map(Number)
        if (isValidDate(year, month - 1, day)) return new Date(year, month - 1, day)
    }
    return null
}

const formatDisplay = (iso) => {
    if (!iso) return ''
    const d = parseInput(iso)
    return d ? `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}` : iso
}

export default function DateField({ value, onChange, placeholder }) {
    const [open, setOpen] = useState(false)
    const [showYears, setShowYears] = useState(false)
    const [text, setText] = useState('')
    const [viewYear, setViewYear] = useState(2026)
    const [viewMonth, setViewMonth] = useState(0)
    const wrapRef = useRef(null)

    const selected = parseInput(value)

    useEffect(() => {
        if (selected) {
            setViewYear(selected.getFullYear())
            setViewMonth(selected.getMonth())
        }
        setText(formatDisplay(value))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    useEffect(() => {
        if (!open) return
        const onDoc = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false)
                setShowYears(false)
            }
        }
        document.addEventListener('mousedown', onDoc)
        return () => document.removeEventListener('mousedown', onDoc)
    }, [open])

    const openCalendar = () => {
        const base = selected || new Date()
        setViewYear(base.getFullYear())
        setViewMonth(base.getMonth())
        setShowYears(false)
        setOpen(true)
    }

    const handleText = (raw) => {
        setText(raw)
        const d = parseInput(raw)
        if (d) onChange(toISO(d))
    }

    const handleBlur = () => {
        setText(formatDisplay(value))
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setOpen(false)
            setShowYears(false)
        }
    }

    const selectDate = (d) => {
        onChange(toISO(d))
        setOpen(false)
        setShowYears(false)
    }

    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d))

    const prevYear = () => setViewYear((y) => y - 1)
    const nextYear = () => setViewYear((y) => y + 1)
    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
        else setViewMonth((m) => m - 1)
    }
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
        else setViewMonth((m) => m + 1)
    }

    const yearOptions = []
    for (let y = viewYear - 8; y <= viewYear + 8; y++) yearOptions.push(y)

    const isSameDay = (d) =>
        selected && d.getFullYear() === selected.getFullYear() && d.getMonth() === selected.getMonth() && d.getDate() === selected.getDate()

    const today = new Date()
    const isToday = (d) =>
        d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()

    return (
        <div className="relative" ref={wrapRef}>
            <div className="relative">
                <input
                    type="text"
                    value={text}
                    placeholder={placeholder}
                    onChange={(e) => handleText(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onFocus={openCalendar}
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => { e.preventDefault(); openCalendar() }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                    aria-label="Open calendar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>

            {open && (
                <div className="absolute top-full left-0 mt-1 z-50 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                            <button type="button" onClick={prevYear} className="w-7 h-7 rounded hover:bg-gray-100 text-xs font-semibold text-gray-600">«</button>
                            <button type="button" onClick={prevMonth} className="w-7 h-7 rounded hover:bg-gray-100 text-xs font-semibold text-gray-600">‹</button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowYears((s) => !s)}
                            className="px-2 py-1 rounded text-sm font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                        >
                            {MONTHS[viewMonth]} {viewYear}
                        </button>
                        <div className="flex gap-1">
                            <button type="button" onClick={nextMonth} className="w-7 h-7 rounded hover:bg-gray-100 text-xs font-semibold text-gray-600">›</button>
                            <button type="button" onClick={nextYear} className="w-7 h-7 rounded hover:bg-gray-100 text-xs font-semibold text-gray-600">»</button>
                        </div>
                    </div>

                    {showYears ? (
                        <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                            {yearOptions.map((y) => (
                                <button
                                    key={y}
                                    type="button"
                                    onClick={() => { setViewYear(y); setShowYears(false) }}
                                    className={`py-1 rounded text-sm font-medium hover:bg-blue-50 ${y === viewYear ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-700'}`}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {WEEKDAYS.map((w) => (
                                    <div key={w} className="text-center text-[10px] font-semibold text-gray-400 uppercase">{w}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {cells.map((d, i) => (
                                    d ? (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => selectDate(d)}
                                            className={`w-full aspect-square rounded text-xs font-medium hover:bg-blue-50 ${isSameDay(d) ? 'bg-blue-600 text-white font-bold hover:bg-blue-600' : isToday(d) ? 'text-blue-700 ring-1 ring-blue-300' : 'text-gray-700'}`}
                                        >
                                            {d.getDate()}
                                        </button>
                                    ) : (
                                        <div key={i} />
                                    )
                                ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => selectDate(new Date())}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Today
                                </button>
                                {selected && (
                                    <button
                                        type="button"
                                        onClick={() => { onChange(''); setOpen(false); setShowYears(false) }}
                                        className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
