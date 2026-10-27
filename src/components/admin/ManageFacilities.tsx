import React, { useState, useEffect } from 'react';
import { CampusFacility } from '../../types';
import { 
  getFacilities, 
  addFacility, 
  updateFacility, 
  deleteFacility 
} from '../../lib/storageService';
import { useNotifications } from '../../context/NotificationContext';
import { ConfirmationModal } from './ConfirmationModal';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  MapPin, 
  Clock, 
  User, 
  X, 
  RefreshCw, 
  Layers
} from 'lucide-react';

const CATEGORIES: CampusFacility['category'][] = [
  'Academic',
  'Sports',
  'Recreation',
  'Health',
  'Canteen',
  'Admin'
];

export const ManageFacilities: React.FC = () => {
  const { addNotification } = useNotifications();
  const [facilities, setFacilities] = useState<CampusFacility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal states
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingItem, setEditingItem] = useState<CampusFacility | null>(null);
  const [deletingItem, setDeletingItem] = useState<CampusFacility | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<CampusFacility['category']>('Academic');
  const [location, setLocation] = useState<string>('');
  const [block, setBlock] = useState<string>('Block A');
  const [timings, setTimings] = useState<string>('8:00 AM - 6:00 PM');
  const [description, setDescription] = useState<string>('');
  const [featuresStr, setFeaturesStr] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [inCharge, setInCharge] = useState<string>('');

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const data = await getFacilities();
      setFacilities(data);
    } catch (e) {
      console.error('Error fetching facilities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const openCreateModal = () => {
    setName('');
    setCategory('Academic');
    setLocation('Central Knowledge Complex');
    setBlock('Block A');
    setTimings('8:00 AM - 8:00 PM');
    setDescription('');
    setFeaturesStr('Wi-Fi Enabled, Air Conditioned, Discussion Pods');
    setImage('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80');
    setInCharge('Estate Officer');
    setEditingItem(null);
    setModalMode('create');
  };

  const openEditModal = (f: CampusFacility) => {
    setEditingItem(f);
    setName(f.name);
    setCategory(f.category);
    setLocation(f.location);
    setBlock(f.block);
    setTimings(f.timings);
    setDescription(f.description);
    setFeaturesStr((f.features || []).join(', '));
    setImage(f.image);
    setInCharge(f.inCharge);
    setModalMode('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const features = featuresStr.split(',').map(s => s.trim()).filter(Boolean);

      if (modalMode === 'create') {
        const created = await addFacility({
          name: name.trim(),
          category,
          location: location.trim(),
          block: block.trim(),
          timings: timings.trim(),
          description: description.trim(),
          features,
          image: image.trim() || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
          inCharge: inCharge.trim()
        });
        setFacilities(prev => [created, ...prev]);
        addNotification('Facility Created', `Registered ${created.name} in Campus Infrastructure.`, 'notice');
      } else if (modalMode === 'edit' && editingItem) {
        const updated = await updateFacility({
          ...editingItem,
          name: name.trim(),
          category,
          location: location.trim(),
          block: block.trim(),
          timings: timings.trim(),
          description: description.trim(),
          features,
          image: image.trim(),
          inCharge: inCharge.trim()
        });
        setFacilities(prev => prev.map(f => f.id === updated.id ? updated : f));
        addNotification('Facility Updated', `Updated specifications for ${updated.name}.`, 'notice');
      }

      setModalMode(null);
    } catch (err: any) {
      addNotification('Action Failed', err.message || 'Could not save facility.', 'alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);

    try {
      await deleteFacility(deletingItem.id, deletingItem.name);
      setFacilities(prev => prev.filter(f => f.id !== deletingItem.id));
      addNotification('Facility Removed', `Decommissioned ${deletingItem.name}.`, 'notice');
      setDeletingItem(null);
    } catch (err: any) {
      addNotification('Deletion Failed', err.message || 'Could not delete facility.', 'alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = facilities.filter(f => {
    if (categoryFilter !== 'All' && f.category !== categoryFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q) ||
      f.block.toLowerCase().includes(q) ||
      f.inCharge.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Campus Facilities &amp; Physical Infrastructure
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-500 border border-sky-500/25">
              {facilities.length} Managed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Maintain central library, research computing clusters, auditoriums, and campus laboratories
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={fetchFacilities}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Reload from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 text-xs font-bold flex items-center space-x-1.5 shadow-sm btn-tactile cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-navy-900 rounded-2xl p-3 border border-slate-200/80 dark:border-navy-800 shadow-xs">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              categoryFilter === 'All'
                ? 'bg-navy-900 text-white dark:bg-amber-500 dark:text-navy-950'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-navy-900 text-white dark:bg-amber-500 dark:text-navy-950'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] sm:min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facility name, block, in-charge..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(fac => (
            <div
              key={fac.id}
              className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-navy-700 transition-all group"
            >
              <div>
                <div className="h-36 w-full relative overflow-hidden bg-slate-100 dark:bg-navy-950">
                  <img
                    src={fac.image}
                    alt={fac.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs border border-white/20">
                      {fac.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[11px] font-bold text-amber-400 font-mono">
                      {fac.block}
                    </span>
                    <h4 className="text-sm font-extrabold text-white truncate drop-shadow-sm">
                      {fac.name}
                    </h4>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {fac.description}
                  </p>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{fac.location}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{fac.timings}</span>
                    </div>
                    {fac.inCharge && (
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">In-Charge: {fac.inCharge}</span>
                      </div>
                    )}
                  </div>

                  {fac.features && fac.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {fac.features.slice(0, 3).map((feat, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                          {feat}
                        </span>
                      ))}
                      {fac.features.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-bold">
                          +{fac.features.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-2 border-t border-slate-100 dark:border-navy-800/80 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => openEditModal(fac)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingItem(fac)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-navy-800 space-y-2">
          <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-navy-700" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No campus facilities match your filters</h4>
          <p className="text-xs text-slate-400">Click &ldquo;Add Facility&rdquo; to register new laboratories, study carrels, or grounds.</p>
        </div>
      )}

      {/* Create / Edit Facility Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              {modalMode === 'create' ? 'Register New Campus Facility' : 'Edit Facility Specifications'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Facility Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Advanced AI Supercomputing Lab"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Facility Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white font-bold"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Campus Block / Building
                  </label>
                  <input
                    type="text"
                    required
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="Block A, Tech Tower"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Location / Room
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Floors 1-3, Central Complex"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Operating Timings
                  </label>
                  <input
                    type="text"
                    required
                    value={timings}
                    onChange={(e) => setTimings(e.target.value)}
                    placeholder="8:00 AM - 8:00 PM Daily"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty / Officer In-Charge
                </label>
                <input
                  type="text"
                  required
                  value={inCharge}
                  onChange={(e) => setInCharge(e.target.value)}
                  placeholder="Prof. S. K. Raman (Head Librarian)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed specifications and student access guidelines..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Features &amp; Amenities (Comma Separated)
                </label>
                <input
                  type="text"
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  placeholder="NVIDIA RTX A6000 Clusters, 10 Gbps Fiber, Discussion Pods"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-navy-950 cursor-pointer disabled:opacity-50 btn-tactile"
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Register Facility' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Facility Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deletingItem)}
        title="Decommission Facility"
        message={`Are you sure you want to decommission "${deletingItem?.name}" from campus records? This action will be permanently recorded in the administrative audit logs.`}
        confirmLabel="Decommission"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />

    </div>
  );
};
