import { useState } from 'react'

const normalizeApiDetail=detail=>{
  if(Array.isArray(detail))return detail.map(x=>{
    const loc=Array.isArray(x.loc)?x.loc:[]
    const field=loc.find(part=>typeof part==='string'&&!['body','query','path','header'].includes(part))||loc.at(-1)||''
    return {field:String(field),message:x.msg||'Invalid value'}
  })
  if(typeof detail==='string'){
    const m=detail.match(/^([a-zA-Z0-9_]+):\s*(.+)$/)
    return m?[{field:m[1],message:m[2]}]:[]
  }
  if(detail?.message)return normalizeApiDetail(detail.message)
  return []
}

export default function useFormValidation(validators={},fieldAliases={}){
  const [errors,setErrors]=useState({}),[attempted,setAttempted]=useState(false)
  const focusFirst=next=>{const first=Object.keys(next)[0];if(first)setTimeout(()=>{const root=document.querySelector(`[data-field="${first}"]`);const target=root?.querySelector('input,select,textarea,button')||root;target?.scrollIntoView?.({behavior:'smooth',block:'center'});target?.focus?.()},0)}
  const validate=values=>{setAttempted(true);const next={};for(const [field,rule] of Object.entries(validators)){const message=rule(values[field],values);if(message)next[field]=message}setErrors(next);focusFirst(next);return Object.keys(next).length===0}
  const validateField=(field,value,values={})=>{if(!attempted&&!errors[field])return;const rule=validators[field];if(!rule){setErrors(current=>{const next={...current};delete next[field];return next});return}const nextValues={...values,[field]:value};const message=rule(value,nextValues);setErrors(current=>{const next={...current};if(message)next[field]=message;else delete next[field];return next})}
  const clearError=field=>setErrors(current=>{if(!current[field])return current;const next={...current};delete next[field];return next})
  const setFieldError=(field,message)=>{setAttempted(true);setErrors(current=>({...current,[field]:message}))}
  const applyApiError=error=>{const mapped={};for(const item of normalizeApiDetail(error?.response?.data?.detail)){const field=fieldAliases[item.field]||item.field;if(field in validators)mapped[field]=item.message}if(Object.keys(mapped).length){setAttempted(true);setErrors(current=>({...current,...mapped}));focusFirst(mapped)}return Object.keys(mapped).length>0}
  const resetErrors=()=>{setErrors({});setAttempted(false)}
  return{errors,attempted,validate,validateField,clearError,setFieldError,applyApiError,resetErrors}
}
