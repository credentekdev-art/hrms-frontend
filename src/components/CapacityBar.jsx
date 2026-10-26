import { utilizationClass } from '../utils/allocation'

export default function CapacityBar({ allocations=[], projects=[], label=true }){
  const projectMap=Object.fromEntries(projects.map(p=>[p.id,p]))
  const active=allocations.filter(a=>!['COMPLETED','RELEASED_EARLY','RELEASED','CANCELLED'].includes(a.status))
  const total=active.reduce((s,a)=>s+Number(a.allocation_percentage||0),0)
  let cursor=0
  const segments=active.map((a,index)=>{const width=Math.max(0,Math.min(100-cursor,Number(a.allocation_percentage)||0));const x=cursor;cursor+=width;return{a,index,width,x}})
  return <div className="capacityBarWrap">
    {label&&<div className="capacityBarLabel"><b>{Math.round(total)}% allocated</b><span>{Math.max(0,100-total)}% available</span></div>}
    <div className={`capacityBar ${utilizationClass(total)}`} aria-label={`${total}% allocated, ${Math.max(0,100-total)}% available`}>
      <svg viewBox="0 0 100 18" preserveAspectRatio="none" role="img" aria-hidden="true">{segments.map(({a,index,width,x})=><rect key={a.id} className={`capacitySvgSegment segment${index%3}`} x={x} y="0" width={width} height="18"><title>{projectMap[a.project_id]?.name||`Project ${a.project_id}`}: {a.allocation_percentage}%</title></rect>)}{cursor<100&&<rect className="capacitySvgAvailable" x={cursor} y="0" width={100-cursor} height="18"/>}</svg>
    </div>
    <div className="capacityLegendInline">{active.map(a=><span key={a.id}><i/> {projectMap[a.project_id]?.code||a.project_id} {a.allocation_percentage}%</span>)}</div>
  </div>
}
