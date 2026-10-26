import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, Search } from 'lucide-react'
import { api } from '../api/client'

export default function AutocompleteField({label,value,onChange,endpoint,placeholder,error}){
  const [items,setItems]=useState([]),[loading,setLoading]=useState(false),[open,setOpen]=useState(false)
  const controller=useRef(null)
  useEffect(()=>{
    const term=(value||'').trim()
    if(term.length<2){setItems([]);setLoading(false);setOpen(false);return}
    const timer=setTimeout(async()=>{
      controller.current?.abort();controller.current=new AbortController();setLoading(true)
      try{const {data}=await api.get(endpoint,{params:{q:term,limit:8,offset:0},signal:controller.current.signal});setItems(data.items||[]);setOpen(true)}
      catch(e){if(e.code!=='ERR_CANCELED')setItems([])}finally{setLoading(false)}
    },300)
    return()=>{clearTimeout(timer);controller.current?.abort()}
  },[value,endpoint])
  return <label className="autocompleteField">{label}<div className="autocompleteInput"><Search/><input value={value||''} onChange={e=>{onChange(e.target.value);setOpen(true)}} onFocus={()=>value?.trim().length>=2&&setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),120)} placeholder={placeholder} autoComplete="off" aria-invalid={Boolean(error)}/>{loading&&<LoaderCircle className="spin" aria-label={`Loading ${label.toLowerCase()} results`}/>}</div>{error&&<span className="fieldError">{error}</span>}{open&&value?.trim().length>=2&&<div className="autocompleteMenu" role="listbox">{loading?<div className="autocompleteState">Searching…</div>:items.length?items.map(item=><button type="button" role="option" key={item} onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange(item);setOpen(false)}}>{item}</button>):<div className="autocompleteState">No matches found</div>}</div>}</label>
}
