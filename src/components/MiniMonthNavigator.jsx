import { ChevronLeft, ChevronRight } from 'lucide-react'

const iso=d=>{const x=new Date(d);x.setMinutes(x.getMinutes()-x.getTimezoneOffset());return x.toISOString().slice(0,10)}
const sameDay=(a,b)=>iso(a)===iso(b)

export default function MiniMonthNavigator({value,onChange}){
  const anchor=new Date(`${value}T00:00:00`)
  const first=new Date(anchor.getFullYear(),anchor.getMonth(),1)
  const gridStart=new Date(first);gridStart.setDate(first.getDate()-first.getDay())
  const days=Array.from({length:42},(_,i)=>{const d=new Date(gridStart);d.setDate(gridStart.getDate()+i);return d})
  const move=delta=>{const d=new Date(anchor);d.setMonth(d.getMonth()+delta);onChange(iso(d))}
  return <section className="miniCalendar" aria-label="Mini month navigator">
    <header><button aria-label="Previous month" onClick={()=>move(-1)}><ChevronLeft/></button><strong>{anchor.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</strong><button aria-label="Next month" onClick={()=>move(1)}><ChevronRight/></button></header>
    <div className="miniWeekdays">{['S','M','T','W','T','F','S'].map((d,i)=><span key={`${d}${i}`}>{d}</span>)}</div>
    <div className="miniDays">{days.map(d=><button key={iso(d)} className={`${d.getMonth()!==anchor.getMonth()?'outside':''} ${sameDay(d,new Date())?'today':''} ${sameDay(d,anchor)?'selected':''}`} aria-label={d.toLocaleDateString('en-US',{dateStyle:'full'})} onClick={()=>onChange(iso(d))}>{d.getDate()}</button>)}</div>
  </section>
}
