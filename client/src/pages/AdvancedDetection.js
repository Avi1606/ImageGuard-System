import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Brain, Upload, Search, Zap } from 'lucide-react';
import TamperScore from '../components/TamperScore';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const AdvancedDetection = () => {
    const [draggedFile, setDraggedFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysisType, setAnalysisType] = useState('cnn');

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

    const runAdvancedDetection = async () => {
        if (!draggedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', draggedFile.file);

        try {
            const response = await axios.post('/api/detection/cnn-detect', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setResults(response.data.results);
        } catch (error) {
            console.error('Advanced detection error:', error);
            alert('Advanced detection failed');
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
                        Advanced AI Detection
                    </h1>
                    <p className="text-gray-600 mt-2">
                        CNN-powered image analysis with FAISS similarity search and tamper scoring
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="space-y-6">
                        {/* Analysis Type Selection */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Detection Method
                            </h3>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="cnn"
                                        checked={analysisType === 'cnn'}
                                        onChange={(e) => setAnalysisType(e.target.value)}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-medium">CNN + FAISS (Recommended)</div>
                                        <div className="text-sm text-gray-600">
                                            Deep learning with vector similarity search
                                        </div>
                                    </div>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="hybrid"
                                        checked={analysisType === 'hybrid'}
                                        onChange={(e) => setAnalysisType(e.target.value)}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-medium">Hybrid Analysis</div>
                                        <div className="text-sm text-gray-600">
                                            CNN + Traditional hashing + ML features
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Upload Area */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Upload Image for Analysis
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
                                    Drop an image here for AI-powered analysis
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Our CNN model will analyze for tampering and similarity
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
                                            onClick={runAdvancedDetection}
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
                                                    <span>AI Analyze</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {loading && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <LoadingSpinner text="Running AI analysis..." />
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">
                                        Processing with CNN model and FAISS search...
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                                            <span className="font-medium">CNN + FAISS Vector Search</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Model Architecture:</span>
                                            <span className="font-medium">ResNet50 + Custom Hash Layer</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Hash Dimension:</span>
                                            <span className="font-medium">128-bit Vector</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Similarity Metric:</span>
                                            <span className="font-medium">Cosine Similarity</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {!loading && !results && (
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    Ready for AI Analysis
                                </h3>
                                <p className="text-gray-600 mt-2">
                                    Upload an image to start advanced CNN-based detection
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedDetection;