import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, CheckCircle2, ClipboardCheck, Clock3, Plus, Sparkles, UsersRound } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import RoleGate from '../components/RoleGate'
import { allocationCoversDate } from '../utils/allocation'

const todayIso = () => new Date().toISOString().slice(0,10)
const formatDate = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})

export default function DashboardPage(){
  const {user}=useAuth()
  const [summary,setSummary]=useState({})
  const [employees,setEmployees]=useState([])
  const [projects,setProjects]=useState([])
  const [allocations,setAllocations]=useState([])
  const [requests,setRequests]=useState([])
  const navigate=useNavigate()

  const load=async()=>{
    const today=todayIso(); const end=new Date(); end.setDate(end.getDate()+30)
    const [s,e,p,a,r]=await Promise.all([
      api.get('/dashboard/summary'), api.get('/employees'), api.get('/projects',{params:{include_inactive:true}}),
      api.get('/allocations',{params:{start:today,end:end.toISOString().slice(0,10)}}), api.get('/requests')
    ])
    setSummary(s.data); setEmployees(e.data); setProjects(p.data); setAllocations(a.data); setRequests(r.data)
  }
  useEffect(()=>{load()},[])

  const projectMap=Object.fromEntries(projects.map(p=>[p.id,p]))
  const employeeMap=Object.fromEntries(employees.map(e=>[e.id,e]))
  const today=todayIso()
  const live=allocations.filter(a=>allocationCoversDate(a,today))
  const utilization=useMemo(()=>employees.map(emp=>({
    ...emp,
    pct:live.filter(a=>a.employee_id===emp.id).reduce((sum,a)=>sum+Number(a.allocation_percentage),0)
  })).sort((a,b)=>b.pct-a.pct),[employees,allocations])
  const upcoming=[...allocations].filter(a=>a.start_date>=today).sort((a,b)=>a.start_date.localeCompare(b.start_date)).slice(0,5)
  const pending=requests.filter(r=>['SUBMITTED','UNDER_REVIEW'].includes(r.status)).length
  const fulfilled=requests.filter(r=>r.status==='FULFILLED').length
  const completedProjects=projects.filter(p=>!p.active)

  const cards=[
    {label:'Team members',value:summary.visible_resources||employees.length||0,icon:UsersRound,note:'Visible in your workspace'},
    {label:'Current assignments',value:live.length,icon:CalendarClock,note:'Active today'},
    {label:'Requests to review',value:pending||summary.pending_requests||0,icon:ClipboardCheck,note:'Awaiting next action'},
    {label:'Completed requests',value:fulfilled,icon:CheckCircle2,note:'Successfully assigned'},
  ]

  return <>
    <header className="pageHeader dashboardHeader">
      <div><span className="eyebrow">KRITIKA AI · RESOURCE MANAGEMENT</span><h1>Good afternoon, {user?.full_name?.split(' ')[0]}</h1><p>Here’s what’s happening with your team, assignments and resource requests.</p></div>
      <RoleGate allow={['MANAGER','RM_TEAM','ADMIN']}><button className="button primary" onClick={()=>navigate('/requests?mode=create')}><Plus size={17}/>New resource request</button></RoleGate>
    </header>

    <section className="metricGrid">{cards.map(({label,value,icon:Icon,note})=><article className="metricCard" key={label}><div className="metricIcon"><Icon/></div><div className="metricCopy"><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article>)}</section>

    <section className="dashboardGrid">
      <article className="panelCard teamLoadCard">
        <div className="panelHeading"><div><span className="eyebrow">TEAM SNAPSHOT</span><h2>Workload today</h2></div><span className="softBadge"><Sparkles size={14}/>Live view</span></div>
        <div className="utilizationList">
          {utilization.slice(0,6).map(emp=><div className="utilizationRow" key={emp.id}>
            <div className="employeeMini"><div className="avatar">{emp.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><strong>{emp.name}</strong><span>{emp.designation?.name||emp.designation_name||'—'}</span></div></div>
            <progress className="loadTrack" max="100" value={Math.min(100,emp.pct)} aria-label={`${emp.name} allocated ${emp.pct}%`}/><div className="capacityText"><b className={emp.pct>100?'loadHigh':emp.pct>=80?'loadMedium':'loadLow'}>{emp.pct}% allocated</b><span>{Math.max(0,100-emp.pct)}% available</span></div>
          </div>)}
          {!utilization.length&&<div className="emptyState compact">No team members are available yet.</div>}
        </div>
      </article>

      <article className="panelCard upcomingCard">
        <div className="panelHeading"><div><span className="eyebrow">NEXT UP</span><h2>Upcoming assignments</h2></div><Clock3 size={19}/></div>
        <div className="upcomingList">{upcoming.map(a=><div className="upcomingItem" key={a.id}>
          <div className="dateTile"><b>{formatDate(a.start_date).split(' ')[0]}</b><span>{formatDate(a.start_date).split(' ')[1]}</span></div>
          <div className="grow"><strong>{employeeMap[a.employee_id]?.name||`Employee ${a.employee_id}`}</strong><span>{projectMap[a.project_id]?.name||`Project ${a.project_id}`}</span></div>
          <span className="allocationPill">{a.allocation_percentage}%</span>
        </div>)}{!upcoming.length&&<div className="emptyState compact">No upcoming assignments in the next 30 days.</div>}</div>
      </article>
    </section>

    <section className="dashboardGrid lower">
      <article className="panelCard quickStatusCard">
        <div className="panelHeading"><div><span className="eyebrow">REQUEST ACTIVITY</span><h2>Request progress</h2></div></div>
        <div className="requestSummary five">
          <div><span className="summaryDot blue"/><strong>{requests.filter(r=>r.status==='DRAFT').length}</strong><small>Draft</small></div><div><span className="summaryDot blue"/><strong>{requests.filter(r=>r.status==='SUBMITTED').length}</strong><small>Submitted</small></div>
          <div><span className="summaryDot amber"/><strong>{requests.filter(r=>r.status==='UNDER_REVIEW').length}</strong><small>In review</small></div>
          <div><span className="summaryDot green"/><strong>{fulfilled}</strong><small>Assigned</small></div>
          <div><span className="summaryDot red"/><strong>{requests.filter(r=>r.status==='REJECTED').length}</strong><small>Declined</small></div>
        </div>
      </article>
      <article className="panelCard helpfulCard">
        <div className="helpfulIcon"><CalendarClock/></div><div><span className="eyebrow">PLAN AHEAD</span><h2>See the month at a glance</h2><p>Use the allocation calendar to spot busy periods, available team members and upcoming project starts.</p></div>
      </article>
    </section>

    {completedProjects.length>0&&<section className="completedProjectsSection"><div className="panelHeading"><div><span className="eyebrow">COMPLETED PROJECTS</span><h2>Completed projects</h2></div></div><div className="completedProjectGrid">{completedProjects.map(p=><article className="completedProjectCard" key={p.id}><div><strong>{p.name}</strong><div className="completedProjectMeta"><span>Project code</span><b>{p.code}</b><span>Status</span><b>Completed</b></div></div><div className="completedProjectActions"><button className="button ghost sm" onClick={()=>navigate(`/requests?project=${p.id}`)}>Requests</button><button className="button primary sm" onClick={()=>navigate(`/allocations?project=${p.id}`)}>Allocations</button></div></article>)}</div></section>}

  </>
}
