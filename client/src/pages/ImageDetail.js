import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Download,
    Shield,
    Eye,
    Calendar,
    Brain,
    Plus,
    CheckCircle,
    Loader
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ImageDetail = () => {
    const { id } = useParams();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [indexing, setIndexing] = useState(false);

    useEffect(() => {
        fetchImage();
    }, [id]);

    const fetchImage = async () => {
        try {
            const response = await axios.get(`/api/images/${id}`);
            setImage(response.data.image);
        } catch (error) {
            console.error('Error fetching image:', error);
            toast.error('Failed to load image');
        } finally {
            setLoading(false);
        }
    };

    const addToMLIndex = async () => {
        if (!image) return;

        setIndexing(true);
        try {
            const response = await axios.post(`/api/ml-detection/add-to-index/${image._id}`);

            if (response.data.success) {
                if (response.data.alreadyIndexed) {
                    toast.info('Image was already in ML index');
                } else {
                    toast.success('Image added to ML index successfully!');
                }

                // Refresh image data
                await fetchImage();
            }
        } catch (error) {
            console.error('Error adding to index:', error);
            const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Failed to add to ML index';
            toast.error(errorMessage);
        } finally {
            setIndexing(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!image) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Image not found</h2>
                    <Link to="/gallery" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                        Return to Gallery
                    </Link>
                </div>
            </div>
        );
    }

    const isIndexed = image.mlIndex?.isIndexed || image.status === 'indexed';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/gallery"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Gallery
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{image.originalName}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Image Display */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <img
                                src={`/${image.watermark?.isWatermarked ? image.watermark.watermarkedPath : image.path}`}
                                alt={image.originalName}
                                className="w-full h-auto"
                            />
                        </div>
                    </div>

                    {/* Image Details */}
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        image.status === 'protected' ? 'bg-green-100 text-green-800' :
                                            image.status === 'indexed' ? 'bg-purple-100 text-purple-800' :
                                                image.status === 'uploaded' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                    }`}>
                    {image.status}
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Dimensions:</span>
                                    <span className="text-gray-900">
                    {image.dimensions?.width} × {image.dimensions?.height}
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Size:</span>
                                    <span className="text-gray-900">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Format:</span>
                                    <span className="text-gray-900">{image.mimetype}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Uploaded:</span>
                                    <span className="text-gray-900">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </span>
                                </div>
                                {isIndexed && image.mlIndex?.indexedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Indexed:</span>
                                        <span className="text-gray-900">
                      {new Date(image.mlIndex.indexedAt).toLocaleDateString()}
                    </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ML Index Status */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                                ML Detection Index
                            </h3>

                            {isIndexed ? (
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-green-800">Successfully Indexed</p>
                                            <p className="text-sm text-green-600">
                                                This image is in the ML search index and can be detected if copied
                                            </p>
                                        </div>
                                    </div>

                                    {image.mlIndex?.searchableHash && (
                                        <div className="text-xs text-gray-500">
                                            <p>Hash: <span className="font-mono">{image.mlIndex.searchableHash.substring(0, 16)}...</span></p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Not indexed:</strong> Add this image to the ML detection index to enable
                                            unauthorized usage detection.
                                        </p>
                                    </div>

                                    <button
                                        onClick={addToMLIndex}
                                        disabled={indexing}
                                        className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                                            indexing
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                    >
                                        {indexing ? (
                                            <>
                                                <Loader className="h-4 w-4 animate-spin" />
                                                <span>Adding to Index...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4" />
                                                <span>Add to ML Index</span>
                                            </>
                                        )}
                                    </button>

                                    <div className="text-xs text-gray-500">
                                        <p>• Enables ML-powered detection</p>
                                        <p>• Creates searchable fingerprint</p>
                                        <p>• Required for similarity matching</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Watermark Info */}
                        {image.watermark?.isWatermarked && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                                    Watermark Protection
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Text:</span>
                                        <span className="text-gray-900">{image.watermark.watermarkText}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Position:</span>
                                        <span className="text-gray-900">{image.watermark.watermarkPosition}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Opacity:</span>
                                        <span className="text-gray-900">{image.watermark.opacity}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Statistics */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Eye className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-gray-600">Views:</span>
                                    </div>
                                    <span className="text-gray-900 font-medium">{image.analytics?.views || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Download className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-gray-600">Downloads:</span>
                                    </div>
                                    <span className="text-gray-900 font-medium">{image.analytics?.downloads || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                            <div className="space-y-3">
                                {!image.watermark?.isWatermarked && (
                                    <Link
                                        to="/watermark"
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                                    >
                                        Add Watermark
                                    </Link>
                                )}

                                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                                    Download Original
                                </button>

                                {image.watermark?.isWatermarked && (
                                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                                        Download Protected
                                    </button>
                                )}

                                {isIndexed && (
                                    <Link
                                        to="/ml-detection"
                                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-center block"
                                    >
                                        Test ML Detection
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageDetail;