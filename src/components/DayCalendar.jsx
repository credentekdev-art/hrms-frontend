import { statusLabel } from '../utils/allocation'
export default function DayCalendar({date,items,onSelect}){
  const label=new Date(`${date}T00:00:00`).toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
  return <section className="dayCalendar calendarSurface"><header><span className="eyebrow">DAY VIEW</span><h2>{label}</h2><p>{items.length} allocation{items.length===1?'':'s'} in this filtered view.</p></header><div className="dayCalendarList">{items.map(a=><button key={a.id} className={`dayAllocationCard calendarStatus-${String(a.status).toLowerCase()}`} onClick={()=>onSelect?.(a)}><div><strong>{a.employee_name}</strong><span>{a.employee_code}{a.project_name?` · ${a.project_name}`:''}</span></div><b>{a.allocation_percentage}%</b><span className={`status ${String(a.status).toLowerCase()}`}>{statusLabel(a.status)}</span></button>)}{!items.length&&<div className="emptyState">No allocations for this day.</div>}</div></section>
}
