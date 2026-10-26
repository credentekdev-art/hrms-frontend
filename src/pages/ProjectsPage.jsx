import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { api } from '../api/client'
import Toast from '../components/Toast'

export default function ProjectsPage(){
 const [items,setItems]=useState([]),[q,setQ]=useState(''),[toast,setToast]=useState(null)
 useEffect(()=>{api.get('/projects',{params:{include_inactive:true}}).then(r=>setItems(r.data||[])).catch(e=>setToast({type:'error',message:String(e.response?.data?.detail||'Unable to load projects')}))},[])
 const shown=items.filter(p=>`${p.code} ${p.name}`.toLowerCase().includes(q.toLowerCase()))
 return <><Toast toast={toast} onClose={()=>setToast(null)}/><header className="pageHeader"><div><span className="eyebrow">PROJECTS</span><h1>Projects</h1></div></header><section className="panelCard compactToolbar"><div className="searchField"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search projects"/></div></section><section className="tableCard modernTable"><table><thead><tr><th>Code</th><th>Project</th><th>Status</th></tr></thead><tbody>{shown.map(p=><tr key={p.id}><td>{p.code}</td><td><b>{p.name}</b></td><td><span className={`status ${p.active?'active':'completed'}`}>{p.active?'Active':'Completed'}</span></td></tr>)}</tbody></table>{!shown.length&&<div className="emptyState">No projects found.</div>}</section></>
}
