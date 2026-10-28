import React, { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Check, RefreshCw, X, Link as LinkIcon, User } from 'lucide-react';

interface TutorImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  label?: string;
}

const PRESET_AVATARS = [
  { id: 'p1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', label: 'Female Academic 1' },
  { id: 'p2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', label: 'Male Academic 1' },
  { id: 'p3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', label: 'Female Academic 2' },
  { id: 'p4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', label: 'Male Academic 2' },
  { id: 'p5', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80', label: 'Female Academic 3' },
  { id: 'p6', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', label: 'Male Academic 3' },
];

export default function TutorImageUploader({
  currentImageUrl,
  onImageChange,
  label = "Profile Photo of the Tutor"
}: TutorImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      onImageChange(customUrlInput.trim());
      setCustomUrlInput('');
    }
  };

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
            src={currentImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
            alt="Tutor Preview"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-sm"
          />
          <span className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[9px] p-1 rounded-full shadow-xs">
            <Camera className="w-3 h-3" />
          </span>
        </div>

        <div className="flex-1 space-y-1">
          <span className="text-xs font-bold text-slate-900 block">
            {currentImageUrl ? 'Custom Image Selected' : 'Default Sample Photo Selected'}
          </span>
          <p className="text-[11px] text-slate-500 leading-snug">
            Upload your professional photo, drag and drop an image file, or choose from standard avatar templates.
          </p>
        </div>
      </div>

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
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all bg-white ${
            isDragging ? 'border-orange-500 bg-orange-50/50 scale-[1.01]' : 'border-slate-300 hover:border-orange-400 hover:bg-slate-50/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 block">
            Click to upload or drag & drop image file
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Supports PNG, JPG, JPEG, WEBP (Max 5MB)
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
              const isSelected = currentImageUrl === avatar.url;
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
