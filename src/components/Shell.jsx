import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Shell(){
  const [collapsed,setCollapsed]=useState(false)
  const [mobileOpen,setMobileOpen]=useState(false)
  const location=useLocation()
  useEffect(()=>setMobileOpen(false),[location.pathname])
  return <div className={`appShell ${collapsed?'sidebarCollapsed':''}`}>
    <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={()=>setMobileOpen(false)}/>
    {mobileOpen&&<button className="drawerOverlay" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>} 
    <main className="mainPane">
      <Topbar collapsed={collapsed} onToggleCollapsed={()=>setCollapsed(v=>!v)} onOpenMobile={()=>setMobileOpen(true)}/>
      <Outlet/>
      <footer className="appFooter">© 2026 CredenTek Software & Consultancy Pvt. Ltd. · Kritika AI HR Assistant</footer>
    </main>
  </div>
}
