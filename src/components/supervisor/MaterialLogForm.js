// construction/frontend/src/components/supervisor/MaterialLogForm.js
import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const MaterialLogForm = ({ materialEntry, onSave, onClose, siteId: initialSiteId }) => {
  const [formData, setFormData] = useState({
    siteId: initialSiteId || '',
    material: '',
    brand: '',
    quantity: '',
    unit: '',
    pricePerUnit: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [sites, setSites] = useState([]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await API.get('/projects');
        setSites(res.data);
      } catch (error) {
        toast.error('Failed to load sites.');
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();

    if (materialEntry) {
      setFormData({
        siteId: materialEntry.siteId._id || materialEntry.siteId,
        material: materialEntry.material || '',
        brand: materialEntry.brand || '',
        quantity: materialEntry.quantity || '',
        unit: materialEntry.unit || '',
        pricePerUnit: materialEntry.pricePerUnit || '',
        date: materialEntry.date
          ? new Date(materialEntry.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData(prev => ({
        ...prev,
        siteId: initialSiteId || '',
      }));
    }
  }, [materialEntry, initialSiteId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
      };

      if (materialEntry) {
        await API.put(`/materials/${materialEntry._id}`, payload);
        toast.success('Material entry updated successfully!');
      } else {
        await API.post('/materials', payload);
        toast.success('Material entry logged successfully!');
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error(
        `Failed to save material entry: ${
          error.response?.data?.message || error.message
        }`
      );
      console.error('Error saving material entry:', error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Site</label>
        <select
          name="siteId"
          value={formData.siteId}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
          disabled={!!initialSiteId}
        >
          <option value="">Select Site</option>
          {sites.map(site => (
            <option key={site._id} value={site._id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Material</label>
        <input
          type="text"
          name="material"
          value={formData.material}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Brand (Optional)</label>
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit</label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price Per Unit</label>
        <input
          type="number"
          name="pricePerUnit"
          value={formData.pricePerUnit}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {materialEntry ? 'Update Entry' : 'Log Material'}
        </button>
      </div>
    </form>
  );
};

export default MaterialLogForm;