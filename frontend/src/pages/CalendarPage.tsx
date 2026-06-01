import React from 'react'
import { Calendar as CalIcon } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Calendar</h1>
      <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
        <CalIcon size={40} className="mb-4 text-violet-500" />
        <p className="text-slate-300 font-semibold">Calendar Integration Coming Soon</p>
        <p className="text-slate-500 text-sm mt-1">Connect your Google Calendar to sync tasks and workouts.</p>
        <button className="btn btn-primary mt-4">Connect Google Calendar</button>
      </div>
    </div>
  )
}
