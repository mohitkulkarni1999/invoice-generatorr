import { useState } from 'react'

export default function InvoiceForm({ invoiceData, setInvoiceData, onPreview }) {
    const handleInputChange = (field, value) => {
        setInvoiceData(prev => ({ ...prev, [field]: value }))
    }

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoiceData.items]
        newItems[index][field] = value

        // Calculate amount
        if (field === 'quantity' || field === 'rate') {
            const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(newItems[index].quantity) || 0
            const rate = field === 'rate' ? parseFloat(value) || 0 : parseFloat(newItems[index].rate) || 0
            newItems[index].amount = quantity * rate
        }

        setInvoiceData(prev => ({ ...prev, items: newItems }))
    }

    const addItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
        }))
    }

    const removeItem = (index) => {
        if (invoiceData.items.length > 1) {
            setInvoiceData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }))
        }
    }

    // Calculate totals
    const calculateSubtotal = () => {
        return invoiceData.items.reduce((sum, item) => sum + item.amount, 0)
    }

    const calculateCGST = () => {
        return calculateSubtotal() * (parseFloat(invoiceData.cgstRate) || 0) / 100
    }

    const calculateSGST = () => {
        return calculateSubtotal() * (parseFloat(invoiceData.sgstRate) || 0) / 100
    }

    const calculateTotal = () => {
        const pfCharge = parseFloat(invoiceData.pfCharge) || 0;

        if (!invoiceData.deliveryCharge) {
            return calculateSubtotal() + calculateCGST() + calculateSGST() + pfCharge;
        }

        const deliveryChargeRaw = invoiceData.deliveryCharge.toString();
        const numericPart = deliveryChargeRaw.replace(/[^0-9.]/g, '');
        const deliveryChargeNum = parseFloat(numericPart);
        const deliveryCharge = (numericPart && !isNaN(deliveryChargeNum)) ? deliveryChargeNum : 0;

        return calculateSubtotal() + calculateCGST() + calculateSGST() + pfCharge + deliveryCharge;
    }

    const renderDeliveryCharge = () => {
        if (!invoiceData.deliveryCharge) {
            return 'No Delivery Charge';
        }

        const deliveryChargeRaw = invoiceData.deliveryCharge.toString().trim();
        const numericPart = deliveryChargeRaw.replace(/[^0-9.]/g, '');
        const deliveryChargeNum = parseFloat(numericPart);

        if (numericPart && !isNaN(deliveryChargeNum)) {
            return formatCurrency(deliveryChargeNum);
        }

        return deliveryChargeRaw;
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount)
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 max-w-5xl mx-auto">
            <form className="space-y-4 md:space-y-5">
                {/* Company Details */}
                <div className="border-b pb-3 md:pb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">Company Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                            <input
                                type="text"
                                value={invoiceData.companyName}
                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Your Company Name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                            <input
                                type="text"
                                value={invoiceData.companyGSTIN}
                                onChange={(e) => handleInputChange('companyGSTIN', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="22AAAAA0000A1Z5"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Address *</label>
                            <textarea
                                value={invoiceData.companyAddress}
                                onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="2"
                                placeholder="Company Address"
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="text"
                                value={invoiceData.companyPhone}
                                onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={invoiceData.companyEmail}
                                onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="company@example.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="border-b pb-3 md:pb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">Invoice Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                            <input
                                type="text"
                                value={invoiceData.invoiceNumber}
                                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="INV-001"
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
                            <input
                                type="date"
                                value={invoiceData.invoiceDate}
                                onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={invoiceData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Client Details */}
                <div className="border-b pb-3 md:pb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">Bill To</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                            <input
                                type="text"
                                value={invoiceData.clientName}
                                onChange={(e) => handleInputChange('clientName', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Client Name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Client GSTIN</label>
                            <input
                                type="text"
                                value={invoiceData.clientGSTIN}
                                onChange={(e) => handleInputChange('clientGSTIN', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="22AAAAA0000A1Z5"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Client Address *</label>
                            <textarea
                                value={invoiceData.clientAddress}
                                onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="2"
                                placeholder="Client Address"
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="border-b pb-3 md:pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">Items</h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                        >
                            + Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {invoiceData.items.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-2 md:p-3 rounded">
                                <div className="grid grid-cols-1 gap-2">
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            className="w-full px-2 md:px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Item description"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Rate (₹)</label>
                                            <input
                                                type="number"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                                            <input
                                                type="text"
                                                value={formatCurrency(item.amount)}
                                                readOnly
                                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-gray-100 font-semibold"
                                            />
                                        </div>
                                    </div>

                                    {invoiceData.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GST Settings */}
                <div className="border-b pb-3 md:pb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">GST Settings</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">CGST (%)</label>
                            <input
                                type="number"
                                value={invoiceData.cgstRate}
                                onChange={(e) => handleInputChange('cgstRate', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">SGST (%)</label>
                            <input
                                type="number"
                                value={invoiceData.sgstRate}
                                onChange={(e) => handleInputChange('sgstRate', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">P&F Charge</label>
                            <input
                                type="number"
                                value={invoiceData.pfCharge}
                                onChange={(e) => handleInputChange('pfCharge', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="P&F Charge"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Delivery Charge</label>
                            <input
                                type="text"
                                value={invoiceData.deliveryCharge}
                                onChange={(e) => handleInputChange('deliveryCharge', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Delivery Charge"
                            />
                        </div>
                    </div>
                </div>

                {/* Calculation Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 md:p-4 border border-blue-200">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">Invoice Summary</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center pb-1.5 border-b border-blue-200">
                            <span className="text-xs md:text-sm text-gray-700">Subtotal:</span>
                            <span className="text-sm md:text-base font-semibold text-gray-800">{formatCurrency(calculateSubtotal())}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1.5 border-b border-blue-200">
                            <span className="text-xs md:text-sm text-gray-700">CGST ({invoiceData.cgstRate}%):</span>
                            <span className="text-sm md:text-base font-semibold text-gray-800">{formatCurrency(calculateCGST())}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1.5 border-b border-blue-200">
                            <span className="text-xs md:text-sm text-gray-700">SGST ({invoiceData.sgstRate}%):</span>
                            <span className="text-sm md:text-base font-semibold text-gray-800">{formatCurrency(calculateSGST())}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1.5 border-b border-blue-200">
                            <span className="text-xs md:text-sm text-gray-700">P&F Charge:</span>
                            <span className="text-sm md:text-base font-semibold text-gray-800">{formatCurrency(invoiceData.pfCharge || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1.5 border-b border-blue-200">
                            <span className="text-xs md:text-sm text-gray-700">Delivery Charge:</span>
                            <span className="text-sm md:text-base font-semibold text-gray-800">{renderDeliveryCharge()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                            <span className="text-sm md:text-base font-bold text-gray-800">Total Amount:</span>
                            <span className="text-lg md:text-xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                        </div>
                    </div>
                </div>

                {/* Notes and Terms */}
                <div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                value={invoiceData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                                placeholder="Additional notes..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                            <textarea
                                value={invoiceData.terms}
                                onChange={(e) => handleInputChange('terms', e.target.value)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                                placeholder="Terms and conditions..."
                            />
                        </div>
                    </div>
                </div>

                {/* Preview Button */}
                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={onPreview}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-4 md:px-6 py-2 md:py-2.5 rounded-lg shadow-lg transition-all duration-200 text-sm md:text-base"
                    >
                        Preview & Download Invoice
                    </button>
                </div>
            </form>
        </div>
    )
}