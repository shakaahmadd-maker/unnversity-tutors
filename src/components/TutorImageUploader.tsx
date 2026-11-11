import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, RefreshCw, X, Link as LinkIcon, User, Loader2, AlertCircle } from 'lucide-react';

interface TutorImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  label?: string;
  tutorId?: string;
}

const PRESET_AVATARS = [
  { id: 'p1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', label: 'Female Academic 1' },
  { id: 'p2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256', label: 'Male Academic 1' },
  { id: 'p3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256', label: 'Female Academic 2' },
  { id: 'p4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256', label: 'Male Academic 2' },
  { id: 'p5', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256', label: 'Female Academic 3' },
  { id: 'p6', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256', label: 'Male Academic 3' },
];

export default function TutorImageUploader({
  currentImageUrl,
  onImageChange,
  label = "Profile Photo of the Tutor",
  tutorId
}: TutorImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploadError(null);

    // Validate file type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validMimes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      setUploadError('Invalid format: Only JPEG, PNG, and WEBP images are supported.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    // Local temporary preview for instant visual feedback only (never persisted to DB)
    const tempPreview = URL.createObjectURL(file);
    setLocalPreviewUrl(tempPreview);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (tutorId) {
        formData.append('tutorId', tutorId);
      }

      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/tutors/upload-avatar', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Upload failed with HTTP ${res.status}`);
      }

      // 1. After a successful upload, use the URL returned by the backend
      const permanentUrl = data.relativeUrl || data.savedUrl || data.url;
      if (!permanentUrl) {
        throw new Error('Server did not return a valid persistent image URL');
      }

      // Propagate permanent URL to form state (never the blob URL)
      onImageChange(permanentUrl);
      setUploadError(null);
    } catch (err: any) {
      console.error('[Uploader] Image upload error:', err);
      // 4. Display the backend error if the upload fails
      setUploadError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      // Clean up object URL after upload finishes
      URL.revokeObjectURL(tempPreview);
      setLocalPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      let finalUrl = customUrlInput.trim();
      if (finalUrl.includes('/uploads/avatars/') && !finalUrl.includes('?v=')) {
        finalUrl = `${finalUrl}?v=${Date.now()}`;
      }
      onImageChange(finalUrl);
      setCustomUrlInput('');
      setUploadError(null);
    }
  };

  const activeDisplayUrl = localPreviewUrl || currentImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';

  return (
    <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-orange-500" />
          <span>{label}</span>
        </label>
        {currentImageUrl && (
          <button
            type="button"
            onClick={() => onImageChange('')}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove Photo</span>
          </button>
        )}
      </div>

      {/* Preview Section */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative shrink-0">
          <img
            src={activeDisplayUrl}
            alt="Tutor Preview"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-sm"
          />
          {isUploading ? (
            <span className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white">
              <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
            </span>
          ) : (
            <span className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[9px] p-1 rounded-full shadow-xs">
              <Camera className="w-3 h-3" />
            </span>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            {isUploading ? (
              <span className="text-orange-600 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to persistent storage...
              </span>
            ) : currentImageUrl ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Permanent Public Image Saved
              </span>
            ) : (
              'Default Sample Photo Selected'
            )}
          </span>
          <p className="text-[11px] text-slate-500 leading-snug">
            Photos are saved to persistent server storage with instant cross-browser cache invalidation.
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Tabs for Upload Method */}
      <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-orange-500" />
          <span>Upload File</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preset')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'preset' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5 text-orange-500" />
          <span>Select Avatar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'url' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 text-orange-500" />
          <span>Image Link</span>
        </button>
      </div>

      {/* Tab 1: File Upload / Drag & Drop */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all bg-white ${
            isDragging ? 'border-orange-500 bg-orange-50/50 scale-[1.01]' : 'border-slate-300 hover:border-orange-400 hover:bg-slate-50/80'
          } ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            disabled={isUploading}
          />
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          </div>
          <span className="text-xs font-bold text-slate-800 block">
            {isUploading ? 'Uploading image to persistent storage...' : 'Click to upload or drag & drop image file'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Supports PNG, JPG, JPEG, WEBP (Max 10MB)
          </span>
        </div>
      )}

      {/* Tab 2: Preset Avatars */}
      {activeTab === 'preset' && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Choose a professional headshot preset:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_AVATARS.map((avatar) => {
              const isSelected = currentImageUrl?.startsWith(avatar.url.split('?')[0]);
              return (
                <button
                  type="button"
                  key={avatar.id}
                  onClick={() => onImageChange(avatar.url)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer aspect-square ${
                    isSelected ? 'border-orange-500 ring-2 ring-orange-500/30 scale-105' : 'border-slate-200 hover:border-slate-400 hover:scale-102'
                  }`}
                  title={avatar.label}
                >
                  <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
                  {isSelected && (
                    <span className="absolute inset-0 bg-orange-500/20 flex items-center justify-center text-white">
                      <Check className="w-5 h-5 bg-orange-500 rounded-full p-0.5 shadow-md" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Custom URL Input */}
      {activeTab === 'url' && (
        <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
          <input
            type="url"
            placeholder="Paste image URL (e.g. https://...)"
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-orange-500 outline-none"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
          >
            Apply URL
          </button>
        </form>
      )}
    </div>
  );
}
