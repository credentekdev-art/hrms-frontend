import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LoaderCircle, Search, X } from 'lucide-react'
import { api } from '../api/client'

const PAGE_SIZE=50

export default function MasterAutocomplete({label,value,selectedLabel,onChange,endpoint,placeholder='Search',required=false,disabled=false,error,name,itemsOverride=null}){
  const [query,setQuery]=useState(selectedLabel||''),[items,setItems]=useState([]),[open,setOpen]=useState(false),[loading,setLoading]=useState(false),[hasMore,setHasMore]=useState(false),[offset,setOffset]=useState(0)
  const controller=useRef(null)
  useEffect(()=>{setQuery(selectedLabel||'')},[selectedLabel,value])

  const load=async(term='',nextOffset=0,append=false)=>{
    controller.current?.abort();controller.current=new AbortController();setLoading(true)
    try{
      if(itemsOverride){const normalized=itemsOverride.filter(x=>!term||x.name.toLowerCase().includes(term.toLowerCase()));setItems(normalized);setOffset(0);setHasMore(false);return}
      const {data}=await api.get(endpoint,{params:{q:term,status:'active',limit:PAGE_SIZE,offset:nextOffset},signal:controller.current.signal})
      const next=data.items||[]
      setItems(current=>append?[...current,...next]:next)
      setOffset(nextOffset)
      setHasMore(Boolean(data.has_more))
    }catch(e){if(e.code!=='ERR_CANCELED'){if(!append)setItems([]);setHasMore(false)}}finally{setLoading(false)}
  }

  useEffect(()=>{
    if(!open || (value && query===selectedLabel))return
    const timer=setTimeout(()=>load(query.trim(),0,false),300)
    return()=>{clearTimeout(timer);controller.current?.abort()}
  },[query,open,endpoint,value,selectedLabel])

  const choose=item=>{onChange(item);setQuery(item.name);setOpen(false)}
  const clear=()=>{onChange(null);setQuery('');setOpen(true)}
  const openList=()=>{setOpen(true);if(!open)load('',0,false)}

  return <label className={`masterAutocomplete ${error?'fieldInvalid':''}`}>{label}
    <div className="autocompleteInput"><Search/><input name={name} disabled={disabled} value={query} onFocus={openList} onChange={e=>{setQuery(e.target.value);setOpen(true);if(value)onChange(null)}} placeholder={placeholder} autoComplete="off" aria-invalid={Boolean(error)} aria-autocomplete="list"/><button type="button" className="fieldIconButton" aria-label={value?`Clear ${label}`:`Open ${label}`} disabled={disabled} onClick={()=>value?clear():openList()}>{value?<X/>:<ChevronDown/>}</button>{loading&&<LoaderCircle className="spin" aria-label={`Loading ${label.toLowerCase()}`}/>}</div>
    {error&&<span className="fieldError">{error}</span>}
    {open&&!disabled&&<div className="autocompleteMenu masterMenu" role="listbox">{loading&&!items.length?<div className="autocompleteState">Loading…</div>:items.length?<>{items.map(item=><button type="button" role="option" aria-selected={Number(value)===item.id} key={item.id} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(item)}>{item.name}{item.category&&<small>{item.category}</small>}</button>)}{hasMore&&<button type="button" className="autocompleteLoadMore" onMouseDown={e=>e.preventDefault()} disabled={loading} onClick={()=>load(query.trim(),offset+PAGE_SIZE,true)}>{loading?'Loading…':'Load more'}</button>}</>:<div className="autocompleteState">No matches found</div>}</div>}
  </label>
}
