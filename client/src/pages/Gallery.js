import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Search,
    Filter,
    Grid,
    List,
    Eye,
    Download,
    Shield,
    Brain,
    Plus,
    CheckCircle,
    Clock,
    Image as ImageIcon
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [filterStatus, setFilterStatus] = useState('all');
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [indexingStates, setIndexingStates] = useState({});
    const [bulkIndexing, setBulkIndexing] = useState(false);

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
            toast.error('Failed to load images');
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

    const addToMLIndex = async (imageId) => {
        setIndexingStates(prev => ({ ...prev, [imageId]: true }));

        try {
            const response = await axios.post(`/api/ml-detection/add-to-index/${imageId}`);

            if (response.data.success) {
                if (response.data.alreadyIndexed) {
                    toast.info('Image was already in ML index');
                } else {
                    toast.success('Image added to ML index successfully!');
                }

                // Update the image status in the local state
                setImages(prev => prev.map(img =>
                    img._id === imageId ? {
                        ...img,
                        status: 'indexed',
                        mlIndex: {
                            isIndexed: true,
                            indexedAt: new Date(),
                            searchableHash: response.data.searchableHash || 'generated'
                        }
                    } : img
                ));
            }
        } catch (error) {
            console.error('Error adding to index:', error);
            const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Failed to add to ML index';
            toast.error(errorMessage);
        } finally {
            setIndexingStates(prev => ({ ...prev, [imageId]: false }));
        }
    };

    const bulkAddToIndex = async () => {
        const unindexedImages = images.filter(img =>
            !img.mlIndex?.isIndexed && img.status !== 'indexed'
        );

        if (unindexedImages.length === 0) {
            toast.info('All visible images are already indexed');
            return;
        }

        setBulkIndexing(true);

        try {
            const imageIds = unindexedImages.map(img => img._id);
            const response = await axios.post('/api/ml-detection/bulk-index', { imageIds });

            if (response.data.success) {
                toast.success(`Successfully indexed ${response.data.summary.successful} images`);

                if (response.data.summary.errors > 0) {
                    toast.error(`Failed to index ${response.data.summary.errors} images`);
                }

                // Refresh the images
                fetchImages();
            }
        } catch (error) {
            console.error('Bulk indexing error:', error);
            toast.error('Bulk indexing failed');
        } finally {
            setBulkIndexing(false);
        }
    };

    const isImageIndexed = (image) => {
        return image.mlIndex?.isIndexed || image.status === 'indexed';
    };

    const getStatusColor = (image) => {
        if (image.status === 'protected') return 'bg-green-100 text-green-800';
        if (isImageIndexed(image)) return 'bg-purple-100 text-purple-800';
        if (image.status === 'uploaded') return 'bg-yellow-100 text-yellow-800';
        if (image.status === 'processing') return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getImageStats = () => {
        const total = images.length;
        const indexed = images.filter(isImageIndexed).length;
        const watermarked = images.filter(img => img.watermark?.isWatermarked).length;
        const unindexed = total - indexed;

        return { total, indexed, watermarked, unindexed };
    };

    if (loading && images.length === 0) {
        return <LoadingSpinner />;
    }

    const stats = getImageStats();

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

                {/* Stats Overview */}
                {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-600">Total Images</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{stats.indexed}</div>
                            <div className="text-sm text-gray-600">ML Indexed</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.watermarked}</div>
                            <div className="text-sm text-gray-600">Watermarked</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.unindexed}</div>
                            <div className="text-sm text-gray-600">Not Indexed</div>
                        </div>
                    </div>
                )}

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

                        {/* Actions and Filters */}
                        <div className="flex items-center space-x-4">
                            {/* Bulk Index Button */}
                            {stats.unindexed > 0 && (
                                <button
                                    onClick={bulkAddToIndex}
                                    disabled={bulkIndexing}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        bulkIndexing
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                                >
                                    {bulkIndexing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Indexing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="h-4 w-4" />
                                            <span>Index All ({stats.unindexed})</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Filter Dropdown */}
                            <select
                                value={filterStatus}
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="uploaded">Uploaded Only</option>
                                <option value="indexed">ML Indexed</option>
                                <option value="protected">Watermarked</option>
                                <option value="processing">Processing</option>
                            </select>

                            {/* View Mode Toggle */}
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                                    title="Grid View"
                                >
                                    <Grid className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                                    title="List View"
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
                            <div key={image._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                                {viewMode === 'grid' ? (
                                    // Grid View
                                    <>
                                        <div className="aspect-w-16 aspect-h-12 bg-gray-200 relative">
                                            <img
                                                src={`/${image.path}`}
                                                alt={image.originalName}
                                                className="w-full h-48 object-cover"
                                            />
                                            {/* Status Badges */}
                                            <div className="absolute top-2 right-2 flex flex-col space-y-1">
                                                {image.watermark?.isWatermarked && (
                                                    <div className="bg-green-500 text-white p-1 rounded" title="Watermarked">
                                                        <Shield className="h-3 w-3" />
                                                    </div>
                                                )}
                                                {isImageIndexed(image) && (
                                                    <div className="bg-purple-500 text-white p-1 rounded" title="ML Indexed">
                                                        <Brain className="h-3 w-3" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Processing Indicator */}
                                            {image.status === 'processing' && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <div className="text-white text-center">
                                                        <Clock className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                        <span className="text-sm">Processing...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 truncate" title={image.originalName}>
                                                {image.originalName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {new Date(image.createdAt).toLocaleDateString()}
                                            </p>

                                            {/* ML Index Date */}
                                            {isImageIndexed(image) && image.mlIndex?.indexedAt && (
                                                <p className="text-xs text-purple-600 mt-1">
                                                    Indexed: {new Date(image.mlIndex.indexedAt).toLocaleDateString()}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(image)}`}>
                          {image.status}
                        </span>
                                                <div className="flex space-x-2">
                                                    {!isImageIndexed(image) && (
                                                        <button
                                                            onClick={() => addToMLIndex(image._id)}
                                                            disabled={indexingStates[image._id]}
                                                            className="text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                                                            title="Add to ML Index"
                                                        >
                                                            {indexingStates[image._id] ? (
                                                                <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                                                            ) : (
                                                                <Plus className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                    <Link
                                                        to={`/image/${image._id}`}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="View Details"
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
                                        <div className="relative">
                                            <img
                                                src={`/${image.path}`}
                                                alt={image.originalName}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            {/* Small badges for list view */}
                                            <div className="absolute -top-1 -right-1 flex space-x-1">
                                                {image.watermark?.isWatermarked && (
                                                    <Shield className="h-3 w-3 text-green-600" />
                                                )}
                                                {isImageIndexed(image) && (
                                                    <Brain className="h-3 w-3 text-purple-600" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-4 flex-1">
                                            <h3 className="font-medium text-gray-900">{image.originalName}</h3>
                                            <p className="text-sm text-gray-600">
                                                Uploaded: {new Date(image.createdAt).toLocaleDateString()}
                                            </p>
                                            {isImageIndexed(image) && image.mlIndex?.indexedAt && (
                                                <p className="text-xs text-purple-600">
                                                    Indexed: {new Date(image.mlIndex.indexedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {image.dimensions?.width}×{image.dimensions?.height} • {(image.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(image)}`}>
                        {image.status}
                      </span>

                                            <div className="flex space-x-2">
                                                {!isImageIndexed(image) && (
                                                    <button
                                                        onClick={() => addToMLIndex(image._id)}
                                                        disabled={indexingStates[image._id]}
                                                        className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 disabled:text-gray-400 text-sm"
                                                        title="Add to ML Index"
                                                    >
                                                        {indexingStates[image._id] ? (
                                                            <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                                                        ) : (
                                                            <>
                                                                <Plus className="h-4 w-4" />
                                                                <span>Index</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/image/${image._id}`}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            {searchTerm || filterStatus !== 'all' ? 'No images found' : 'No images uploaded'}
                        </h3>
                        <p className="mt-2 text-gray-600">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Upload your first image to get started with ML-powered protection'
                            }
                        </p>
                        {!searchTerm && filterStatus === 'all' && (
                            <div className="mt-6 space-y-2">
                                <Link
                                    to="/upload"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Upload Images
                                </Link>
                                <p className="text-sm text-gray-500">
                                    Upload → Index for ML → Add Watermarks → Monitor for copies
                                </p>
                            </div>
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

                            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                let page;
                                if (pagination.pages <= 5) {
                                    page = i + 1;
                                } else if (pagination.current <= 3) {
                                    page = i + 1;
                                } else if (pagination.current >= pagination.pages - 2) {
                                    page = pagination.pages - 4 + i;
                                } else {
                                    page = pagination.current - 2 + i;
                                }

                                return (
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
                                );
                            })}

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

                {/* Help Text */}
                {images.length > 0 && stats.unindexed > 0 && (
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="text-blue-800 font-medium">
                                    ML Detection Tip
                                </p>
                                <p className="text-blue-700 mt-1">
                                    You have {stats.unindexed} image(s) not yet indexed for ML detection.
                                    Index them to enable unauthorized usage detection and similarity matching.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;