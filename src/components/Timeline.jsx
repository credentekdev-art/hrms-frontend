import { DndContext, PointerSensor, useDraggable, useSensor, useSensors } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { api } from '../api/client'

const CELL = 46
const LABEL = 230
const colors = ['#46c2ff','#8b7cff','#34d399','#fb7185','#fbbf24','#22d3ee']
const dayMs = 86400000
const iso = d => d.toISOString().slice(0,10)
const addDays = (s, n) => { const d = new Date(`${s}T00:00:00`); d.setDate(d.getDate()+n); return iso(d) }
const diffDays = (a,b) => Math.round((new Date(`${a}T00:00:00`) - new Date(`${b}T00:00:00`))/dayMs)

function DraggableAllocation({ allocation, project, rangeStart, editable, top, onSelect }) {
  const {attributes,listeners,setNodeRef,transform,isDragging} = useDraggable({id:`alloc-${allocation.id}`,disabled:!editable,data:{allocation}})
  const left = diffDays(allocation.start_date, rangeStart) * CELL + LABEL + 3
  const width = (diffDays(allocation.end_date, allocation.start_date)+1) * CELL - 6
  const historical=['COMPLETED','RELEASED_EARLY','RELEASED','CANCELLED'].includes(allocation.status)
  const style = { left, width, top, transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, background: historical ? '#9aa6b2' : colors[allocation.project_id % colors.length], opacity: isDragging ? .75 : historical ? .62 : 1 }
  return <div ref={setNodeRef} className="allocationBar" style={style} {...attributes} {...listeners} onDoubleClick={()=>onSelect?.(allocation)} title={`Open details · ${project?.name || ''} · ${allocation.allocation_percentage}%`}>
    {editable && <GripVertical size={14}/>}<span>{project?.code || `P${allocation.project_id}`}</span><b>{allocation.allocation_percentage}%</b>
  </div>
}

export default function Timeline({ employees, projects, allocations, rangeStart, days=28, editable=false, onChanged, onError, onSelect }) {
  const sensors = useSensors(useSensor(PointerSensor,{activationConstraint:{distance:6}}))
  const dateCells = Array.from({length:days},(_,i)=>{ const d=new Date(`${rangeStart}T00:00:00`); d.setDate(d.getDate()+i); return d })
  const projectMap = Object.fromEntries(projects.map(p=>[p.id,p]))

  const dragEnd = async ({active,delta}) => {
    if (!editable || !active.data.current?.allocation) return
    const shift = Math.round(delta.x/CELL)
    if (!shift) return
    const a = active.data.current.allocation
    try {
      await api.patch(`/allocations/${a.id}`, {start_date:addDays(a.start_date,shift), end_date:addDays(a.end_date,shift), allocation_percentage:a.allocation_percentage})
      onChanged?.()
    } catch (e) {
      const detail=e.response?.data?.detail
      onError?.(typeof detail==='string'?detail:detail?.conflicts?.[0]?.reason || detail?.message || 'This assignment could not be moved because the employee is not available for the new dates.')
    }
  }

  return <DndContext sensors={sensors} onDragEnd={dragEnd}>
    <div className="timelineWrap">
      <div className="timeline" style={{minWidth: LABEL + days*CELL}}>
        <div className="timelineHeader" style={{gridTemplateColumns:`${LABEL}px repeat(${days}, ${CELL}px)`}}>
          <div className="stickyName headerName">RESOURCE</div>
          {dateCells.map(d=><div key={iso(d)} className={`dateCell ${[0,6].includes(d.getDay())?'weekend':''}`}><small>{d.toLocaleDateString('en-US',{weekday:'short'})}</small><b>{d.getDate()}</b></div>)}
        </div>
        {employees.map(emp => {
          const rows = allocations.filter(a=>a.employee_id===emp.id && a.end_date>=rangeStart && a.start_date<=iso(dateCells.at(-1)))
          return <div className="timelineRow" key={emp.id} style={{height: Math.max(64, 14 + Math.max(1,rows.length)*42)}}>
            <div className="stickyName employeeCell"><div className="avatar">{emp.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><strong>{emp.name}</strong><span>{emp.designation}</span></div></div>
            <div className="gridBackdrop" style={{left:LABEL,gridTemplateColumns:`repeat(${days}, ${CELL}px)`}}>{dateCells.map(d=><div key={iso(d)} className={[0,6].includes(d.getDay())?'weekend':''}></div>)}</div>
            {rows.map((a,index)=><DraggableAllocation key={a.id} allocation={a} project={projectMap[a.project_id]} rangeStart={rangeStart} editable={editable && !a.scheduled_release_date && !['COMPLETED','RELEASED_EARLY','RELEASED','CANCELLED'].includes(a.status)} top={10+index*42} onSelect={onSelect}/>)}
          </div>
        })}
      </div>
    </div>
  </DndContext>
}
