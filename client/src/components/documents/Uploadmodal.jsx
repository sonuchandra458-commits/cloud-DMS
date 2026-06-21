'use client';
import { useState, useCallback } from 'react';
import { useDropzone }  from 'react-dropzone';
import Modal            from '../common/Modal';
import { Upload, X, File, CheckCircle } from 'lucide-react';
import toast            from 'react-hot-toast';
import api              from '../../lib/api';

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const [files,       setFiles]       = useState([]);
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState({});
  const [description, setDescription] = useState('');
  const [folder,      setFolder]      = useState('/');
  const [done,        setDone]        = useState([]);

  const onDrop = useCallback((accepted) => {
    setFiles(prev => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf':  ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*':          ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/plain':       ['.txt'],
      'text/csv':         ['.csv'],
    },
    maxSize: 100 * 1024 * 1024,
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (!files.length) { toast.error('Select at least one file'); return; }
    setUploading(true);
    const doneIds = [];

    for (let i = 0; i < files.length; i++) {
      const file     = files[i];
      const formData = new FormData();
      formData.append('file',        file);
      formData.append('description', description);
      formData.append('folder',      folder);

      try {
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / e.total);
            setProgress(prev => ({ ...prev, [i]: pct }));
          },
        });
        doneIds.push(i);
        toast.success(`${file.name} uploaded!`);
      } catch (err) {
        toast.error(`Failed: ${file.name}`);
      }
    }

    setDone(doneIds);
    setUploading(false);

    if (doneIds.length > 0) {
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1200);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setProgress({});
    setDone([]);
    setDescription('');
    setFolder('/');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Documents" size="lg">
      <div className="space-y-5">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload
            size={36}
            className={`mx-auto mb-3 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <p className="font-medium text-gray-700 mb-1">
            {isDragActive ? 'Drop files here!' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-gray-400">
            PDF, Word, Excel, Images, Text — max 100MB per file
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <File size={18} className="text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                    {progress[i] !== undefined && progress[i] < 100 && (
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${progress[i]}%` }}
                        />
                      </div>
                    )}
                    {done.includes(i) && (
                      <CheckCircle size={14} className="text-green-500" />
                    )}
                  </div>
                </div>
                {!uploading && !done.includes(i) && (
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Description (optional)</label>
            <input
              className="input-field"
              placeholder="Brief description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Folder</label>
            <select
              className="input-field"
              value={folder}
              onChange={e => setFolder(e.target.value)}
            >
              <option value="/">/ Root</option>
              <option value="/documents">/documents</option>
              <option value="/images">/images</option>
              <option value="/reports">/reports</option>
              <option value="/shared">/shared</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={handleClose} disabled={uploading} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={15} />
                Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}