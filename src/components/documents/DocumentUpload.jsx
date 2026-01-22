// DocumentUpload - modal component styled like the Add Opportunity card form
import React, { useState, useRef } from 'react';
import { FaUpload, FaLink, FaTimes, FaFile, FaSpinner } from 'react-icons/fa';
import Button from '../common/Button';

const DocumentUpload = ({ isOpen, onClose, onUpload, onCreateExternal, isLoading = false }) => {
    const [mode, setMode] = useState('upload'); // 'upload' or 'external'
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'resume',
        version: '',
        notes: '',
        file_url: ''
    });
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setErrors({ file: 'Only PDF, DOC, and DOCX files are allowed' });
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setErrors({ file: 'File size must be less than 5MB' });
            return;
        }

        setFile(selectedFile);
        setErrors({});

        if (!formData.name) {
            const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
            setFormData(prev => ({ ...prev, name: nameWithoutExt }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (mode === 'upload' && !file) {
            newErrors.file = 'Please select a file';
        }

        if (mode === 'external') {
            if (!formData.file_url.trim()) {
                newErrors.file_url = 'URL is required';
            } else if (!/^https?:\/\/.+/.test(formData.file_url)) {
                newErrors.file_url = 'Please enter a valid URL';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        let success = false;
        if (mode === 'upload') {
            success = await onUpload(file, {
                name: formData.name,
                type: formData.type,
                version: formData.version || 'v1',
                notes: formData.notes
            });
        } else {
            success = await onCreateExternal({
                name: formData.name,
                type: formData.type,
                version: formData.version || 'v1',
                notes: formData.notes,
                file_url: formData.file_url,
                is_external: true
            });
        }

        if (success) {
            resetForm();
        }
    };

    const resetForm = () => {
        setFile(null);
        setFormData({
            name: '',
            type: 'resume',
            version: '',
            notes: '',
            file_url: ''
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal Container - styled like AddOpportunity card */}
            <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
                <div
                    className="relative bg-[#0A0A0A] rounded-t-2xl sm:rounded-xl shadow-lg max-w-lg w-full border border-white/10 transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - styled like AddOpportunity */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">Add New Document</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-200 transition-colors p-2 rounded-md hover:bg-white/5"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Mode Toggle - styled like filter buttons */}
                        <div className="flex gap-2 mb-6">
                            <button
                                type="button"
                                onClick={() => setMode('upload')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === 'upload'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <FaUpload size={14} />
                                Upload File
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('external')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === 'external'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <FaLink size={14} />
                                External Link
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* File Upload Area */}
                            {mode === 'upload' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">
                                        File <span className="text-red-400">*</span>
                                    </label>
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${dragActive
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : file
                                                ? 'border-green-500/50 bg-green-500/5'
                                                : errors.file
                                                    ? 'border-red-500 bg-red-500/5'
                                                    : 'border-white/20 hover:border-white/40 bg-white/5'
                                            }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {file ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <FaFile className="text-green-400" size={24} />
                                                <div className="text-left">
                                                    <p className="text-white font-medium">{file.name}</p>
                                                    <p className="text-gray-400 text-sm">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFile(null);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-400"
                                                >
                                                    <FaTimes size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <FaUpload className="mx-auto text-gray-400 mb-2" size={32} />
                                                <p className="text-gray-300">Drag & drop or click to upload</p>
                                                <p className="text-gray-500 text-sm mt-1">PDF, DOC, DOCX (max 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                    {errors.file && <p className="text-red-400 text-sm mt-1">{errors.file}</p>}
                                </div>
                            )}

                            {/* External URL */}
                            {mode === 'external' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">
                                        URL <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="file_url"
                                        value={formData.file_url}
                                        onChange={handleChange}
                                        placeholder="https://drive.google.com/..."
                                        className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.file_url ? 'border-red-500' : 'border-white/10'
                                            }`}
                                    />
                                    {errors.file_url && <p className="text-red-400 text-sm mt-1">{errors.file_url}</p>}
                                </div>
                            )}

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Software Engineer Resume v2"
                                    className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.name ? 'border-red-500' : 'border-white/10'
                                        }`}
                                />
                                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="resume" style={{ backgroundColor: '#111827', color: 'white' }}>Resume</option>
                                    <option value="cover_letter" style={{ backgroundColor: '#111827', color: 'white' }}>Cover Letter</option>
                                    <option value="portfolio" style={{ backgroundColor: '#111827', color: 'white' }}>Portfolio</option>
                                    <option value="other" style={{ backgroundColor: '#111827', color: 'white' }}>Other</option>
                                </select>
                            </div>

                            {/* Version */}
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Version</label>
                                <input
                                    type="text"
                                    name="version"
                                    value={formData.version}
                                    onChange={handleChange}
                                    placeholder="e.g., v1, v2, Final"
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Optional notes about this document..."
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? (
                                    <><FaSpinner className="animate-spin mr-2" size={16} />
                                        {mode === 'upload' ? 'Uploading...' : 'Saving...'}</>
                                ) : (
                                    mode === 'upload' ? 'Upload Document' : 'Add Link'
                                )}
                            </Button>
                        </form>

                        {/* Cancel button - styled like AddOpportunity */}
                        <div className="mt-6 pt-4 border-t border-white/10">
                            <button
                                onClick={handleClose}
                                className="w-full px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;
