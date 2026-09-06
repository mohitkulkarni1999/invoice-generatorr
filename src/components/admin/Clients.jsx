import { useEffect, useState } from 'react'
import { api } from './api'

export default function Clients() {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState(null)

    const [formData, setFormData] = useState({
        client_name: '',
        client_gstin: '',
        client_phone: '',
        client_address: '',
    })

    const fetchClients = async () => {
        try {
            setLoading(true)
            const data = await api('/api/clients')
            setClients(data || [])
        } catch (error) {
            console.error('Error fetching clients:', error)
            alert('Failed to load clients')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const resetForm = () => {
        setFormData({
            client_name: '',
            client_gstin: '',
            client_phone: '',
            client_address: '',
        })

        setEditingId(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.client_name.trim()) {
            alert('Client Name is required')
            return
        }

        try {
            setSaving(true)

            if (editingId) {
                await api(`/api/clients/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                })
            } else {
                await api('/api/clients', {
                    method: 'POST',
                    body: JSON.stringify(formData),
                })
            }

            resetForm()
            await fetchClients()

        } catch (error) {
            console.error('Error saving client:', error)
            alert(error.message || 'Failed to save client')
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (client) => {
        setEditingId(client.id)

        setFormData({
            client_name: client.client_name || '',
            client_gstin: client.client_gstin || '',
            client_phone: client.client_phone || '',
            client_address: client.client_address || '',
        })

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this client?'
        )

        if (!confirmed) return

        try {
            await api(`/api/clients/${id}`, {
                method: 'DELETE',
            })

            if (editingId === id) {
                resetForm()
            }

            await fetchClients()

        } catch (error) {
            console.error('Error deleting client:', error)
            alert(error.message || 'Failed to delete client')
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Clients
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage your saved clients and their billing details.
                    </p>
                </div>

                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
                    {clients.length} {clients.length === 1 ? 'Client' : 'Clients'}
                </div>
            </div>

            {/* Add / Edit Client */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            {editingId ? 'Edit Client' : 'Add New Client'}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                            {editingId
                                ? 'Update the client information below.'
                                : 'Save client details for quick invoice creation.'}
                        </p>
                    </div>

                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-gray-500 hover:text-gray-800 font-medium"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-5">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Client Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Client Name <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                name="client_name"
                                value={formData.client_name}
                                onChange={handleChange}
                                placeholder="Enter client name"
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>

                        {/* GSTIN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Client GSTIN
                            </label>

                            <input
                                type="text"
                                name="client_gstin"
                                value={formData.client_gstin}
                                onChange={handleChange}
                                placeholder="Enter GSTIN"
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition uppercase"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Client Phone
                            </label>

                            <input
                                type="text"
                                name="client_phone"
                                value={formData.client_phone}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Client Address
                            </label>

                            <textarea
                                name="client_address"
                                value={formData.client_address}
                                onChange={handleChange}
                                placeholder="Enter complete client address"
                                rows="3"
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                            />
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-5">

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-60"
                        >
                            {saving
                                ? 'Saving...'
                                : editingId
                                    ? 'Update Client'
                                    : '+ Add Client'}
                        </button>

                    </div>
                </form>
            </div>

            {/* Client List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                <div className="px-5 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">
                        Saved Clients
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                        Select a client while generating an invoice to automatically
                        fill their details.
                    </p>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500 text-sm">
                        Loading clients...
                    </div>
                ) : clients.length === 0 ? (

                    <div className="p-10 text-center">

                        <div className="text-4xl mb-3">
                            👥
                        </div>

                        <h4 className="font-semibold text-gray-700">
                            No clients added yet
                        </h4>

                        <p className="text-sm text-gray-500 mt-1">
                            Add your first client using the form above.
                        </p>

                    </div>

                ) : (

                    <div className="divide-y divide-gray-100">

                        {clients.map((client) => (

                            <div
                                key={client.id}
                                className="p-4 sm:p-5 hover:bg-gray-50 transition"
                            >

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                                    {/* Client Info */}
                                    <div className="min-w-0">

                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                {client.client_name?.charAt(0)?.toUpperCase() || 'C'}
                                            </div>

                                            <h4 className="font-bold text-gray-800 truncate">
                                                {client.client_name}
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">

                                            <div>
                                                <span className="text-gray-400">
                                                    GSTIN:
                                                </span>{' '}
                                                <span className="text-gray-700 font-medium">
                                                    {client.client_gstin || '—'}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-gray-400">
                                                    Phone:
                                                </span>{' '}
                                                <span className="text-gray-700 font-medium">
                                                    {client.client_phone || '—'}
                                                </span>
                                            </div>

                                            <div className="sm:col-span-2">
                                                <span className="text-gray-400">
                                                    Address:
                                                </span>{' '}
                                                <span className="text-gray-700">
                                                    {client.client_address || '—'}
                                                </span>
                                            </div>

                                        </div>

                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 shrink-0">

                                        <button
                                            type="button"
                                            onClick={() => handleEdit(client)}
                                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-sm transition"
                                        >
                                            ✏️ Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(client.id)}
                                            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm transition"
                                        >
                                            🗑 Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    )
}