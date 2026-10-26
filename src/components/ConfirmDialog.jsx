import { X } from 'lucide-react'

export default function ConfirmDialog({open,title,summary,remarkPreview,confirmLabel='Confirm',cancelLabel='Cancel',busy=false,danger=false,onCancel,onConfirm}){
  if(!open)return null
  return <div className="modalBackdrop" role="presentation"><section className="confirmDialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
    <button className="iconButton lightIcon closeCorner" aria-label="Close confirmation" onClick={onCancel} disabled={busy}><X/></button>
    <h2 id="confirm-dialog-title">{title}</h2>
    {summary&&<p>{summary}</p>}
    {remarkPreview&&<div className="confirmRemark"><span>Remark</span><p>{remarkPreview}</p></div>}
    <div className="modalActions"><button className="button ghost" onClick={onCancel} disabled={busy}>{cancelLabel}</button><button className={`button ${danger?'dangerButton':'primary'}`} onClick={onConfirm} disabled={busy}>{busy?'Working…':confirmLabel}</button></div>
  </section></div>
}
