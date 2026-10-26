export const isoDate=value=>{if(!value)return'';if(value instanceof Date)return value.toISOString().slice(0,10);return String(value).slice(0,10)}
export const addDays=(value,amount)=>{const d=new Date(`${isoDate(value)}T00:00:00`);d.setDate(d.getDate()+amount);return isoDate(d)}
export const historyStatuses=['COMPLETED','RELEASED_EARLY','RELEASED','CANCELLED']
export const effectiveEndDate=a=>{if(a?.release_date)return addDays(a.release_date,-1);if(a?.scheduled_release_date)return [a.end_date,addDays(a.scheduled_release_date,-1)].sort()[0];return a?.end_date||''}
export const allocationCoversDate=(a,date)=>{if(!a||historyStatuses.includes(a.status))return false;const key=isoDate(date);return a.start_date<=key&&effectiveEndDate(a)>=key}
export const calendarCoversDate=(a,date)=>{if(!a)return false;const key=isoDate(date);const end=a.release_date?addDays(a.release_date,-1):(a.scheduled_release_date?effectiveEndDate(a):a.end_date);return a.start_date<=key&&end>=key}
export const utilizationOnDate=(allocations,employeeId,date,excludeAllocationId=null)=>allocations.filter(a=>a.employee_id===Number(employeeId)&&a.id!==excludeAllocationId&&allocationCoversDate(a,date)).reduce((s,a)=>s+Number(a.allocation_percentage||0),0)
export const utilizationClass=v=>Number(v)>100?'util-red':Number(v)>=80?'util-amber':'util-green'
export const formatDate=value=>value?new Date(`${isoDate(value)}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'
export const statusLabel=value=>({DRAFT:'Draft',SUBMITTED:'Submitted',UNDER_REVIEW:'In Review',FULFILLED:'Fulfilled',REJECTED:'Rejected',APPROVED:'Approved',CLOSED:'Closed',CANCELLED:'Cancelled',ACTIVE:'Active',PLANNED:'Planned',COMPLETED:'Completed',RELEASED_EARLY:'Released Early',RELEASED:'Released Early'}[value]||String(value||'').replaceAll('_',' '))
export const releaseReasonLabel=value=>({PROJECT_COMPLETED:'Project Completed',RESOURCE_REPLACED:'Resource Replaced',PERFORMANCE:'Performance',CLIENT_REQUEST:'Client Request',OTHER:'Other'}[value]||value||'—')
