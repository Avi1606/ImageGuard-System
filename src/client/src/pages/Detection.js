import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Upload, Search, AlertTriangle, CheckCircle } from 'lucide-react';

const Detection = () => {
    const [draggedFile, setDraggedFile] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setDraggedFile({
                file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const detectSimilarity = async () => {
        if (!draggedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', draggedFile.file);

        try {
            const response = await axios.post('/api/detection/check', formData);
            setResults(response.data.results);
        } catch (error) {
            console.error('Detection error:', error);
            alert('Detection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Image Detection</h1>
                    <p className="text-gray-600 mt-2">
                        Check if an image matches any of your protected images
                    </p>
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg text-gray-600">
                            Drop an image here to check for similarities
                        </p>
                    </div>

                    {draggedFile && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={draggedFile.preview}
                                    alt="Preview"
                                    className="h-16 w-16 object-cover rounded-lg"
                                />
                                <span className="text-gray-900">{draggedFile.file.name}</span>
                            </div>
                            <button
                                onClick={detectSimilarity}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {loading ? 'Checking...' : 'Check Similarity'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        {results[0].verdict === 'ours' ? (
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                <span className="text-2xl font-bold text-green-700">This image is ours!</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                                <span className="text-2xl font-bold text-red-700">This image is NOT ours.</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Detection;