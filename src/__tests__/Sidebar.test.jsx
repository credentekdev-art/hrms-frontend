import { render,screen,within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Sidebar from '../components/Sidebar'

const logout=vi.fn()
vi.mock('../context/AuthContext',()=>({useAuth:()=>({user:{full_name:'Aarav Manager',role:'MANAGER'},logout})}))

test('drawer logout asks for confirmation before clearing the session',async()=>{
  const user=userEvent.setup()
  render(<MemoryRouter><Sidebar/></MemoryRouter>)
  await user.click(screen.getByRole('button',{name:'Logout'}))
  const dialog=screen.getByRole('dialog')
  expect(dialog).toBeInTheDocument()
  expect(within(dialog).getByText('Are you sure you want to log out?')).toBeInTheDocument()
  expect(logout).not.toHaveBeenCalled()
  await user.click(within(dialog).getByRole('button',{name:'Logout'}))
  expect(logout).toHaveBeenCalledTimes(1)
})
