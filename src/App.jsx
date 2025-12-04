import { useState } from 'react'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'

function App() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    companyName: '',
    companyAddress: '',
    companyGSTIN: '',
    companyPhone: '',
    companyEmail: '',
    clientName: '',
    clientAddress: '',
    clientGSTIN: '',
    items: [
      { description: '', quantity: 1, rate: 0, amount: 0 }
    ],
    cgstRate: 9,
    sgstRate: 9,
    deliveryCharge: '',
    notes: '',
    terms: 'Payment is due within 30 days. Late payment subject to fees as per our terms and conditions.'
  })

  const [showPreview, setShowPreview] = useState(false)

  if (showPreview) {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowPreview(false)}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200"
          >
            ← Back to Form
          </button>
        </div>
        <InvoicePreview invoiceData={invoiceData} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Invoice Generator</h1>
          <p className="text-gray-600">Create professional invoices with GST support for Indian businesses</p>
        </div>

        <InvoiceForm
          invoiceData={invoiceData}
          setInvoiceData={setInvoiceData}
          onPreview={() => setShowPreview(true)}
        />
      </div>
    </div>
  )
}

export default App
