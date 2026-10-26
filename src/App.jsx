import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Shell from './components/Shell'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TimelinePage from './pages/TimelinePage'
import RequestsPage from './pages/RequestsPage'
import FeedbackPage from './pages/FeedbackPage'
import SettingsPage from './pages/SettingsPage'
import AllocationsPage from './pages/AllocationsPage'
import EmployeeProfilePage from './pages/EmployeeProfilePage'
import ProfilePage from './pages/ProfilePage'
import EmployeesPage from './pages/EmployeesPage'
import MastersPage from './pages/MastersPage'
import ProjectsPage from './pages/ProjectsPage'

function Protected({children}){const {user}=useAuth();return user?children:<Navigate to="/login" replace/>}
function AdminOnly({children}){const {user}=useAuth();return user?.role==='ADMIN'?children:<Navigate to="/" replace/>}
function AdminHROnly({children}){const {user}=useAuth();return ['ADMIN','HR'].includes(user?.role)?children:<Navigate to="/" replace/>}
export default function App(){return <Routes><Route path="/login" element={<LoginPage/>}/><Route element={<Protected><Shell/></Protected>}><Route index element={<DashboardPage/>}/><Route path="timeline" element={<TimelinePage/>}/><Route path="allocations" element={<AllocationsPage/>}/><Route path="employees/:id" element={<EmployeeProfilePage/>}/><Route path="profile" element={<ProfilePage/>}/><Route path="employees" element={<AdminHROnly><EmployeesPage/></AdminHROnly>}/><Route path="projects" element={<ProjectsPage/>}/><Route path="masters" element={<AdminHROnly><MastersPage/></AdminHROnly>}/><Route path="requests" element={<RequestsPage/>}/><Route path="feedback" element={<FeedbackPage/>}/><Route path="settings" element={<AdminOnly><SettingsPage/></AdminOnly>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
