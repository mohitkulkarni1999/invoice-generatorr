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
        return calculateSubtotal() + calculateCGST() + calculateSGST()
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount)
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
            <form className="space-y-6 lg:space-y-8">
                {/* Company Details */}
                <div className="border-b pb-4 sm:pb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Company Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                            <input
                                type="text"
                                value={invoiceData.companyName}
                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Your Company Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                            <input
                                type="text"
                                value={invoiceData.companyGSTIN}
                                onChange={(e) => handleInputChange('companyGSTIN', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="22AAAAA0000A1Z5"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                            <textarea
                                value={invoiceData.companyAddress}
                                onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="2"
                                placeholder="Company Address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                                type="text"
                                value={invoiceData.companyPhone}
                                onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={invoiceData.companyEmail}
                                onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="company@example.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="border-b pb-4 sm:pb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Invoice Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number *</label>
                            <input
                                type="text"
                                value={invoiceData.invoiceNumber}
                                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="INV-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date *</label>
                            <input
                                type="date"
                                value={invoiceData.invoiceDate}
                                onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                            <input
                                type="date"
                                value={invoiceData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Client Details */}
                <div className="border-b pb-4 sm:pb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Bill To</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                            <input
                                type="text"
                                value={invoiceData.clientName}
                                onChange={(e) => handleInputChange('clientName', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Client Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Client GSTIN</label>
                            <input
                                type="text"
                                value={invoiceData.clientGSTIN}
                                onChange={(e) => handleInputChange('clientGSTIN', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="22AAAAA0000A1Z5"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Client Address *</label>
                            <textarea
                                value={invoiceData.clientAddress}
                                onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="2"
                                placeholder="Client Address"
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="border-b pb-4 sm:pb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Items</h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                        >
                            + Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {invoiceData.items.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    {/* Description - Full width on mobile */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Item description"
                                        />
                                    </div>

                                    {/* Quantity, Rate, Amount in a row */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Qty</label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Rate (₹)</label>
                                            <input
                                                type="number"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Amount</label>
                                            <input
                                                type="text"
                                                value={formatCurrency(item.amount)}
                                                readOnly
                                                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-gray-100 font-semibold"
                                            />
                                        </div>
                                    </div>

                                    {/* Remove button */}
                                    {invoiceData.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                                        >
                                            Remove Item
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GST Settings */}
                <div className="border-b pb-4 sm:pb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">GST Settings</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CGST (%)</label>
                            <input
                                type="number"
                                value={invoiceData.cgstRate}
                                onChange={(e) => handleInputChange('cgstRate', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SGST (%)</label>
                            <input
                                type="number"
                                value={invoiceData.sgstRate}
                                onChange={(e) => handleInputChange('sgstRate', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                {/* Calculation Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Invoice Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                            <span className="text-sm sm:text-base text-gray-700">Subtotal:</span>
                            <span className="text-base sm:text-lg font-semibold text-gray-800">{formatCurrency(calculateSubtotal())}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                            <span className="text-sm sm:text-base text-gray-700">CGST ({invoiceData.cgstRate}%):</span>
                            <span className="text-base sm:text-lg font-semibold text-gray-800">{formatCurrency(calculateCGST())}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                            <span className="text-sm sm:text-base text-gray-700">SGST ({invoiceData.sgstRate}%):</span>
                            <span className="text-base sm:text-lg font-semibold text-gray-800">{formatCurrency(calculateSGST())}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 bg-white rounded-lg px-4 py-3 shadow-sm">
                            <span className="text-base sm:text-lg font-bold text-gray-800">Total Amount:</span>
                            <span className="text-xl sm:text-2xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                        </div>
                    </div>
                </div>

                {/* Notes and Terms */}
                <div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea
                                value={invoiceData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                                placeholder="Additional notes..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                            <textarea
                                value={invoiceData.terms}
                                onChange={(e) => handleInputChange('terms', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                                placeholder="Terms and conditions..."
                            />
                        </div>
                    </div>
                </div>

                {/* Preview Button */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onPreview}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                    >
                        Preview & Download Invoice
                    </button>
                </div>
            </form>
        </div>
    )
}
