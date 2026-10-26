import { BarChart3, CalendarDays, ChevronDown, ChevronRight, ClipboardList, FolderKanban, LayoutList, LogOut, MessageSquareText, Settings, Shapes, Sparkles, UserRound, UsersRound, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import RoleGate from './RoleGate'
import ConfirmDialog from './ConfirmDialog'

const initials=name=>(name||'User').split(' ').map(x=>x[0]).slice(0,2).join('')
const navClass=({isActive})=>isActive?'navItem active':'navItem'

export default function Sidebar({collapsed=false,mobileOpen=false,onClose}) {
  const { user,logout } = useAuth();const nav=useNavigate();const location=useLocation()
  const [confirmLogout,setConfirmLogout]=useState(false)
  const [mastersOpen,setMastersOpen]=useState(()=>localStorage.getItem('hrms_master_data_open')!=='false')
  useEffect(()=>localStorage.setItem('hrms_master_data_open',String(mastersOpen)),[mastersOpen])
  const goProfile=()=>{nav('/profile');onClose?.()}
  const doLogout=()=>{logout();setConfirmLogout(false);onClose?.();nav('/login',{replace:true})}
  const masterActive=location.pathname==='/masters'
  return <>
    <aside className={`sidebar ${collapsed?'collapsed':''} ${mobileOpen?'mobileOpen':''}`} aria-label="Primary navigation">
      <div className="drawerHeaderMobile"><span>Navigation</span><button className="topbarIcon" aria-label="Close navigation" onClick={onClose}><X/></button></div>
      <div className="brandV2" title={collapsed?'Kritika AI HR Assistant':undefined}><div className="brandLogo"><img src="/credentek-logo.png" alt="CredenTek" /></div><div className="productName"><strong>Kritika AI</strong><span>HR Assistant</span></div></div>
      <div className="sidebarMenuScroll"><nav>
        <RoleGate allow={['ADMIN','HR']}><NavLink to="/employees" className={navClass} title={collapsed?'Employees':undefined}><UsersRound/><span>Employees</span></NavLink></RoleGate>
        <NavLink to="/requests" className={navClass} title={collapsed?'Resource Requests':undefined}><ClipboardList/><span>Resource Requests</span></NavLink>
        <NavLink to="/projects" className={navClass} title={collapsed?'Projects':undefined}><FolderKanban/><span>Projects</span></NavLink>
        <NavLink to="/allocations" className={navClass} title={collapsed?'Allocations':undefined}><LayoutList/><span>Allocations</span></NavLink>
        <NavLink to="/timeline" className={navClass} title={collapsed?'Calendar':undefined}><CalendarDays/><span>Calendar</span></NavLink>
        <NavLink to="/feedback" className={navClass} title={collapsed?'Feedback':undefined}><MessageSquareText/><span>Feedback</span></NavLink>
        <NavLink to="/" end className={navClass} title={collapsed?'Overview':undefined}><BarChart3/><span>Overview</span></NavLink>
        <RoleGate allow={['ADMIN','HR']}>
          <div className={`navGroup ${masterActive?'active':''}`}>
            <button className="navItem navGroupToggle" onClick={()=>setMastersOpen(v=>!v)} aria-expanded={mastersOpen} title={collapsed?'Master Data':undefined}><Shapes/><span>Master Data</span>{!collapsed&&(mastersOpen?<ChevronDown className="navGroupChevron"/>:<ChevronRight className="navGroupChevron"/>)}</button>
            {mastersOpen&&<div className="navGroupChildren"><NavLink to="/masters?tab=designations" className={()=>location.pathname==='/masters'&&new URLSearchParams(location.search).get('tab')!=='skills'?'navItem active':'navItem'} title={collapsed?'Designations':undefined}><Sparkles/><span>Designations</span></NavLink><NavLink to="/masters?tab=skills" className={()=>location.pathname==='/masters'&&new URLSearchParams(location.search).get('tab')==='skills'?'navItem active':'navItem'} title={collapsed?'Skills':undefined}><Sparkles/><span>Skills</span></NavLink></div>}
          </div>
        </RoleGate>
        <RoleGate allow={['ADMIN']}><NavLink to="/settings" className={navClass} title={collapsed?'Settings':undefined}><Settings/><span>Settings</span></NavLink></RoleGate>
      </nav></div>
      <footer className="drawerFooter"><button className="drawerUserBlock" onClick={goProfile} title={collapsed?'Profile':undefined} aria-label="Open profile"><span className="avatar drawerAvatar">{initials(user?.full_name)}</span><span className="profileText"><strong>{user?.full_name}</strong><span>{user?.role?.replace('_',' ')}</span></span><UserRound className="drawerFooterIcon"/></button><button className="drawerLogout" onClick={()=>setConfirmLogout(true)} title={collapsed?'Logout':undefined} aria-label="Logout"><LogOut/><span>Logout</span></button></footer>
    </aside>
    <ConfirmDialog open={confirmLogout} title="Log out?" summary="Are you sure you want to log out?" confirmLabel="Logout" danger onCancel={()=>setConfirmLogout(false)} onConfirm={doLogout}/>
  </>
}
