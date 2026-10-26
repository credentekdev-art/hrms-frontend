import { useCallback, useState } from 'react'

const focusField = (name) => {
  if (!name) return
  const el = document.querySelector(`[name="${name}"], [data-field="${name}"]`)
  if (el) {
    el.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    setTimeout(() => el.focus?.(), 120)
  }
}

export function apiFieldErrors(error) {
  const detail = error?.response?.data?.detail
  if (!Array.isArray(detail)) return {}
  const out = {}
  for (const item of detail) {
    const loc = item?.loc || []
    const field = [...loc].reverse().find(x => typeof x === 'string' && x !== 'body')
    if (field) out[field] = item?.msg || 'Invalid value'
  }
  return out
}

export default function useSubmitValidation(validate) {
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)

  const validateSubmit = useCallback((values) => {
    setAttempted(true)
    const next = validate(values) || {}
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) focusField(first)
    return !first
  }, [validate])

  const clearField = useCallback((field) => {
    if (!attempted) return
    setErrors(current => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }, [attempted])

  const revalidateField = useCallback((field, values) => {
    if (!attempted) return
    const message = (validate(values) || {})[field]
    setErrors(current => {
      const next = { ...current }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }, [attempted, validate])

  const setFieldError = useCallback((field, message, focus = false) => {
    setAttempted(true)
    setErrors(current => ({ ...current, [field]: message }))
    if (focus) focusField(field)
  }, [])

  const applyBackend = useCallback((error) => {
    const mapped = apiFieldErrors(error)
    if (!Object.keys(mapped).length) return false
    setAttempted(true)
    setErrors(current => ({ ...current, ...mapped }))
    focusField(Object.keys(mapped)[0])
    return true
  }, [])

  const resetValidation = useCallback(() => { setErrors({}); setAttempted(false) }, [])

  return { errors, attempted, validateSubmit, clearField, revalidateField, setFieldError, applyBackend, resetValidation }
}
