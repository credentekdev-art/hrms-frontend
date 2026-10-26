import { render,screen,waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import EligibleEmployeePicker from '../components/EligibleEmployeePicker'

const get=vi.fn()
vi.mock('../api/client',()=>({api:{get:(...args)=>get(...args)}}))
beforeEach(()=>get.mockReset())

test('employee picker is active immediately and progressively fetches with available criteria',async()=>{
 vi.useFakeTimers({shouldAdvanceTime:true});get.mockResolvedValue({data:{items:[],selected_eligible_ids:[],total:0,has_more:false}})
 const user=userEvent.setup({advanceTimers:vi.advanceTimersByTime})
 render(<EligibleEmployeePicker criteria={{project_id:1,designation_id:null,skill_id:null,allocation_percentage:null,start_date:null,end_date:null}} value={[]} onChange={()=>{}}/>)
 const button=screen.getByRole('button',{name:'Select eligible employee'});expect(button).not.toBeDisabled();vi.advanceTimersByTime(350)
 await waitFor(()=>expect(get).toHaveBeenCalledWith('/requests/eligible-employees',expect.objectContaining({params:expect.objectContaining({project_id:1})})))
 await user.click(button);expect(screen.getByText('No employees available for the selected criteria')).toBeInTheDocument();vi.useRealTimers()
})

test('employee picker refetches when designation skill capacity or dates narrow eligibility',async()=>{
 vi.useFakeTimers({shouldAdvanceTime:true});get.mockResolvedValue({data:{items:[{employee_id:7,employee_code:'E7',name:'Sachin',designation_id:2,designation_name:'Engineer',skills:[{id:3,name:'React',proficiency:'Expert'}],available_allocation_percentage:60,experience:5.2,skill_proficiency:'Expert',last_feedback_rating:4.5,last_feedback_description:'Strong delivery'}],selected_eligible_ids:[],total:1,has_more:false}})
 const onChange=vi.fn(),onEmployeeSelected=vi.fn();const {rerender}=render(<EligibleEmployeePicker criteria={{project_id:1}} value={[]} onChange={onChange} onEmployeeSelected={onEmployeeSelected}/>)
 vi.advanceTimersByTime(350);await waitFor(()=>expect(get).toHaveBeenCalled())
 rerender(<EligibleEmployeePicker criteria={{project_id:1,designation_id:2,skill_id:3,allocation_percentage:40,start_date:'2026-11-01',end_date:'2026-11-30'}} value={[]} onChange={onChange} onEmployeeSelected={onEmployeeSelected}/>)
 vi.advanceTimersByTime(350);await waitFor(()=>expect(get).toHaveBeenLastCalledWith('/requests/eligible-employees',expect.objectContaining({params:expect.objectContaining({designation_id:2,skill_id:3,allocation_percentage:40,start_date:'2026-11-01',end_date:'2026-11-30'})})))
 const user=userEvent.setup({advanceTimers:vi.advanceTimersByTime});await user.click(screen.getByRole('button',{name:'Select eligible employee'}));await user.click(await screen.findByText('Sachin'));expect(onChange).toHaveBeenCalledWith([7]);expect(onEmployeeSelected).toHaveBeenCalledWith(expect.objectContaining({employee_id:7,designation_id:2}));expect(screen.queryByLabelText('Search eligible employees')).not.toBeInTheDocument();vi.useRealTimers()
})
