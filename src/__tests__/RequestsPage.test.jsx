import { render,screen,waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import RequestsPage from '../pages/RequestsPage'

const mocks=vi.hoisted(()=>({get:vi.fn(),post:vi.fn(),patch:vi.fn(),del:vi.fn()}))
vi.mock('../api/client',()=>({api:{get:(...a)=>mocks.get(...a),post:(...a)=>mocks.post(...a),patch:(...a)=>mocks.patch(...a),delete:(...a)=>mocks.del(...a)}}))
vi.mock('../context/AuthContext',()=>({useAuth:()=>({user:{id:1,role:'MANAGER',full_name:'Aarav Manager'}})}))

beforeEach(()=>{
 mocks.get.mockReset();mocks.post.mockReset();mocks.patch.mockReset();mocks.del.mockReset()
 const request={id:1,project_id:10,requested_by_user_id:1,requested_by_name:'Aarav Manager',requested_employee_ids:[7],designation_id:2,designation_name:'Senior Engineer',skill_id:3,skill_name:'React',role_required:'Senior Engineer',skills_required:'React',number_of_resources:1,allocation_percentage:40,start_date:'2026-11-01',end_date:'2026-12-31',priority:'HIGH',reason:'Need React delivery capacity',remark:'Need React delivery capacity',status:'SUBMITTED',created_at:'2026-10-23T00:00:00'}
 mocks.get.mockImplementation((url)=>{
   if(url==='/requests')return Promise.resolve({data:[request]})
   if(url==='/projects')return Promise.resolve({data:[{id:10,code:'HRMS',name:'HRMS',manager_user_id:1,active:true}]})
   if(url==='/requests/1')return Promise.resolve({data:request})
   if(url==='/employees/7')return Promise.resolve({data:{id:7,employee_code:'E1007',name:'Nikita Sharma'}})
   if(url==='/requests/eligible-employees')return Promise.resolve({data:{items:[],selected_eligible_ids:[],total:0,has_more:false}})
   if(url==='/masters/designations'||url==='/masters/skills')return Promise.resolve({data:{items:[],has_more:false}})
   return Promise.resolve({data:{items:[]}})
 })
})

test('Edit fetches the full request and auto-fills Designation, Skill, Employee and Remark',async()=>{
 const user=userEvent.setup();render(<MemoryRouter><RequestsPage/></MemoryRouter>)
 const edit=await screen.findByRole('button',{name:'Edit request 1'});await user.click(edit)
 await waitFor(()=>expect(mocks.get).toHaveBeenCalledWith('/requests/1'))
 expect(screen.getByRole('heading',{name:'Update resource request'})).toBeInTheDocument()
 expect(screen.getByLabelText(/^Designation/)).toHaveValue('Senior Engineer')
 expect(screen.getByLabelText(/^Skill/)).toHaveValue('React')
 expect(screen.getByText('Nikita Sharma')).toBeInTheDocument()
 expect(screen.getByLabelText(/^Remark/)).toHaveValue('Need React delivery capacity')
 expect(screen.getByRole('button',{name:/Update/})).toBeInTheDocument()
})

test('submit validates fields before opening confirmation and focuses the first invalid field',async()=>{
 const user=userEvent.setup();render(<MemoryRouter><RequestsPage/></MemoryRouter>)
 await screen.findByRole('heading',{name:'Create resource request'})
 await user.click(screen.getByRole('button',{name:/Submit/}))
 expect(await screen.findByText('Designation is required')).toBeInTheDocument()
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
 expect(screen.getByLabelText(/^Designation/)).toHaveAttribute('aria-invalid','true')
})


test('employee selection remains selected and closes the dropdown',async()=>{
 const base=mocks.get.getMockImplementation()
 mocks.get.mockImplementation((url,...rest)=>{
   if(url==='/requests/eligible-employees')return Promise.resolve({data:{items:[{employee_id:7,employee_code:'E1007',name:'Nikita Sharma',designation_id:2,designation_name:'Senior Engineer',skills:[{id:3,name:'React',proficiency:'Expert'}],available_allocation_percentage:100,experience:5,skill_proficiency:'Expert',last_feedback_rating:4.5,last_feedback_description:'Strong delivery'}],selected_eligible_ids:[7],total:1,has_more:false}})
   return base(url,...rest)
 })
 const user=userEvent.setup();render(<MemoryRouter><RequestsPage/></MemoryRouter>)
 const picker=await screen.findByRole('button',{name:'Select eligible employee'})
 await user.click(picker)
 await user.click(await screen.findByText('Nikita Sharma'))
 expect(screen.getByRole('button',{name:'Select eligible employee'})).toHaveTextContent('Nikita Sharma')
 expect(screen.queryByLabelText('Search eligible employees')).not.toBeInTheDocument()
})

test('resource request list filter toolbar is removed',async()=>{
 render(<MemoryRouter><RequestsPage/></MemoryRouter>)
 await screen.findByRole('heading',{name:'Create resource request'})
 expect(screen.queryByPlaceholderText('Search requests')).not.toBeInTheDocument()
 expect(screen.queryByRole('button',{name:'Clear filters'})).not.toBeInTheDocument()
})
