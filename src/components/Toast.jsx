export default function Toast({toast,onClose}){
  if(!toast)return null
  return <div className={`appToast ${toast.type||'success'}`} role="status" aria-live="polite"><span>{toast.message}</span><button aria-label="Dismiss notification" onClick={onClose}>×</button></div>
}
