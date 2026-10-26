import { useMemo } from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'

const formatDate=d=>new Date(`${d}T00:00:00`).toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'short',year:'numeric'})
const status=s=>String(s||'').replaceAll('_',' ')

export default function CalendarAgenda({items,onSelect,total=0}){
  const groups=useMemo(()=>{const map=new Map();for(const item of items){const d=item.start_date||item.start;if(!map.has(d))map.set(d,[]);map.get(d).push(item)}return [...map.entries()]},[items])
  const flat=groups.flatMap(([,rows])=>rows),counts=groups.map(([,rows])=>rows.length)
  if(!groups.length)return <section className="agendaSurface panelCard"><div className="emptyState">No allocations in this date range.</div></section>
  return <section className="agendaSurface panelCard" aria-label="Agenda view"><GroupedVirtuoso className="agendaVirtuoso" groupCounts={counts} groupContent={index=><div className="virtualGroupHeader">{formatDate(groups[index][0])} <b>{groups[index][1].length}</b></div>} itemContent={index=>{const e=flat[index];return <button className={`agendaEventRow statusTone-${String(e.status).toLowerCase()}`} onClick={()=>onSelect(e.id)} aria-label={`Open ${e.employee_name} allocation on ${e.project_name}`}><span><strong>{e.employee_name}</strong><small>{e.project_name}</small></span><span>{e.allocation_percentage}%</span><span className="statusBadge">{status(e.status)}</span></button>}}/>{total>items.length&&<div className="agendaFooter">Showing {items.length} of {total} events in the visible range.</div>}</section>
}
