import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ImagePlus, Upload, Check, X, Loader2 } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import BotanicalDecor from '../layout/BotanicalDecor';
import { PrimaryButton, SecondaryButton } from '../ui/Button';

/*
 * Photos are uploaded to Supabase STORAGE (shared-photos bucket) via raw fetch.
 * The Supabase JS client is NOT used for uploads — it has an RLS bug on this project.
 *
 * To download all shared photos after the wedding:
 *   Supabase Dashboard → Storage → shared-photos
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const BUCKET = 'shared-photos';
const FILE_PREFIX = 'photo';
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];
const BATCH_SIZE = 3;

function createFileEntry(file) {
  return {
    id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    file,
    preview: URL.createObjectURL(file),
    status: 'pending',
    error: null,
  };
}

/**
 * Upload a single file to Supabase Storage via raw fetch.
 * Returns true on success, false on failure.
 */
async function uploadToStorage(file, filename) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed (${res.status}): ${errText}`);
  }

  return true;
}


export default function SharePhotos() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  function handleFilesSelected(selectedFiles) {
    const newEntries = [];
    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;
      newEntries.push(createFileEntry(file));
    }
    if (newEntries.length > 0) {
      setFiles((prev) => [...prev, ...newEntries]);
      setUploadComplete(false);
    }
  }

  function handleInputChange(e) {
    if (e.target.files) handleFilesSelected(Array.from(e.target.files));
    e.target.value = '';
  }

  function removeFile(id) {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragOver(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) handleFilesSelected(Array.from(e.dataTransfer.files));
  }, []);

  /** Upload a single file to Storage */
  async function uploadSingle(entry) {
    setFiles((prev) =>
      prev.map((f) => (f.id === entry.id ? { ...f, status: 'uploading', error: null } : f))
    );

    try {
      const ext = entry.file.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const filename = `${FILE_PREFIX}-${timestamp}-${entry.id.slice(-6)}.${ext}`;

      await uploadToStorage(entry.file, filename);

      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: 'done' } : f))
      );
    } catch (err) {
      console.error('Upload error:', err);
      setFiles((prev) =>
        prev.map((f) => f.id === entry.id ? { ...f, status: 'error', error: 'Upload failed' } : f)
      );
    }
  }

  /** Upload all pending files in parallel batches */
  async function uploadAll() {
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error');
    if (pending.length === 0) return;
    setIsUploading(true);

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((entry) => uploadSingle(entry)));
    }

    setIsUploading(false);
    setUploadComplete(true);
  }

  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length;
  const doneCount = files.filter((f) => f.status === 'done').length;
  const totalCount = files.length;

  return (
    <PageWrapper>
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-stone-500 hover:text-wedding-black transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs tracking-[0.15em] uppercase font-medium">Back</span>
      </button>
      <div className="bg-white/90 backdrop-blur-sm rounded-sm shadow-2xl border border-wedding-border animate-fade-in overflow-hidden">
        <div className="p-8 text-center border-b border-wedding-border">
          <h2 className="text-3xl font-serif text-wedding-black tracking-wider">SHARE YOUR</h2>
          <h2 className="text-3xl font-serif text-wedding-black mb-3 tracking-wider">NIGHT WITH US</h2>
          <BotanicalDecor className="w-10 h-10 text-wedding-black mx-auto opacity-25" />
          <p className="text-stone-500 text-sm mt-4 leading-relaxed max-w-xs mx-auto">
            Capture the moments and share your favourite photos from tonight.
          </p>
        </div>
        <div className="p-6">
          <div
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all duration-200 active:scale-[0.98] ${isDragOver ? 'border-wedding-black bg-stone-50' : 'border-stone-200 hover:border-stone-400 bg-white'}`}
          >
            <div className="w-14 h-14 rounded-full bg-stone-50 mx-auto mb-4 flex items-center justify-center">
              <ImagePlus className={`w-6 h-6 ${isDragOver ? 'text-wedding-black' : 'text-stone-400'}`} />
            </div>
            <p className="text-sm text-stone-600 font-medium mb-1">Tap to choose photos</p>
            <p className="text-xs text-stone-400">or drag and drop</p>
            <p className="text-[10px] text-stone-300 mt-2 tracking-wide">JPEG, PNG, HEIC · Max 15MB each</p>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/heic,image/heif,image/webp" multiple className="hidden" onChange={handleInputChange} />
          </div>

          {files.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-stone-400 tracking-wide">
                  {totalCount} photo{totalCount !== 1 ? 's' : ''} selected
                  {doneCount > 0 && <span className="text-green-600 ml-1">· {doneCount} uploaded</span>}
                </p>
                {files.some((f) => f.status === 'pending') && (
                  <button onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); setUploadComplete(false); }}
                    className="text-xs text-stone-400 hover:text-red-500 transition-colors">Clear all</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {files.map((entry) => (
                  <div key={entry.id} className="relative aspect-square rounded-sm overflow-hidden group">
                    <img src={entry.preview} alt="Selected" className="w-full h-full object-cover" />
                    {entry.status === 'uploading' && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                    {entry.status === 'done' && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div></div>}
                    {entry.status === 'error' && <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center"><p className="text-white text-[9px] px-2 text-center">Failed</p></div>}
                    {(entry.status === 'pending' || entry.status === 'error') && (
                      <button onClick={(e) => { e.stopPropagation(); removeFile(entry.id); }}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-white" /></button>
                    )}
                  </div>
                ))}
                {!isUploading && (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-sm border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-1 hover:border-stone-400 transition-colors">
                    <ImagePlus className="w-5 h-5 text-stone-300" /><span className="text-[9px] text-stone-300 tracking-wide">MORE</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="mt-5">
              <PrimaryButton onClick={uploadAll} disabled={isUploading}>
                {isUploading ? <><Loader2 className="w-4 h-4 inline mr-2 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4 inline mr-2" />Share {pendingCount} Photo{pendingCount !== 1 ? 's' : ''}</>}
              </PrimaryButton>
            </div>
          )}

          {uploadComplete && doneCount > 0 && pendingCount === 0 && (
            <div className="mt-5 p-5 bg-green-50 border border-green-200 rounded-sm text-center animate-fade-in">
              <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-green-700 text-sm font-medium">{doneCount} photo{doneCount !== 1 ? 's' : ''} shared!</p>
              <p className="text-green-600 text-xs mt-1">Thank you for capturing the memories</p>
            </div>
          )}

          {uploadComplete && pendingCount === 0 && (
            <div className="mt-4">
              <SecondaryButton onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-4 h-4 inline mr-2" />Share More Photos
              </SecondaryButton>
            </div>
          )}
        </div>
        <div className="px-8 pb-8 pt-2 space-y-3">
          <SecondaryButton onClick={() => navigate('/')}>Back To Home</SecondaryButton>
        </div>
        <BotanicalDecor className="w-14 h-14 text-wedding-black mx-auto mb-8 opacity-15" />
      </div>
    </PageWrapper>
  );
}
