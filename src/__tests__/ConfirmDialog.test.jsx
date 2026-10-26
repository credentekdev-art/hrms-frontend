import { render,screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ConfirmDialog from '../components/ConfirmDialog'

test('confirmation flow shows summary and remark then confirms once',async()=>{
 const user=userEvent.setup(),onConfirm=vi.fn(),onCancel=vi.fn()
 render(<ConfirmDialog open title="Reject request #123?" summary="The request will be marked Rejected." remarkPreview="Budget changed" confirmLabel="Reject" danger onCancel={onCancel} onConfirm={onConfirm}/>)
 expect(screen.getByText('Budget changed')).toBeInTheDocument()
 await user.click(screen.getByRole('button',{name:'Reject'}))
 expect(onConfirm).toHaveBeenCalledTimes(1)
})

test('confirm is disabled while request is in flight',()=>{
 render(<ConfirmDialog open title="Submit?" busy onCancel={()=>{}} onConfirm={()=>{}}/>)
 expect(screen.getByRole('button',{name:'Working…'})).toBeDisabled()
})
