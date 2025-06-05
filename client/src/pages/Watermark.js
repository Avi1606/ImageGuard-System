import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Image as ImageIcon, Settings } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Watermark = () => {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [watermarkSettings, setWatermarkSettings] = useState({
        text: '',
        position: 'bottom-right',
        opacity: 0.3
    });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await axios.get('/api/images');
            setImages(response.data.images.filter(img => !img.watermark?.isWatermarked));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching images:', error);
            setLoading(false);
        }
    };

    const applyWatermark = async () => {
        if (!selectedImage) return;

        setProcessing(true);
        try {
            await axios.post(`/api/watermark/${selectedImage._id}/apply`, watermarkSettings);
            alert('Watermark applied successfully!');
            fetchImages(); // Refresh the list
            setSelectedImage(null);
        } catch (error) {
            console.error('Error applying watermark:', error);
            alert('Failed to apply watermark');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Add Watermarks</h1>
                    <p className="text-gray-600 mt-2">
                        Protect your images with customizable watermarks
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Selection */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Select Image to Watermark
                        </h2>

                        {images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                {images.map((image) => (
                                    <div
                                        key={image._id}
                                        onClick={() => setSelectedImage(image)}
                                        className={`cursor-pointer border-2 rounded-lg p-2 transition-colors ${
                                            selectedImage?._id === image._id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <img
                                            src={`/${image.path}`}
                                            alt={image.originalName}
                                            className="w-full h-24 object-cover rounded"
                                        />
                                        <p className="text-xs text-gray-600 mt-1 truncate">
                                            {image.originalName}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No unwatermarked images available</p>
                            </div>
                        )}
                    </div>

                    {/* Watermark Settings */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Watermark Settings
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Watermark Text
                                </label>
                                <input
                                    type="text"
                                    value={watermarkSettings.text}
                                    onChange={(e) => setWatermarkSettings(prev => ({ ...prev, text: e.target.value }))}
                                    placeholder="Enter watermark text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Position
                                </label>
                                <select
                                    value={watermarkSettings.position}
                                    onChange={(e) => setWatermarkSettings(prev => ({ ...prev, position: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="top-left">Top Left</option>
                                    <option value="top-right">Top Right</option>
                                    <option value="bottom-left">Bottom Left</option>
                                    <option value="bottom-right">Bottom Right</option>
                                    <option value="center">Center</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Opacity: {watermarkSettings.opacity}
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.1"
                                    value={watermarkSettings.opacity}
                                    onChange={(e) => setWatermarkSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                                    className="w-full"
                                />
                            </div>

                            <button
                                onClick={applyWatermark}
                                disabled={!selectedImage || !watermarkSettings.text || processing}
                                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                                    !selectedImage || !watermarkSettings.text || processing
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {processing ? 'Applying Watermark...' : 'Apply Watermark'}
                            </button>
                        </div>

                        {/* Preview */}
                        {selectedImage && (
                            <div className="mt-6">
                                <h3 className="text-md font-medium text-gray-900 mb-2">Preview</h3>
                                <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={`/${selectedImage.path}`}
                                        alt="Preview"
                                        className="w-full h-48 object-cover"
                                    />
                                    {watermarkSettings.text && (
                                        <div
                                            className={`absolute text-white font-bold pointer-events-none ${
                                                watermarkSettings.position === 'top-left' ? 'top-2 left-2' :
                                                    watermarkSettings.position === 'top-right' ? 'top-2 right-2' :
                                                        watermarkSettings.position === 'bottom-left' ? 'bottom-2 left-2' :
                                                            watermarkSettings.position === 'bottom-right' ? 'bottom-2 right-2' :
                                                                'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                                            }`}
                                            style={{ opacity: watermarkSettings.opacity }}
                                        >
                                            {watermarkSettings.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Watermark;