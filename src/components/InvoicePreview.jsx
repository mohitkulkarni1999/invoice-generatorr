import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function InvoicePreview({ invoiceData }) {
    const invoiceRef = useRef()
    const [isGenerating, setIsGenerating] = useState(false)

    // --- Helper Functions ---

    const numberToWords = (num) => {
        if (!num) return ''
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const inWords = (n) => {
            if ((n = n.toString()).length > 9) return 'overflow';
            const n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n_array) return;
            let str = '';
            str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
            str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
            str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
            str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
            str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
            return str;
        }

        const [integerPart] = num.toString().split('.');
        return inWords(Number(integerPart)).trim();
    }

    const calculateSubtotal = () => {
        return invoiceData.items.reduce((sum, item) => sum + item.amount, 0)
    }

    const calculateGST = () => {
        const taxableValue = getTaxableValue();
        const cgst = taxableValue * (parseFloat(invoiceData.cgstRate) || 0) / 100
        const sgst = taxableValue * (parseFloat(invoiceData.sgstRate) || 0) / 100
        return { cgst, sgst }
    }

    const getPFCharge = () => {
        if (invoiceData.includePF === false) return 0
        return parseFloat(invoiceData.pfCharge) || 0
    }

    const getDeliveryCharge = () => {
        if (invoiceData.includeDelivery === false) return 0
        if (!invoiceData.deliveryCharge) return 0
        const deliveryChargeRaw = invoiceData.deliveryCharge.toString()
        const numericPart = deliveryChargeRaw.replace(/[^0-9.]/g, '')
        const deliveryChargeNum = parseFloat(numericPart)
        return (numericPart && !isNaN(deliveryChargeNum)) ? deliveryChargeNum : 0
    }

    const getTaxableValue = () => {
        return calculateSubtotal() + getPFCharge() + getDeliveryCharge();
    }

    const calculateTotal = () => {
        const gst = calculateGST()
        return getTaxableValue() + gst.cgst + gst.sgst
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const gst = calculateGST()
    const subtotal = calculateSubtotal()
    const taxableValue = getTaxableValue()
    const total = calculateTotal()
    const totalGST = gst.cgst + gst.sgst
    const rupees = (amount) => `₹ ${Number(amount).toFixed(2)}`

    const downloadPDF = async () => {
        try {
            setIsGenerating(true)
            const element = invoiceRef.current
            if (!element) return

            const canvas = await html2canvas(element, {
                scale: 2.0,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })

            const imgData = canvas.toDataURL('image/jpeg', 0.95)
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
            alert('Failed to generate PDF.')
        } finally {
            setIsGenerating(false)
        }
    }

    // --- Styles ---
    const accent = '#000'
    const ink = '#000'
    const muted = '#000'
    const font = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

    const styles = {
        container: { minHeight: '100vh', backgroundColor: '#eef2f7', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
        downloadBtn: { marginBottom: '1.5rem', alignSelf: 'flex-end', marginRight: 'calc(50% - 105mm)' },
        button: { backgroundColor: '#000', color: '#fff', fontWeight: 'bold', padding: '0.75rem 1.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },

        page: { width: '210mm', minHeight: '297mm', backgroundColor: '#ffffff', boxSizing: 'border-box', position: 'relative', fontFamily: font, color: ink, display: 'flex', flexDirection: 'column' },

        frame: { flex: '1', border: '2px solid #000', margin: '8mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },

        header: { padding: '8mm 12mm 5mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
        companyName: { fontSize: '21px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#000', marginBottom: '4px' },
        companyDetails: { fontSize: '10.5px', lineHeight: '1.6', color: '#000' },
        titleBox: { backgroundColor: '#ffffff', color: '#000', border: '2px solid #000', padding: '8px 18px', textAlign: 'center', whiteSpace: 'nowrap' },
        titleText: { fontSize: '17px', fontWeight: '800', letterSpacing: '1.5px' },
        metaText: { fontSize: '10.5px', textAlign: 'right', marginTop: '8px', lineHeight: '1.8', color: '#000' },

        divider: { height: '2px', backgroundColor: '#000', margin: '0 12mm 5mm' },

        infoGrid: { display: 'flex', padding: '0 12mm 6mm' },
        colLeft: { flex: '1.3', paddingRight: '14px', fontSize: '11px', lineHeight: '1.6' },
        colRight: { flex: '1', paddingLeft: '14px', fontSize: '11px', lineHeight: '1.8', borderLeft: '1px solid #000' },
        sectionLabel: { fontSize: '9px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '3px' },
        label: { fontWeight: '700', color: '#000' },
        partyName: { fontWeight: '700', fontSize: '13px', color: '#000', marginBottom: '3px' },
        address: { whiteSpace: 'pre-line', marginBottom: '5px', color: '#000' },

        table: { width: 'calc(100% - 24mm)', margin: '0 12mm 6mm', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #000' },
        th: { backgroundColor: '#ffffff', color: '#000', padding: '7px 8px', fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.5px', border: '1px solid #000' },
        td: { border: '1px solid #000', padding: '7px 8px', textAlign: 'center' },
        tdLeft: { border: '1px solid #000', padding: '7px 10px', textAlign: 'left' },
        tdRight: { border: '1px solid #000', padding: '7px 10px', textAlign: 'right' },
        rowAlt: { backgroundColor: '#ffffff' },
        summaryBg: { backgroundColor: '#ffffff' },

        notesSection: { display: 'flex', gap: '14px', padding: '0 12mm 6mm' },
        notesBlock: { flex: '1', backgroundColor: '#ffffff', border: '1px solid #000', padding: '8px 12px', fontSize: '10px', lineHeight: '1.6', color: '#000' },
        notesTitle: { fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#000', marginBottom: '3px' },

        footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', padding: '8mm 12mm 10mm' },
        paymentInfo: { fontSize: '10.5px', lineHeight: '1.7', color: '#000' },
        paymentTitle: { fontWeight: '800', fontSize: '12px', color: '#000', marginBottom: '4px' },
        signatureBox: { textAlign: 'center', minWidth: '170px' },
        signatureSpace: { height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' },

        pageNo: { position: 'absolute', bottom: '4mm', right: '12mm', fontSize: '9px', color: '#000' },
    }

    const hasNotes = invoiceData.notes || invoiceData.terms

    return (
        <div style={styles.container}>
            <div style={styles.downloadBtn}>
                <button onClick={downloadPDF} disabled={isGenerating} style={styles.button}>
                    {isGenerating ? 'Generating...' : 'Download PDF'}
                </button>
            </div>

            <div ref={invoiceRef} style={styles.page}>
                <div style={styles.frame}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <div style={styles.companyName}>{invoiceData.companyName || 'COMPANY NAME'}</div>
                        <div style={styles.companyDetails}>
                            {invoiceData.companyAddress}<br />
                            Contact No. {invoiceData.companyPhone} &nbsp;&nbsp; E-Mail: {invoiceData.companyEmail}
                        </div>
                    </div>
                    <div>
                        <div style={styles.titleBox}>
                            <div style={styles.titleText}>TAX INVOICE</div>
                        </div>
                        <div style={styles.metaText}>
                            <div><span style={styles.label}>INVOICE NO:</span> {invoiceData.invoiceNumber}</div>
                            <div><span style={styles.label}>DATE:</span> {formatDate(invoiceData.invoiceDate)}</div>
                            {invoiceData.dueDate && <div><span style={styles.label}>DUE DATE:</span> {formatDate(invoiceData.dueDate)}</div>}
                        </div>
                    </div>
                </div>

                <div style={styles.divider}></div>

                {/* Information Grid */}
                <div style={styles.infoGrid}>
                    <div style={styles.colLeft}>
                        <div style={styles.sectionLabel}>Billed To</div>
                        <div style={styles.partyName}>{invoiceData.clientName}</div>
                        <div style={styles.address}>{invoiceData.clientAddress}</div>
                        <div><span style={styles.label}>Contact:</span> {invoiceData.clientPhone}</div>
                        <div style={{ marginTop: '3px' }}><span style={styles.label}>GST:</span> {invoiceData.clientGSTIN}</div>
                    </div>
                    <div style={styles.colRight}>
                        <div style={styles.sectionLabel}>Company Details</div>
                        <div><span style={styles.label}>GSTIN:</span> {invoiceData.companyGSTIN}</div>
                        <div><span style={styles.label}>PAN:</span> {invoiceData.companyPAN}</div>
                        <div style={{ marginTop: '8px' }}><span style={styles.label}>PAYABLE TO:</span> {invoiceData.companyName}</div>
                        <div style={styles.address}>{invoiceData.companyAddress}</div>
                    </div>
                </div>

                {/* Items Table */}
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ ...styles.th, width: '40%' }}>Description</th>
                            <th style={{ ...styles.th, width: '15%' }}>HSN Code</th>
                            <th style={{ ...styles.th, width: '10%' }}>Qty</th>
                            <th style={{ ...styles.th, width: '15%' }}>Unit Price</th>
                            <th style={{ ...styles.th, width: '20%' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceData.items.map((item, index) => (
                            <tr key={index} style={index % 2 ? styles.rowAlt : null}>
                                <td style={styles.tdLeft}>
                                    <div style={{ fontWeight: '700' }}>{item.description}</div>
                                </td>
                                <td style={styles.td}>{item.hsnCode}</td>
                                <td style={styles.td}>{item.quantity}</td>
                                <td style={styles.tdRight}>{rupees(item.rate)}</td>
                                <td style={styles.tdRight}>{rupees(item.amount)}</td>
                            </tr>
                        ))}

                        {invoiceData.includePF !== false || invoiceData.includeDelivery !== false ? (
                        <tr style={styles.summaryBg}>
                            <td style={{ ...styles.tdLeft, fontWeight: '700' }}>P &amp; F + DELIVERY</td>
                            <td style={styles.td}></td>
                            <td style={styles.td}></td>
                            <td style={styles.td}></td>
                            <td style={styles.tdRight}>{rupees(getPFCharge() + getDeliveryCharge())}</td>
                        </tr>
                        ) : null}

                        {/* Taxable Value */}
                        <tr style={styles.summaryBg}>
                            <td style={{ ...styles.tdLeft, fontWeight: '700' }}>TAXABLE VALUE</td>
                            <td style={styles.td}></td>
                            <td style={styles.td}></td>
                            <td style={styles.td}></td>
                            <td style={{ ...styles.tdRight, fontWeight: '700' }}>{rupees(taxableValue)}</td>
                        </tr>

                        {/* SGST */}
                        <tr>
                            <td style={styles.tdLeft}>*SGST {invoiceData.sgstRate}%</td>
                            <td style={styles.td}></td>
                            <td style={styles.td}></td>
                            <td style={styles.td}></td>
                            <td style={styles.tdRight}>{rupees(gst.sgst)}</td>
                        </tr>

                        {/* CGST */}
                        <tr>
                            <td style={styles.tdLeft}>*CGST {invoiceData.cgstRate}%</td>
                            <td style={styles.td}></td>
                            <td style={styles.td}></td>
                            <td style={styles.td}></td>
                            <td style={styles.tdRight}>{rupees(gst.cgst)}</td>
                        </tr>

                        {/* Total GST */}
                        <tr style={styles.summaryBg}>
                            <td style={{ ...styles.tdLeft, fontWeight: '700' }}>TOTAL AMOUNT OF GST</td>
                            <td style={styles.td}></td>
                            <td style={styles.td}></td>
                            <td style={styles.td}></td>
                            <td style={{ ...styles.tdRight, fontWeight: '700' }}>{rupees(totalGST)}</td>
                        </tr>

                        {/* Summary Box */}
                        <tr>
                            <td colSpan="3" rowSpan="2" style={{ ...styles.tdLeft, verticalAlign: 'middle', padding: '12px 10px', backgroundColor: '#ffffff' }}>
                                <div style={{ fontSize: '11px' }}>
                                    <span style={{ fontWeight: '800' }}>Amount In Words:</span>{' '}
                                    <span style={{ color: ink }}>{numberToWords(Math.round(total))} Rupees Only</span>
                                </div>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', backgroundColor: '#ffffff', color: '#000', borderBottom: '1px solid #000' }}>SUBTOTAL</td>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', backgroundColor: '#ffffff', color: '#000', borderBottom: '1px solid #000' }}>{rupees(taxableValue)}</td>
                        </tr>
                        <tr>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', backgroundColor: '#ffffff', color: '#000' }}>GROSS TOTAL</td>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', backgroundColor: '#ffffff', color: '#000' }}>{rupees(total)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Notes & Terms */}
                {hasNotes && (
                    <div style={styles.notesSection}>
                        <div style={styles.notesBlock}>
                            <div style={styles.notesTitle}>Notes</div>
                            <div>{invoiceData.notes || '—'}</div>
                        </div>
                        <div style={styles.notesBlock}>
                            <div style={styles.notesTitle}>Terms &amp; Conditions</div>
                            <div>{invoiceData.terms || '—'}</div>
                        </div>
                    </div>
                )}

                {/* Bottom Footer */}
                <div style={styles.footer}>
                    <div style={styles.paymentInfo}>
                        <div style={styles.paymentTitle}>Payment Details</div>
                        <div>Bank Name: <span style={{ fontWeight: '700' }}>{invoiceData.bankName}</span></div>
                        <div>Account No: <span style={{ fontWeight: '700' }}>{invoiceData.accountNo}</span></div>
                        <div>Account Name: {invoiceData.accountName || invoiceData.companyName}</div>
                        <div>Account Type: {invoiceData.accountType}</div>
                        <div>IFSC: <span style={{ fontWeight: '700' }}>{invoiceData.ifsc}</span></div>
                    </div>
                    <div style={styles.signatureBox}>
                        <div style={{ fontSize: '10px', color: muted }}>Client Signature</div>
                        <div style={styles.signatureSpace}></div>
                        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', fontSize: '11px', fontWeight: '700' }}>
                            For {invoiceData.companyName}
                        </div>
                    </div>
                </div>
                </div>

                {/* Page Number */}
                <div style={styles.pageNo}>1</div>
            </div>
        </div>
    )
}
