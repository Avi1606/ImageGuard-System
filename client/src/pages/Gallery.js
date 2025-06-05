import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Grid, List, Eye, Download, Shield } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [filterStatus, setFilterStatus] = useState('all');
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchImages();
    }, [searchTerm, filterStatus, pagination.current]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: 12,
                search: searchTerm,
                status: filterStatus !== 'all' ? filterStatus : undefined
            };

            const response = await axios.get('/api/images', { params });
            setImages(response.data.images);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    if (loading && images.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
                    <p className="text-gray-600 mt-2">
                        Manage and view your protected images
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search images..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center space-x-4">
                            <select
                                value={filterStatus}
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="uploaded">Uploaded</option>
                                <option value="protected">Protected</option>
                                <option value="processing">Processing</option>
                            </select>

                            {/* View Mode Toggle */}
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                                >
                                    <Grid className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images Grid/List */}
                {images.length > 0 ? (
                    <div className={`grid gap-6 ${
                        viewMode === 'grid'
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'grid-cols-1'
                    }`}>
                        {images.map((image) => (
                            <div key={image._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                                {viewMode === 'grid' ? (
                                    // Grid View
                                    <>
                                        <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                                            <img
                                                src={`/${image.path}`}
                                                alt={image.originalName}
                                                className="w-full h-48 object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 truncate" title={image.originalName}>
                                                {image.originalName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {new Date(image.createdAt).toLocaleDateString()}
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            image.status === 'protected' ? 'bg-green-100 text-green-800' :
                                image.status === 'uploaded' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                          {image.status}
                        </span>
                                                <div className="flex space-x-2">
                                                    {image.watermark?.isWatermarked && (
                                                        <Shield className="h-4 w-4 text-green-600" />
                                                    )}
                                                    <Link
                                                        to={`/image/${image._id}`}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // List View
                                    <div className="flex items-center p-4">
                                        <img
                                            src={`/${image.path}`}
                                            alt={image.originalName}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="ml-4 flex-1">
                                            <h3 className="font-medium text-gray-900">{image.originalName}</h3>
                                            <p className="text-sm text-gray-600">
                                                {new Date(image.createdAt).toLocaleDateString()} • {image.dimensions?.width}x{image.dimensions?.height}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                          image.status === 'protected' ? 'bg-green-100 text-green-800' :
                              image.status === 'uploaded' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                      }`}>
                        {image.status}
                      </span>
                                            <div className="flex space-x-2">
                                                {image.watermark?.isWatermarked && (
                                                    <Shield className="h-5 w-5 text-green-600" />
                                                )}
                                                <Link
                                                    to={`/image/${image._id}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                            <Search className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No images found</h3>
                        <p className="mt-2 text-gray-600">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Upload your first image to get started'
                            }
                        </p>
                        {!searchTerm && filterStatus === 'all' && (
                            <Link
                                to="/upload"
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Upload Images
                            </Link>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <nav className="flex items-center space-x-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                                disabled={pagination.current === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                                        page === pagination.current
                                            ? 'text-white bg-blue-600 border border-blue-600'
                                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                                disabled={pagination.current === pagination.pages}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;