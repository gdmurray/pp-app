'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Phone, CalendarCheck2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { colors } from '@/lib/design-tokens'
import { resolveOfficeColor } from '@/lib/offices'
import {
  patientFullName, patientApptDate, patientIsBooked, getOfficeColor,
  type Patient, type Office,
} from '@/lib/patient-utils'
import type { calls as CallsTable } from '@/db/schema'

type Mode = 'calls' | 'appointments'
type CalView = 'month' | 'week' | 'day'

interface CalendarViewProps {
  allPatients: Patient[]
  allCalls: (typeof CallsTable.$inferSelect)[]
  allOffices: Office[]
}

export function CalendarView({ allPatients, allCalls, allOffices }: CalendarViewProps) {
  const [mode, setMode] = useState<Mode>('appointments')
  const [calView, setCalView] = useState<CalView>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [officeFilter, setOfficeFilter] = useState<string>('all')

  const officeMap = useMemo(() => new Map(allOffices.map((o) => [o.id, o])), [allOffices])

  function navigate(dir: number) {
    const d = new Date(currentDate)
    if (calView === 'month') d.setMonth(d.getMonth() + dir)
    else if (calView === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setDate(d.getDate() + dir)
    setCurrentDate(d)
  }

  // Build calendar days for month view
  const calDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startPad = first.getDay()
    const days: Array<Date | null> = []
    for (let i = 0; i < startPad; i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }, [currentDate])

  // Events per date
  const events = useMemo(() => {
    const activeOffice = officeFilter === 'all' ? '' : officeFilter
    const map = new Map<string, Array<{ label: string; color: string; type: string }>>()
    function addEvent(dateStr: string, label: string, color: string, type: string) {
      if (!map.has(dateStr)) map.set(dateStr, [])
      map.get(dateStr)!.push({ label, color, type })
    }

    if (mode === 'appointments') {
      allPatients.filter(patientIsBooked).forEach((p) => {
        const d = patientApptDate(p)
        if (!d) return
        if (activeOffice) {
          const o = officeMap.get(p.officeId)
          if (o?.id !== activeOffice) return
        }
        const o = officeMap.get(p.officeId)
        addEvent(d, patientFullName(p), getOfficeColor(o), 'appt')
      })
    } else {
      allPatients.forEach((p) => {
        const d = p.recordedAt.toString().slice(0, 10)
        if (activeOffice) {
          const o = officeMap.get(p.officeId)
          if (o?.id !== activeOffice) return
        }
        const o = officeMap.get(p.officeId)
        addEvent(d, patientFullName(p), getOfficeColor(o), 'call')
      })
      allCalls.forEach((c) => {
        const d = c.recordedAt.toString().slice(0, 10)
        if (activeOffice) {
          const o = officeMap.get(c.officeId)
          if (o?.id !== activeOffice) return
        }
        const label = c.type === 'missed' ? 'Missed Call' : 'No Lead'
        addEvent(d, label, c.type === 'missed' ? colors.destructive : colors.warning, c.type)
      })
    }
    return map
  }, [mode, allPatients, allCalls, officeFilter, officeMap])

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const headerLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
    ...(calView === 'day' ? { day: 'numeric' } : {}),
  })

  return (
    <div className="p-7 space-y-5">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Mode toggle */}
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => { if (v) setMode(v as Mode) }}
          variant="outline"
          size="sm"
          spacing={0}
          className="border border-border rounded-lg bg-card"
        >
          <ToggleGroupItem value="appointments" aria-label="Appointments" className="gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:border-primary">
            <CalendarCheck2 size={13} />
            Appointments
          </ToggleGroupItem>
          <ToggleGroupItem value="calls" aria-label="Calls" className="gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:border-primary">
            <Phone size={13} />
            Calls
          </ToggleGroupItem>
        </ToggleGroup>

        {/* View toggle */}
        <ToggleGroup
          type="single"
          value={calView}
          onValueChange={(v) => { if (v) setCalView(v as CalView) }}
          variant="outline"
          size="sm"
          spacing={0}
          className="border border-border rounded-lg bg-card"
        >
          {(['month', 'week', 'day'] as const).map((v) => (
            <ToggleGroupItem key={v} value={v} className="capitalize data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:border-primary">
              {v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* Office filter */}
        <ToggleGroup
          type="single"
          value={officeFilter}
          onValueChange={(v) => { if (v) setOfficeFilter(v) }}
          variant="outline"
          size="sm"
          spacing={0}
          className="border border-border rounded-lg bg-card"
        >
          <ToggleGroupItem value="all" className="data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:border-primary">
            All
          </ToggleGroupItem>
          {allOffices.map((o) => (
            <ToggleGroupItem
              key={o.id}
              value={o.id}
              className="data-[state=on]:text-white"
              style={officeFilter === o.id ? { backgroundColor: resolveOfficeColor(o), borderColor: resolveOfficeColor(o) } : {}}
            >
              {o.abbr}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* Navigation */}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-bold text-foreground min-w-36 text-center">{headerLabel}</span>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)} className="h-8 w-8">
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="ml-1 text-primary border-primary hover:bg-accent"
          >
            Today
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        {allOffices.map((o) => (
          <div key={o.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: resolveOfficeColor(o) }} />
            {o.name}
          </div>
        ))}
        {mode === 'calls' && (
          <>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
              Missed Call
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-pp-orange" />
              No Lead
            </div>
          </>
        )}
      </div>

      {/* Month grid */}
      {calView === 'month' && (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} className="min-h-24 border-r border-b border-muted" />
              const dateStr = day.toISOString().slice(0, 10)
              const dayEvents = events.get(dateStr) ?? []
              const isToday = dateStr === todayStr
              return (
                <div
                  key={dateStr}
                  className={cn(
                    'min-h-24 p-2 border-r border-b border-muted last:border-r-0',
                    isToday && 'bg-accent',
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                      isToday ? 'bg-primary text-white' : 'text-muted-foreground',
                    )}
                  >
                    {day.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev, j) => (
                      <div
                        key={j}
                        className="text-[10px] font-medium text-white px-1 py-0.5 rounded truncate"
                        style={{ backgroundColor: ev.color }}
                      >
                        {ev.label}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground font-medium px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week view */}
      {calView === 'week' && (
        <WeekView currentDate={currentDate} events={events} />
      )}

      {/* Day view */}
      {calView === 'day' && (
        <DayView currentDate={currentDate} events={events} />
      )}
    </div>
  )
}

function WeekView({ currentDate, events }: { currentDate: Date; events: Map<string, Array<{ label: string; color: string; type: string }>> }) {
  const weekStart = new Date(currentDate)
  weekStart.setDate(currentDate.getDate() - currentDate.getDay())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {days.map((d) => {
          const dateStr = d.toISOString().slice(0, 10)
          return (
            <div key={dateStr} className={cn('p-3 border-r border-border last:border-r-0', dateStr === todayStr && 'bg-accent')}>
              <div className="text-xs font-bold text-muted-foreground uppercase">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={cn('text-sm font-bold mt-0.5', dateStr === todayStr ? 'text-primary' : 'text-foreground')}>
                {d.getDate()}
              </div>
              <div className="mt-2 space-y-1 min-h-12">
                {(events.get(dateStr) ?? []).map((ev, i) => (
                  <div key={i} className="text-[10px] font-medium text-white px-1.5 py-0.5 rounded truncate" style={{ backgroundColor: ev.color }}>
                    {ev.label}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DayView({ currentDate, events }: { currentDate: Date; events: Map<string, Array<{ label: string; color: string; type: string }>> }) {
  const dateStr = currentDate.toISOString().slice(0, 10)
  const dayEvents = events.get(dateStr) ?? []

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h3 className="text-sm font-bold text-foreground mb-4">
        {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </h3>
      {dayEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No events scheduled for this day.</p>
      ) : (
        <div className="space-y-2">
          {dayEvents.map((ev, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
              <span className="text-sm font-medium text-foreground">{ev.label}</span>
              <span className="text-xs text-muted-foreground ml-auto capitalize">{ev.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
