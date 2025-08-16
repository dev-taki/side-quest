'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Edit, DollarSign, Package, Loader2, X, Save } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';
import { ItemsService, Item, CreateItemData, UpdateItemData, dollarsToCents, centsToDollars } from '../../services/itemsService';
import AdminBottomNav from '../../components/AdminBottomNav';

const BUSINESS_ID = 'a16c462c-e0e8-45f9-81d4-a344874fc46c';

export default function ItemsManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    item_display_name: '',
    item_description: '',
    item_price: '',
    Type: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!AdminAuthService.isAuthenticated()) {
        router.push('/admin/login');
        return;
      }

      try {
        const isAdmin = await AdminAuthService.verifyAdminStatus();
        if (!isAdmin) {
          AdminAuthService.removeAuthToken();
          router.push('/admin/login');
          return;
        }

        await loadItems();
      } catch (error) {
        AdminAuthService.removeAuthToken();
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadItems = async () => {
    try {
      const itemsData = await ItemsService.getVendorItems(BUSINESS_ID);
      setItems(itemsData);
    } catch (error: any) {
      setError(error.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      item_name: '',
      item_display_name: '',
      item_description: '',
      item_price: '',
      Type: ''
    });
    setShowAddForm(true);
    setError('');
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      item_display_name: item.item_display_name,
      item_description: item.item_description,
      item_price: centsToDollars(item.item_price).toString(),
      Type: item.Type
    });
    setShowAddForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const priceInCents = dollarsToCents(parseFloat(formData.item_price) || 0);

      if (editingItem) {
        // Update existing item
        const updateData: UpdateItemData = {
          business_id: BUSINESS_ID,
          item_name: formData.item_name,
          item_display_name: formData.item_display_name,
          item_description: formData.item_description,
          item_price: priceInCents,
          item_id: editingItem.item_id,
          Type: formData.Type
        };

        await ItemsService.updateItem(updateData);
      } else {
        // Add new item
        const createData: CreateItemData = {
          business_id: BUSINESS_ID,
          item_name: formData.item_name,
          item_display_name: formData.item_display_name,
          item_description: formData.item_description,
          item_price: priceInCents
        };

        await ItemsService.addItem(createData);
      }

      await loadItems();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error: any) {
      setError(error.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Items Management</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-24">
        {/* Add Item Button */}
        <div className="mb-6">
          <button
            onClick={handleAddItem}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Item
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.item_display_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.item_name}</p>
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {centsToDollars(item.item_price).toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => handleEditItem(item)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              
              {item.item_description && (
                <div 
                  className="text-sm text-gray-700 mb-3"
                  dangerouslySetInnerHTML={{ __html: item.item_description }}
                />
              )}
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  SKU: {item.item_sku}
                </span>
                {item.Type && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                    {item.Type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && !loading && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No items found. Add your first item to get started.</p>
          </div>
        )}
      </main>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.item_name}
                    onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.item_display_name}
                    onChange={(e) => setFormData({...formData, item_display_name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.item_description}
                    onChange={(e) => setFormData({...formData, item_description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter item description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.item_price}
                      onChange={(e) => setFormData({...formData, item_price: e.target.value})}
                      required
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <input
                    type="text"
                    value={formData.Type}
                    onChange={(e) => setFormData({...formData, Type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter item type"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        {editingItem ? 'Update' : 'Add'} Item
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <AdminBottomNav />
    </div>
  );
}
