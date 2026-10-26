import { useEffect, useState } from 'react'
import { CheckCircle2, Info, SlidersHorizontal } from 'lucide-react'
import { api } from '../api/client'
export default function SettingsPage(){
 const [value,setValue]=useState(3),[message,setMessage]=useState('')
 useEffect(()=>{api.get('/admin/capacity-config').then(({data})=>setValue(data.max_concurrent_projects))},[])
 const save=async()=>{await api.put('/admin/capacity-config',{max_concurrent_projects:Number(value)});setMessage('Capacity settings updated successfully.')}
 return <><header className="pageHeader"><div><span className="eyebrow">SETTINGS</span><h1>Capacity settings</h1><p>Configure the concurrent-project limit. Total overlapping employee allocation is always capped at 100%.</p></div></header><section className="settingsCardV2"><div className="settingsIcon"><SlidersHorizontal/></div><div className="grow"><h2>Allocation rules</h2><p>Allocation % is the share of an employee&apos;s total working time committed to one project for its allocation period.</p><label>Maximum concurrent projects<input type="number" min="1" max="20" value={value} onChange={e=>setValue(e.target.value)}/></label><div className="definitionCallout"><Info/><p><b>100% is a hard ceiling.</b> If an employee has 70% on Product, 15% on Support A and 15% on Support B, utilisation is 100% and no additional allocation can be added for that overlap.</p></div><button className="button primary" onClick={save}>Save changes</button>{message&&<div className="successBox"><CheckCircle2/>{message}</div>}</div></section></>
}
