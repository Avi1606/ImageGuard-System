import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Brain, Upload, Zap, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import TamperScore from '../components/TamperScore';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const MLDetection = () => {
    const [draggedFile, setDraggedFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setDraggedFile({
                file,
                preview: URL.createObjectURL(file)
            });
            setResults(null); // Clear previous results
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const runMLDetection = async () => {
        if (!draggedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', draggedFile.file);

        try {
            const response = await axios.post('/api/ml-detection/ml-detect', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setResults(response.data.results);
        } catch (error) {
            console.error('ML detection error:', error);
            const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message;
            alert(`Detection failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Brain className="h-8 w-8 text-blue-600 mr-3" />
                        ML-Powered Detection
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Machine Learning image analysis with OpenCV feature extraction and similarity search
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="space-y-6">
                        {/* Upload Area */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Activity className="h-5 w-5 text-blue-600 mr-2" />
                                Upload Image for ML Analysis
                            </h3>

                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                    isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <input {...getInputProps()} />
                                <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-lg text-gray-600">
                                    Drop an image here for ML-powered analysis
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Using OpenCV, scikit-learn, and custom feature extraction
                                </p>
                            </div>

                            {draggedFile && (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={draggedFile.preview}
                                                alt="Preview"
                                                className="h-16 w-16 object-cover rounded-lg"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{draggedFile.file.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {(draggedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={runMLDetection}
                                            disabled={loading}
                                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                                                loading
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Analyzing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="h-4 w-4" />
                                                    <span>ML Analyze</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ML Technology Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                ML Technology Stack
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Feature Extraction:</span>
                                    <span className="font-medium">OpenCV Histograms</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Similarity Metric:</span>
                                    <span className="font-medium">Cosine Similarity</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Color Spaces:</span>
                                    <span className="font-medium">RGB, HSV, Grayscale</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">ML Framework:</span>
                                    <span className="font-medium">scikit-learn</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Image Processing:</span>
                                    <span className="font-medium">OpenCV + PIL</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {loading && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <LoadingSpinner text="Running ML analysis..." />
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">
                                        Processing with OpenCV feature extraction and similarity search...
                                    </p>
                                </div>
                            </div>
                        )}

                        {results && (
                            <>
                                {/* Tamper Score */}
                                <TamperScore
                                    tamperScore={results.overallTamperScore}
                                    showDetails={true}
                                />

                                {/* Detection Results */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        {results.totalMatches > 0 ? (
                                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                                        ) : (
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        )}
                                        Detection Results
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {results.totalMatches}
                                                </div>
                                                <div className="text-sm text-gray-600">Similar Images Found</div>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {(results.highestSimilarity * 100).toFixed(1)}%
                                                </div>
                                                <div className="text-sm text-gray-600">Highest Similarity</div>
                                            </div>
                                        </div>

                                        {results.totalMatches === 0 && (
                                            <div className="text-center py-4">
                                                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                                                <p className="text-green-700 font-medium">No similar images found!</p>
                                                <p className="text-sm text-gray-600">This appears to be a unique image.</p>
                                            </div>
                                        )}

                                        {results.matches && results.matches.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="font-medium text-gray-900">Similar Images:</h4>
                                                {results.matches.slice(0, 5).map((match, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                        <div>
                                                            <p className="font-medium">Match #{match.rank}</p>
                                                            <p className="text-sm text-gray-600">
                                                                Similarity: {(match.similarity_score * 100).toFixed(1)}%
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Image ID: {match.image_id}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                  match.tamperScore.colorCode === 'green' ? 'bg-green-100 text-green-800' :
                                      match.tamperScore.colorCode === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                              }`}>
                                {match.tamperScore.tamperLevel}
                              </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Technical Details */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Technical Analysis
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Detection Method:</span>
                                            <span className="font-medium">ML Feature Extraction</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Feature Types:</span>
                                            <span className="font-medium">Color Histograms + Texture</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Hash Generated:</span>
                                            <span className="font-medium font-mono text-xs">{results.hashGenerated?.substring(0, 16)}...</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Similarity Metric:</span>
                                            <span className="font-medium">Cosine Similarity</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Processing Time:</span>
                                            <span className="font-medium">Real-time</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {!loading && !results && (
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    Ready for ML Analysis
                                </h3>
                                <p className="text-gray-600 mt-2">
                                    Upload an image to start machine learning-based detection
                                </p>
                                <div className="mt-4 text-sm text-gray-500">
                                    <p>✓ OpenCV feature extraction</p>
                                    <p>✓ Multi-color space analysis</p>
                                    <p>✓ Similarity scoring with ML</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MLDetection;