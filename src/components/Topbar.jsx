import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles={
  '/':'Overview',
  '/timeline':'Allocation Calendar',
  '/allocations':'Manage Allocations',
  '/requests':'Resource Requests',
  '/feedback':'Feedback',
  '/settings':'Settings',
  '/profile':'Profile',
  '/employees':'Employees',
  '/masters':'Masters'
}

export default function Topbar({collapsed,onToggleCollapsed,onOpenMobile}){
  const {pathname}=useLocation()
  const title=titles[pathname]||'Kritika AI HR Assistant'
  return <header className="topbar">
    <div className="topbarLeft">
      <button className="topbarIcon mobileMenuButton" aria-label="Open navigation" onClick={onOpenMobile}><Menu/></button>
      <button className="topbarIcon desktopCollapseButton" aria-label={collapsed?'Expand navigation':'Collapse navigation'} onClick={onToggleCollapsed}>{collapsed?<PanelLeftOpen/>:<PanelLeftClose/>}</button>
      <div className="topbarTitle"><span>Workspace</span><strong>{title}</strong></div>
    </div>
  </header>
}
