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
        return { cgst, sgst }
    }

    const getPFCharge = () => {
        const pfCharge = parseFloat(invoiceData.pfCharge) || 0
        return pfCharge
    }

    const getDeliveryCharge = () => {
        if (!invoiceData.deliveryCharge) return 0
        const deliveryChargeRaw = invoiceData.deliveryCharge.toString()
        const numericPart = deliveryChargeRaw.replace(/[^0-9.]/g, '')
        const deliveryChargeNum = parseFloat(numericPart)
        return (numericPart && !isNaN(deliveryChargeNum)) ? deliveryChargeNum : 0
    }

    const calculateTotal = () => {
        const gst = calculateGST()
        return calculateSubtotal() + gst.cgst + gst.sgst + getPFCharge() + getDeliveryCharge()
    }

    const renderDeliveryCharge = () => {
        if (!invoiceData.deliveryCharge) return formatCurrency(0)
        const deliveryChargeRaw = invoiceData.deliveryCharge.toString().trim()
        const numericPart = deliveryChargeRaw.replace(/[^0-9.]/g, '')
        const deliveryChargeNum = parseFloat(numericPart)

        if (numericPart && !isNaN(deliveryChargeNum)) {
            return formatCurrency(deliveryChargeNum)
        }
        return deliveryChargeRaw
    }

    const downloadPDF = async () => {
        try {
            setIsGenerating(true)

            const element = invoiceRef.current
            if (!element) {
                alert('Invoice element not found!')
                return
            }

            const canvas = await html2canvas(element, {
                scale: 2.0, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    // Remove all Tailwind classes from cloned document
                    const allElements = clonedDoc.querySelectorAll('*')
                    allElements.forEach(el => {
                        el.removeAttribute('class')
                    })
                }
            })

            // Use JPEG with high quality compression
            const imgData = canvas.toDataURL('image/jpeg', 0.92) // 0.92 quality for high quality with compression
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
            pdf.save(`Invoice-${invoiceData.invoiceNumber || 'draft'}.pdf`)

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

    // Inline styles for PDF compatibility
    const styles = {
        container: { minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' },
        maxWidth: { maxWidth: '56rem', margin: '0 auto' },
        downloadBtn: { marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' },
        button: { backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '600', padding: '0.75rem 1.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
        invoice: { backgroundColor: '#ffffff', padding: '2.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', width: '210mm', minHeight: '297mm' },
        headerBorder: { borderBottom: '2px solid #000000', paddingBottom: '1rem', marginBottom: '1.5rem' },
        flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
        title: { fontSize: '1.875rem', fontWeight: 'bold', color: '#000000', marginBottom: '0.25rem' },
        textSm: { fontSize: '0.875rem', color: '#4b5563' },
        textBlack: { color: '#000000', fontWeight: '600' },
        grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' },
        box: { border: '1px solid #d1d5db', padding: '1rem' },
        labelSmall: { fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563', textTransform: 'uppercase', marginBottom: '0.5rem' },
        companyName: { fontWeight: 'bold', color: '#000000', fontSize: '1rem', marginBottom: '0.25rem' },
        address: { fontSize: '0.875rem', color: '#374151', lineHeight: '1.625', whiteSpace: 'pre-line' },
        table: { width: '100%', marginBottom: '1.5rem', borderCollapse: 'collapse', border: '1px solid #d1d5db' },
        th: { border: '1px solid #d1d5db', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', backgroundColor: '#f3f4f6' },
        td: { border: '1px solid #d1d5db', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#374151' },
        tdBold: { border: '1px solid #d1d5db', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#000000' },
        totalsContainer: { display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' },
        totalsTable: { width: '20rem', borderCollapse: 'collapse', border: '1px solid #d1d5db' },
        totalRow: { backgroundColor: '#f3f4f6' },
        totalTd: { border: '1px solid #d1d5db', padding: '0.5rem 0.75rem', fontSize: '1rem', fontWeight: 'bold', color: '#000000' },
        footer: { borderTop: '1px solid #d1d5db', paddingTop: '1.5rem', marginTop: '2rem' },
        footerFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
        signatureLine: { borderTop: '1px solid #9ca3af', width: '12rem', marginTop: '2rem' }
    }

    return (
        <div style={styles.container}>
            <div style={styles.maxWidth}>
                {/* Download Button */}
                <div style={styles.downloadBtn}>
                    <button
                        onClick={downloadPDF}
                        disabled={isGenerating}
                        style={styles.button}
                    >
                        {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                </div>

                {/* Invoice */}
                <div ref={invoiceRef} style={styles.invoice}>

                    {/* Header Section */}
                    <div style={styles.headerBorder}>
                        <div style={styles.flexBetween}>
                            <div>
                                <h1 style={styles.title}>TAX INVOICE</h1>
                                <p style={styles.textSm}>Invoice No: <span style={styles.textBlack}>{invoiceData.invoiceNumber}</span></p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={styles.textSm}>Date: <span style={styles.textBlack}>{formatDate(invoiceData.invoiceDate)}</span></p>
                                {invoiceData.dueDate && (
                                    <p style={styles.textSm}>Due Date: <span style={styles.textBlack}>{formatDate(invoiceData.dueDate)}</span></p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Company and Client Details */}
                    <div style={styles.grid2}>
                        {/* From Section */}
                        <div style={styles.box}>
                            <h3 style={styles.labelSmall}>From</h3>
                            <p style={styles.companyName}>{invoiceData.companyName}</p>
                            <p style={styles.address}>{invoiceData.companyAddress}</p>
                            {invoiceData.companyGSTIN && (
                                <p style={styles.textSm}><span style={{ fontWeight: '600' }}>GSTIN:</span> {invoiceData.companyGSTIN}</p>
                            )}
                            {invoiceData.companyPhone && (
                                <p style={styles.textSm}><span style={{ fontWeight: '600' }}>Phone:</span> {invoiceData.companyPhone}</p>
                            )}
                            {invoiceData.companyEmail && (
                                <p style={styles.textSm}><span style={{ fontWeight: '600' }}>Email:</span> {invoiceData.companyEmail}</p>
                            )}
                        </div>

                        {/* Bill To Section */}
                        <div style={styles.box}>
                            <h3 style={styles.labelSmall}>Bill To</h3>
                            <p style={styles.companyName}>{invoiceData.clientName}</p>
                            <p style={styles.address}>{invoiceData.clientAddress}</p>
                            {invoiceData.clientGSTIN && (
                                <p style={styles.textSm}><span style={{ fontWeight: '600' }}>GSTIN:</span> {invoiceData.clientGSTIN}</p>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ ...styles.th, textAlign: 'left' }}>S.No</th>
                                <th style={{ ...styles.th, textAlign: 'left' }}>Description</th>
                                <th style={{ ...styles.th, textAlign: 'center' }}>Qty</th>
                                <th style={{ ...styles.th, textAlign: 'right' }}>Rate</th>
                                <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items.map((item, index) => (
                                <tr key={index}>
                                    <td style={styles.td}>{index + 1}</td>
                                    <td style={styles.td}>{item.description}</td>
                                    <td style={{ ...styles.td, textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                                    <td style={{ ...styles.tdBold, textAlign: 'right' }}>{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div style={styles.totalsContainer}>
                        <table style={styles.totalsTable}>
                            <tbody>
                                <tr>
                                    <td style={styles.tdBold}>Subtotal</td>
                                    <td style={{ ...styles.tdBold, textAlign: 'right' }}>{formatCurrency(subtotal)}</td>
                                </tr>
                                <tr>
                                    <td style={styles.tdBold}>CGST ({invoiceData.cgstRate}%)</td>
                                    <td style={{ ...styles.tdBold, textAlign: 'right' }}>{formatCurrency(gst.cgst)}</td>
                                </tr>
                                <tr>
                                    <td style={styles.tdBold}>SGST ({invoiceData.sgstRate}%)</td>
                                    <td style={{ ...styles.tdBold, textAlign: 'right' }}>{formatCurrency(gst.sgst)}</td>
                                </tr>
                                {getPFCharge() > 0 && (
                                    <tr>
                                        <td style={styles.tdBold}>P&F Charge</td>
                                        <td style={{ ...styles.tdBold, textAlign: 'right' }}>{formatCurrency(getPFCharge())}</td>
                                    </tr>
                                )}
                                {(invoiceData.deliveryCharge && invoiceData.deliveryCharge !== '') && (
                                    <tr>
                                        <td style={styles.tdBold}>Delivery Charge</td>
                                        <td style={{ ...styles.tdBold, textAlign: 'right' }}>{renderDeliveryCharge()}</td>
                                    </tr>
                                )}
                                <tr style={styles.totalRow}>
                                    <td style={styles.totalTd}>Total Amount</td>
                                    <td style={{ ...styles.totalTd, textAlign: 'right' }}>{formatCurrency(total)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Notes and Terms */}
                    {(invoiceData.notes || invoiceData.terms) && (
                        <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                            {invoiceData.notes && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={styles.labelSmall}>Notes</h3>
                                    <p style={{ ...styles.textSm, whiteSpace: 'pre-line' }}>{invoiceData.notes}</p>
                                </div>
                            )}
                            {invoiceData.terms && (
                                <div>
                                    <h3 style={styles.labelSmall}>Terms & Conditions</h3>
                                    <p style={{ ...styles.textSm, whiteSpace: 'pre-line' }}>{invoiceData.terms}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div style={styles.footer}>
                        <div style={styles.footerFlex}>
                            <div style={styles.textSm}>
                                <p style={{ fontWeight: '600' }}>Thank you for your business!</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '2rem' }}>Authorized Signature</p>
                                <div style={styles.signatureLine}></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}