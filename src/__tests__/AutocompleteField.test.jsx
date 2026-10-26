import { useState } from 'react'
import { render,screen,waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import AutocompleteField from '../components/AutocompleteField'

const get=vi.fn()
vi.mock('../api/client',()=>({api:{get:(...args)=>get(...args)}}))

function Harness(){const[value,setValue]=useState('');return <AutocompleteField label="Designation" value={value} onChange={setValue} endpoint="/requests/search/designations" placeholder="Search designation"/>}

test('designation autocomplete waits for two characters and uses the designation endpoint',async()=>{
  vi.useFakeTimers({shouldAdvanceTime:true})
  get.mockResolvedValue({data:{items:['Senior Engineer'],limit:8,offset:0,has_more:false}})
  const user=userEvent.setup({advanceTimers:vi.advanceTimersByTime})
  render(<Harness/>)
  const input=screen.getByLabelText('Designation')
  await user.type(input,'E');vi.advanceTimersByTime(350);expect(get).not.toHaveBeenCalled()
  await user.type(input,'n');vi.advanceTimersByTime(350)
  await waitFor(()=>expect(get).toHaveBeenCalledWith('/requests/search/designations',expect.objectContaining({params:{q:'En',limit:8,offset:0}})))
  expect(await screen.findByRole('option',{name:'Senior Engineer'})).toBeInTheDocument()
  vi.useRealTimers()
})
