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

        const [integerPart, decimalPart] = num.toString().split('.');
        let output = inWords(Number(integerPart));

        // Handle decimals if needed, but usually invoice amount in words is just main currency
        return output.trim();
    }

    const calculateSubtotal = () => {
        return invoiceData.items.reduce((sum, item) => sum + item.amount, 0)
    }

    const calculateGST = () => {
        // Taxable Value is usually Subtotal + P&F + Delivery (if applicable for tax)
        // Assuming P&F is taxable. If not, adjust accordingly. 
        // Based on image "Taxable Value" row comes before SGST/CGST.
        const taxableValue = getTaxableValue();
        const cgst = taxableValue * (parseFloat(invoiceData.cgstRate) || 0) / 100
        const sgst = taxableValue * (parseFloat(invoiceData.sgstRate) || 0) / 100
        return { cgst, sgst }
    }

    const getPFCharge = () => {
        return parseFloat(invoiceData.pfCharge) || 0
    }

    const getDeliveryCharge = () => {
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount).replace('₹', '₹ ') // Add space after symbol if needed
    }

    const formatDate = (dateString, format = 'dd/mm/yy') => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().substr(-2); // YY format
        const fullYear = date.getFullYear();

        if (format === 'dd/mm/yy') return `${day}/${month}/${year}`;
        return `${day}/${month}/${fullYear}`;
    }

    const gst = calculateGST()
    const subtotal = calculateSubtotal()
    const taxableValue = getTaxableValue()
    const total = calculateTotal()
    const totalGST = gst.cgst + gst.sgst

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
    const styles = {
        container: { minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
        downloadBtn: { marginBottom: '1.5rem', alignSelf: 'flex-end', marginRight: 'calc(50% - 105mm)' }, // Approx A4 width center alignment
        button: { backgroundColor: '#000', color: '#fff', fontWeight: 'bold', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' },

        // A4 Paper
        page: { width: '210mm', minHeight: '297mm', backgroundColor: 'white', padding: '10mm', boxSizing: 'border-box', position: 'relative', fontFamily: '"Courier New", Courier, monospace', color: '#000' },

        // Main Border Box
        mainBorder: { border: '2px solid #000', height: '100%', display: 'flex', flexDirection: 'column' },

        // Header
        header: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 20px', borderBottom: '2px solid #000' },
        companyName: { fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '1px' },
        companyDetails: { fontSize: '10px', lineHeight: '1.4', color: '#333' },

        // Tax Invoice Title
        taxInvoiceTitleBox: { width: '100%', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5px 0', backgroundColor: '#f9f9f9', fontFamily: '"Courier New", Courier, monospace' },
        taxInvoiceTitle: { fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' },

        // Info Grid
        infoGrid: { display: 'flex', borderBottom: '2px solid #000' },
        colLeft: { flex: '1.2', borderRight: '2px solid #000', padding: '10px', fontSize: '11px', lineHeight: '1.5' },
        colRight: { flex: '0.8', padding: '10px', fontSize: '11px', lineHeight: '1.5' },

        label: { fontWeight: 'bold' },
        partyName: { fontWeight: 'bold', fontSize: '12px', marginTop: '5px' },
        address: { whiteSpace: 'pre-line', marginBottom: '5px' },

        // Table
        tableContainer: { flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center' },
        table: { width: '95%', borderCollapse: 'collapse', fontSize: '10px', margin: '10px auto', border: '2px solid #000', fontFamily: '"Courier New", Courier, monospace' },
        th: { border: '1px solid #000', padding: '5px', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }, // Removed header background
        td: { border: '1px solid #000', padding: '5px', textAlign: 'center' }, // Centered by default
        tdLeft: { border: '1px solid #000', padding: '5px 8px', textAlign: 'left' },
        tdRight: { border: '1px solid #000', padding: '5px 8px', textAlign: 'right' },
        tdPrice: { border: '1px solid #000', padding: '5px 8px' }, // New style for price cells

        // Sub-rows
        rowLabel: { textAlign: 'left', paddingLeft: '8px' },

        // Footer Area
        footerSection: { display: 'flex', borderTop: '2px solid #000' }, // Separates table from footer content if needed
        amountInWordsBox: { flex: '1', padding: '10px', fontSize: '11px', borderRight: '2px solid #000', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
        totalsBox: { width: '35%', fontSize: '11px' },
        totalRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #000' },
        lastTotalRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 10px', fontWeight: 'bold' },

        // Bottom Footer
        bottomFooter: { padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px', paddingTop: '30px' },
        paymentInfo: { lineHeight: '1.6' },
        signatureBox: { textAlign: 'center' },
        signatureSpace: { height: '40px' }
    }

    return (
        <div style={styles.container}>
            <div style={styles.downloadBtn}>
                <button onClick={downloadPDF} disabled={isGenerating} style={styles.button}>
                    {isGenerating ? 'Generating...' : 'Download PDF'}
                </button>
            </div>

            <div ref={invoiceRef} style={styles.page}>
                <div style={styles.mainBorder}>

                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.companyName}>{invoiceData.companyName || 'COMPANY NAME'}</div>
                        <div style={styles.companyDetails}>
                            {invoiceData.companyAddress}<br />
                            Contact No. {invoiceData.companyPhone} &nbsp; E-Mail: {invoiceData.companyEmail}
                        </div>
                    </div>

                    {/* Tax Invoice Title */}
                    <div style={styles.taxInvoiceTitleBox}>
                        <div style={styles.taxInvoiceTitle}>TAX INVOICE</div>
                    </div>

                    {/* Information Grid */}
                    <div style={styles.infoGrid}>
                        <div style={styles.colLeft}>
                            <div><span style={styles.label}>GST:</span> {invoiceData.companyGSTIN}</div>
                            <div><span style={styles.label}>PAN:</span> {invoiceData.companyPAN}</div>

                            <div style={{ marginTop: '15px', color: '#555', fontSize: '9px' }}>PARTY NAME TO:</div>
                            <div style={styles.partyName}>{invoiceData.clientName}</div>
                            <div style={styles.address}>{invoiceData.clientAddress}</div>

                            <div><span style={styles.label}>CONTACT-</span> {invoiceData.clientPhone}</div>
                            <div style={{ marginTop: '5px' }}><span style={styles.label}>GST:-</span> {invoiceData.clientGSTIN}</div>
                        </div>
                        <div style={styles.colRight}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>INVOICE NO: {invoiceData.invoiceNumber}</span>
                                <span>{invoiceData.invoiceDate ? formatDate(invoiceData.invoiceDate).split('/').slice(-1)[0] : '26-27'}</span> {/* Invoice Year hack or clean usage */}
                            </div>
                            <div style={{ marginBottom: '10px' }}>DATE: {formatDate(invoiceData.invoiceDate)}</div>

                            <div style={{ marginTop: '15px', color: '#555', fontSize: '9px' }}>PAYBLE TO:- <span style={{ color: '#000', fontWeight: 'bold', fontSize: '11px' }}>{invoiceData.companyName}</span></div>
                            <div style={styles.address}>{invoiceData.companyAddress}</div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={styles.table}>
                        <thead>
                            <tr style={{ height: '35px' }}>
                                <th style={{ ...styles.th, width: '40%' }}>DESCRIPTION</th>
                                <th style={{ ...styles.th, width: '15%' }}>HSN<br />CODE</th>
                                <th style={{ ...styles.th, width: '10%' }}>QTY</th>
                                <th style={{ ...styles.th, width: '15%' }}>UNIT PRICE</th>
                                <th style={{ ...styles.th, width: '20%' }}>SUBTOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items.map((item, index) => (
                                <tr key={index}>
                                    <td style={styles.tdLeft}>
                                        <div style={{ fontWeight: 'bold' }}>{item.description}</div>
                                        {/* Optional dimensions or details if added later */}
                                    </td>
                                    <td style={styles.td}>{item.hsnCode}</td>
                                    <td style={styles.td}>{item.quantity}</td>
                                    <td style={styles.tdPrice}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>₹</span>
                                            <span>{Number(item.rate).toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td style={styles.tdPrice}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>₹</span>
                                            <span>{Number(item.amount).toFixed(2)}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* Empty rows filler for visual balance if needed, or dynamic margin */}
                            {/* Minimum rows logic can be added here */}

                            {/* Calculation Rows inside Table Structure as per image */}
                            <tr>
                                <td style={styles.tdLeft}>P & F + DELIVERY</td>
                                <td style={styles.td}></td>
                                <td style={styles.td}></td>
                                <td style={styles.tdPrice}>
                                    {/* Empty unit price for P&F */}
                                </td>
                                <td style={styles.tdPrice}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>₹</span>
                                        <span>{(getPFCharge() + getDeliveryCharge()).toFixed(2)}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style={styles.tdLeft}>TAXABLE VALUE</td>
                                <td style={styles.td}></td>
                                <td style={styles.td}></td>
                                <td style={styles.td}></td>
                                <td style={styles.tdPrice}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>₹</span>
                                        <span>{taxableValue.toFixed(2)}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style={styles.tdLeft}>*SGST {invoiceData.sgstRate}%</td>
                                <td style={styles.td}></td>
                                <td style={styles.td}></td>
                                <td style={styles.td}></td>
                                <td style={styles.tdPrice}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>₹</span>
                                        <span>{gst.sgst.toFixed(2)}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style={styles.tdLeft}>*CGST {invoiceData.cgstRate}%</td>
                                <td style={styles.td}></td>
                                <td style={styles.td}></td>
                                <td style={styles.td}></td>
                                <td style={styles.tdPrice}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>₹</span>
                                        <span>{gst.cgst.toFixed(2)}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style={styles.tdLeft}>Total Amount of GST</td>
                                <td style={styles.td}></td>
                                <td style={styles.td}></td>
                                <td style={styles.td}></td>
                                <td style={styles.tdPrice}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>₹</span>
                                        <span>{totalGST.toFixed(2)}</span>
                                    </div>
                                </td>
                            </tr>

                            {/* Footer Rows - Merged back into Table to be attached */}
                            <tr style={{ borderTop: '2px solid #000' }}>
                                <td colSpan="3" rowSpan="2" style={{ ...styles.tdLeft, verticalAlign: 'middle', padding: '10px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                                        Amount In Words: {numberToWords(Math.round(total))} Rupees Only
                                    </div>
                                </td>
                                <td style={{ ...styles.tdBold, textAlign: 'center', padding: '10px', borderBottom: '1px solid #000' }}>SUBTOTAL</td>
                                <td style={{ ...styles.tdPrice, fontWeight: 'bold', fontSize: '11px', borderBottom: '1px solid #000' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>₹</span>
                                        <span>{total.toFixed(2)}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ ...styles.tdBold, textAlign: 'center', padding: '10px' }}>GROSS TOTAL</td>
                                <td style={{ ...styles.tdPrice, fontWeight: 'bold', fontSize: '11px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>₹</span>
                                        <span>{total.toFixed(2)}</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Check if we need to remove any trailing closing tags from previous edits if they exist, or just close the table cleanly here */}

                    {/* Spacer to push footer down if content is short */}
                    <div style={{ flex: 1 }}></div>



                    {/* Bottom Footer: Payment Info & Signatures */}
                    <div style={styles.bottomFooter}>
                        <div style={styles.paymentInfo}>
                            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>Payment info:</div>
                            <div>Bank Name: {invoiceData.bankName}</div>
                            <div>Account No: {invoiceData.accountNo}</div>
                            <div>Account Name: {invoiceData.accountName || invoiceData.companyName}</div>
                            <div>Account Type: {invoiceData.accountType}</div>
                            <div>IFSC : {invoiceData.ifsc}</div>
                        </div>
                        <div style={styles.signatureBox}>
                            <div style={{ marginBottom: '40px', textAlign: 'right', fontSize: '10px', color: '#666' }}>Client Signature</div>
                            <div style={{ fontSize: '11px' }}>For {invoiceData.companyName}</div>
                        </div>
                    </div>
                </div>
                {/* Page Number (outside border) */}
                <div style={{ position: 'absolute', bottom: '5px', left: '15px', fontSize: '10px', color: '#fff', backgroundColor: '#333', padding: '2px 6px', borderRadius: '2px' }}>1</div>
            </div>
        </div>
    )
}