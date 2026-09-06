export const gstStateCode = (gstin = '') => {
  const s = String(gstin || '').trim().replace(/\s+/g, '')
  return /^\d{2}/.test(s) ? s.slice(0, 2) : ''
}

export const isInterState = (companyGstin, clientGstin) => {
  const a = gstStateCode(companyGstin)
  const b = gstStateCode(clientGstin)
  return Boolean(a && b && a !== b)
}

export const defaultIGSTRate = (cgstRate, sgstRate) => {
  const c = parseFloat(cgstRate) || 0
  const s = parseFloat(sgstRate) || 0
  return c + s
}