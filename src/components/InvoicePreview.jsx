import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function InvoicePreview({ invoiceData }) {
    const invoiceRef = useRef()
    const [isGenerating, setIsGenerating] = useState(false)

    const calculateSubtotal = () => {
        return invoiceData.items.reduce((sum, item) => sum + item.amount, 0)
    }

    const calculateGST = () => {
        const subtotal = calculateSubtotal()
        const cgst = subtotal * (parseFloat(invoiceData.cgstRate) || 0) / 100
        const sgst = subtotal * (parseFloat(invoiceData.sgstRate) || 0) / 100
        return { cgst, sgst, total: cgst + sgst }
    }

    const calculateTotal = () => {
        const pfCharge = parseFloat(invoiceData.pfCharge) || 0;
        
        if (!invoiceData.deliveryCharge) {
            return calculateSubtotal() + calculateGST().total + pfCharge;
        }

        const deliveryChargeRaw = invoiceData.deliveryCharge.toString();
        // Extract only numbers from the string
        const numericPart = deliveryChargeRaw.replace(/[^0-9.]/g, '');
        const deliveryChargeNum = parseFloat(numericPart);
        
        // Only add delivery charge if it's a valid number
        const deliveryCharge = (numericPart && !isNaN(deliveryChargeNum)) ? deliveryChargeNum : 0;
        
        return calculateSubtotal() + calculateGST().total + pfCharge + deliveryCharge;
    }

    const renderDeliveryCharge = () => {
        if (!invoiceData.deliveryCharge) {
            return 'No Delivery Charge';
        }

        const deliveryChargeRaw = invoiceData.deliveryCharge.toString().trim();

        // Try to extract numbers from the string
        const numericPart = deliveryChargeRaw.replace(/[^0-9.]/g, '');
        const deliveryChargeNum = parseFloat(numericPart);

        // If there are any digits and it's a valid number, format it as currency
        if (numericPart && !isNaN(deliveryChargeNum)) {
            return formatCurrency(deliveryChargeNum);
        }

        // Otherwise, it's pure text - return it as is
        return deliveryChargeRaw;
    }

    const downloadPDF = async () => {
        try {
            setIsGenerating(true)

            const element = invoiceRef.current
            if (!element) {
                alert('Invoice element not found!')
                return
            }

            // Create a clone of the element for PDF generation
            const clone = element.cloneNode(true)
            clone.style.position = 'absolute'
            clone.style.left = '-9999px'
            clone.style.top = '0'
            clone.style.width = '800px' // Fixed width for consistent PDF output
            document.body.appendChild(clone)

            // Color mapping for Tailwind v4 oklch colors to Hex (Updated for Basic Theme)
            const colorMap = {
                // Text
                'text-gray-900': '#111827',
                'text-gray-800': '#1f2937',
                'text-gray-700': '#374151',
                'text-gray-600': '#4b5563',
                'text-gray-500': '#6b7280',
                'text-white': '#ffffff',

                // Backgrounds
                'bg-white': '#ffffff',
                'bg-gray-50': '#f9fafb',
                'bg-gray-100': '#f3f4f6',

                // Borders
                'border-gray-200': '#e5e7eb',
                'border-gray-300': '#d1d5db',
                'border-gray-800': '#1f2937',
                'border-black': '#000000',
            }

            // Helper to process elements
            const processElement = (el) => {
                const classList = Array.from(el.classList)

                // 1. Handle Text Colors
                const textClass = classList.find(c => c.startsWith('text-') && colorMap[c])
                if (textClass) {
                    el.style.color = colorMap[textClass]
                    el.classList.remove(textClass)
                } else if (classList.some(c => c.startsWith('text-'))) {
                    el.style.color = '#000000' // Fallback to black
                }

                // 2. Handle Backgrounds
                const bgClass = classList.find(c => c.startsWith('bg-') && colorMap[c])
                if (bgClass) {
                    el.style.backgroundColor = colorMap[bgClass]
                    el.classList.remove(bgClass)
                }

                // 3. Handle Borders
                const borderClass = classList.find(c => c.startsWith('border-') && colorMap[c])
                if (borderClass) {
                    el.style.borderColor = colorMap[borderClass]
                    el.classList.remove(borderClass)
                } else if (classList.some(c => c.startsWith('border'))) {
                    el.style.borderColor = '#e5e7eb' // Default border
                }

                // Recursively process children
                Array.from(el.children).forEach(processElement)
            }

            // Process the clone
            processElement(clone)

            // Wait a bit for rendering
            await new Promise(resolve => setTimeout(resolve, 100))

            const canvas = await html2canvas(clone, {
                scale: 1.5, // Optimized scale
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 800,
                windowHeight: clone.scrollHeight
            })

            // Remove the clone
            document.body.removeChild(clone)

            const imgData = canvas.toDataURL('image/jpeg', 0.8) // Optimized JPEG
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210 // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
            pdf.save(`Invoice-${invoiceData.invoiceNumber || 'draft'}.pdf`)

            console.log('PDF generated successfully!')
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount)
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const gst = calculateGST()
    const subtotal = calculateSubtotal()
    const total = calculateTotal()

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Download Button */}
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={downloadPDF}
                        disabled={isGenerating}
                        className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-2 rounded shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                {/* Invoice - Basic Paper Look */}
                <div ref={invoiceRef} className="bg-white border border-gray-300 p-8 sm:p-12 shadow-sm mx-auto min-h-[297mm]">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 tracking-wide uppercase">INVOICE</h1>
                            <p className="text-gray-500 mt-1 font-medium">#{invoiceData.invoiceNumber}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:text-right">
                            <div className="text-gray-600">Date: <span className="text-gray-900 font-medium">{formatDate(invoiceData.invoiceDate)}</span></div>
                            {invoiceData.dueDate && (
                                <div className="text-gray-600 mt-1">Due: <span className="text-gray-900 font-medium">{formatDate(invoiceData.dueDate)}</span></div>
                            )}
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="flex flex-col sm:flex-row justify-between gap-8 mb-12">
                        <div className="w-full sm:w-1/2">
                            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4">From</h3>
                            <div className="text-gray-900 font-bold text-lg mb-1">{invoiceData.companyName}</div>
                            <div className="text-gray-600 whitespace-pre-line leading-relaxed">{invoiceData.companyAddress}</div>
                            {invoiceData.companyGSTIN && (
                                <div className="text-gray-600 mt-2"><span className="font-medium text-gray-800">GSTIN:</span> {invoiceData.companyGSTIN}</div>
                            )}
                            {invoiceData.companyPhone && (
                                <div className="text-gray-600"><span className="font-medium text-gray-800">Phone:</span> {invoiceData.companyPhone}</div>
                            )}
                            {invoiceData.companyEmail && (
                                <div className="text-gray-600"><span className="font-medium text-gray-800">Email:</span> {invoiceData.companyEmail}</div>
                            )}
                        </div>
                        <div className="w-full sm:w-1/2 sm:text-right">
                            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4">Bill To</h3>
                            <div className="text-gray-900 font-bold text-lg mb-1">{invoiceData.clientName}</div>
                            <div className="text-gray-600 whitespace-pre-line leading-relaxed">{invoiceData.clientAddress}</div>
                            {invoiceData.clientGSTIN && (
                                <div className="text-gray-600 mt-2"><span className="font-medium text-gray-800">GSTIN:</span> {invoiceData.clientGSTIN}</div>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-800">
                                <th className="text-left py-3 font-bold text-gray-900 uppercase text-sm">Description</th>
                                <th className="text-right py-3 font-bold text-gray-900 uppercase text-sm">Qty</th>
                                <th className="text-right py-3 font-bold text-gray-900 uppercase text-sm">Rate</th>
                                <th className="text-right py-3 font-bold text-gray-900 uppercase text-sm">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {invoiceData.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="py-4 align-top">{item.description}</td>
                                    <td className="py-4 text-right align-top">{item.quantity}</td>
                                    <td className="py-4 text-right align-top">{formatCurrency(item.rate)}</td>
                                    <td className="py-4 text-right font-medium text-gray-900 align-top">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-full sm:w-72 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>CGST ({invoiceData.cgstRate}%)</span>
                                <span className="font-medium text-gray-900">{formatCurrency(gst.cgst)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>SGST ({invoiceData.sgstRate}%)</span>
                                <span className="font-medium text-gray-900">{formatCurrency(gst.sgst)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>P&F Charge</span>
                                <span className="font-medium text-gray-900">{formatCurrency(invoiceData.pfCharge || 0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Charge</span>
                                <span className="font-medium text-gray-900">{renderDeliveryCharge()}</span>
                            </div>
                            <div className="flex justify-between border-t-2 border-gray-800 pt-3 text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes and Terms */}
                    <div className="grid grid-cols-1 gap-8 pt-8 border-t border-gray-200">
                        {invoiceData.notes && (
                            <div>
                                <h3 className="text-gray-900 text-sm font-bold uppercase mb-2">Notes</h3>
                                <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
                            </div>
                        )}
                        {invoiceData.terms && (
                            <div>
                                <h3 className="text-gray-900 text-sm font-bold uppercase mb-2">Terms & Conditions</h3>
                                <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.terms}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-16 text-center text-sm text-gray-500">
                        <p>Thank you for your business!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}