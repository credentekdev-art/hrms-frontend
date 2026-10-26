import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Info, LoaderCircle, Search, Star, X } from 'lucide-react'
import { api } from '../api/client'

const PAGE_SIZE=25

export default function EligibleEmployeePicker({criteria,value,onChange,maxSelections=1,savedEmployees=[],requestId=null,onEligibilityChange,onEmployeeSelected,error}){
  const [open,setOpen]=useState(false),[q,setQ]=useState(''),[items,setItems]=useState([]),[selectedEligibleIds,setSelectedEligibleIds]=useState([]),[loading,setLoading]=useState(false),[message,setMessage]=useState(''),[offset,setOffset]=useState(0),[hasMore,setHasMore]=useState(false),[selectedCache,setSelectedCache]=useState({})
  const controller=useRef(null)
  const key=JSON.stringify(criteria)

  const load=async(nextOffset=0,append=false)=>{
    controller.current?.abort();controller.current=new AbortController();setLoading(true);setMessage('')
    try{
      const params={q:q||undefined,request_id:requestId||undefined,selected_employee_ids:value.length?value.join(','):undefined,limit:PAGE_SIZE,offset:nextOffset};for(const [k,v] of Object.entries(criteria)){if(v!==null&&v!==undefined&&v!==''&&v!==0)params[k]=v}
      const {data}=await api.get('/requests/eligible-employees',{params,signal:controller.current.signal})
      const next=data.items||[];const selectedOk=data.selected_eligible_ids||[]
      setItems(current=>append?[...current,...next]:next);setSelectedEligibleIds(selectedOk);setOffset(nextOffset);setHasMore(Boolean(data.has_more))
      setSelectedCache(current=>{const copy={...current};for(const employee of next)copy[employee.employee_id||employee.id]=employee;return copy})
      onEligibilityChange?.(append?[...items,...next]:next,selectedOk)
      if(!append&&!next.length)setMessage('No employees are available for the selected dates and criteria')
    }catch(e){if(e.code!=='ERR_CANCELED'){if(!append)setItems([]);setHasMore(false);setMessage(e.response?.data?.detail?.message||e.response?.data?.detail||'Unable to load eligible employees')}}finally{setLoading(false)}
  }

  useEffect(()=>{
    const timer=setTimeout(()=>load(0,false),300)
    return()=>{clearTimeout(timer);controller.current?.abort()}
  },[key,q,requestId,value.join(',')])

  useEffect(()=>{
    if(savedEmployees.length)setSelectedCache(current=>{const copy={...current};for(const employee of savedEmployees)copy[employee.employee_id||employee.id]=employee;return copy})
  },[savedEmployees])

  const map=useMemo(()=>Object.fromEntries([...Object.values(selectedCache),...items,...savedEmployees].map(x=>[x.employee_id||x.id,x])),[items,savedEmployees,selectedCache])
  const missingSelected=value.map(id=>map[id]).filter(Boolean).filter(employee=>!items.some(i=>(i.employee_id||i.id)===(employee.employee_id||employee.id)))
  const toggle=item=>{
    const id=item.employee_id||item.id
    if(value.includes(id)){
      onChange(value.filter(x=>x!==id))
      return
    }
    if(value.length>=maxSelections)return
    setSelectedCache(current=>({...current,[id]:item}))
    onChange([...value,id])
    onEmployeeSelected?.(item)
    setOpen(false)
    setQ('')
  }

  return <div className={`eligibleEmployeePicker ${error?'fieldInvalid':''}`}><span className="eligibleEmployeeLabel">Employee</span>
    <button type="button" className="employeePickerControl" data-field="employee_ids" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label="Select eligible employee"><span>{value.length?value.map(id=>map[id]?.name||`Employee ${id}`).join(', '):'Select employee'}</span><ChevronDown/></button>
    {open&&<div className="eligibleEmployeeMenu"><div className="eligibleEmployeeSearch"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search employee" aria-label="Search eligible employees"/>{loading&&<LoaderCircle className="spin"/>}{q&&<button type="button" aria-label="Clear employee search" onClick={()=>setQ('')}><X/></button>}</div>
      {missingSelected.map(e=>{const id=e.employee_id||e.id,stillEligible=selectedEligibleIds.includes(id);return <div role="button" tabIndex={0} className={`eligibleEmployeeRow ${stillEligible?'':'warningRow'}`} key={`selected-${id}`} onClick={()=>toggle(e)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle(e)}}}><span className="employeeIdentity"><strong>{e.name}</strong><small>{e.employee_code} · {stillEligible?'Selected and eligible':'Selected employee no longer matches the current dates or criteria'}</small></span><span>{e.experience!=null?`${Number(e.experience).toFixed(1)} yrs`:'—'}</span><span>{e.skill_proficiency||'—'}</span><span className="rating">{e.last_feedback_rating!=null?<><Star fill="currentColor"/>{e.last_feedback_rating}/5</>:'No rating'}</span><span/><Check/></div>})}
      {items.map(e=><div role="button" tabIndex={0} className="eligibleEmployeeRow" key={e.employee_id} onClick={()=>toggle(e)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle(e)}}}><span className="employeeIdentity"><strong>{e.name}</strong><small>{e.employee_code} · {e.available_allocation_percentage}% available</small></span><span>{e.experience!=null?`${Number(e.experience).toFixed(1)} yrs`:'—'}</span><span>{e.skill_proficiency||'—'}</span><span className="rating">{e.last_feedback_rating!=null?<><Star fill="currentColor"/>{e.last_feedback_rating}/5</>:'No rating'}</span><span className="infoPopoverWrap" onClick={ev=>ev.stopPropagation()}><button type="button" className="infoButton" aria-label={`Last feedback for ${e.name}`}><Info/></button><span className="infoPopover" role="tooltip">{e.last_feedback_description||'No feedback yet'}</span></span>{value.includes(e.employee_id)&&<Check/>}</div>)}
      {hasMore&&<button type="button" className="eligibleLoadMore" disabled={loading} onClick={()=>load(offset+PAGE_SIZE,true)}>{loading?'Loading…':'Load more employees'}</button>}
      {message&&<div className="autocompleteState">{message}</div>}
    </div>}
    {error&&<span className="fieldError">{error}</span>}
  </div>
}
