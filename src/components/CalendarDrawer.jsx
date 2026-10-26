import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { api } from '../api/client'

const fmt=d=>d?new Date(`${d}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'
const status=s=>String(s||'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())

export default function CalendarDrawer({drawer,filters,onClose,onOpenEvent}){
  const [data,setData]=useState(null),[items,setItems]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[offset,setOffset]=useState(0)
  const limit=20
  useEffect(()=>{if(!drawer)return;const controller=new AbortController();setLoading(true);setError('');if(drawer.mode==='detail')api.get(`/calendar/events/${drawer.id}`,{signal:controller.signal}).then(r=>setData(r.data)).catch(e=>{if(e.code!=='ERR_CANCELED')setError(e.response?.data?.detail||'Could not load event details.')}).finally(()=>setLoading(false));else api.get('/calendar/events',{params:{...filters,start:drawer.date,end:drawer.date,limit,offset},signal:controller.signal}).then(r=>{setItems(r.data.items||[]);setData(r.data)}).catch(e=>{if(e.code!=='ERR_CANCELED')setError(e.response?.data?.detail||'Could not load day details.')}).finally(()=>setLoading(false));return()=>controller.abort()},[drawer?.mode,drawer?.id,drawer?.date,offset,JSON.stringify(filters)])
  if(!drawer)return null
  return <><button className="drawerScrim" aria-label="Close calendar details" onClick={onClose}/><aside className="calendarDetailDrawer" aria-label={drawer.mode==='detail'?'Allocation details':'Day allocations'}>
    <header><div><span>{drawer.mode==='detail'?'Allocation details':fmt(drawer.date)}</span><strong>{drawer.mode==='detail'?(data?.title||'Allocation'):'Day allocations'}</strong></div><button className="topbarIcon" aria-label="Close details" onClick={onClose}><X/></button></header>
    {loading?<div className="drawerSkeleton">{Array.from({length:7},(_,i)=><span key={i}/>)}</div>:error?<div className="errorBox">{error}</div>:drawer.mode==='day'?<div className="calendarDayResults">{items.length?items.map(e=><button key={e.id} onClick={()=>onOpenEvent(e.id)}><span><strong>{e.employee_name}</strong><small>{e.project_name}</small></span><b>{e.allocation_percentage}%</b><em>{status(e.status)}</em></button>):<div className="emptyState">No allocations on this day.</div>}</div>:data&&<div className="calendarDetailBody">
      <div className="detailPair"><span>Employee</span><strong>{data.employee_name}</strong></div><div className="detailPair"><span>Project</span><strong>{data.project_name}</strong></div>
      <div className="detailPair"><span>Allocation</span><strong>{data.allocation_percentage}%</strong></div><div className="detailPair"><span>Status</span><strong>{status(data.status)}</strong></div>
      <div className="detailPair"><span>Start</span><strong>{fmt(data.start_date)}</strong></div><div className="detailPair"><span>End</span><strong>{fmt(data.planned_end_date||data.end_date)}</strong></div>
      <div className="detailPair"><span>Allocated by</span><strong>{data.allocated_by}</strong></div><div className="detailPair"><span>Manager</span><strong>{data.project_manager}</strong></div>
      {(data.release_date||data.release_reason)&&<section className="drawerSection"><h3>Release</h3><div className="detailPair"><span>Release date</span><strong>{fmt(data.release_date)}</strong></div><div className="detailPair"><span>Reason</span><strong>{data.release_reason||status(data.release_reason_type)}</strong></div>{data.released_by&&<div className="detailPair"><span>Released by</span><strong>{data.released_by}</strong></div>}</section>}
      <section className="drawerSection"><h3>Latest feedback</h3>{data.feedback?<><div className="feedbackScore">{'★'.repeat(data.feedback.rating||0)} <span>{data.feedback.rating}/5</span></div><p>{data.feedback.description}</p>{data.feedback.edited_at&&<small>Edited {new Date(data.feedback.edited_at).toLocaleString('en-IN')}</small>}</>:<p className="muted">No feedback yet</p>}</section>
    </div>}
    {drawer.mode==='day'&&data&&<footer className="drawerPagination"><button disabled={offset===0} onClick={()=>setOffset(v=>Math.max(0,v-limit))}><ChevronLeft/></button><span>{offset+1}–{Math.min(offset+limit,data.total||0)} of {data.total||0}</span><button disabled={!data.has_more} onClick={()=>setOffset(v=>v+limit)}><ChevronRight/></button></footer>}
  </aside></>
}
