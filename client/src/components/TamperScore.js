import React from 'react';
import { Shield, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const TamperScore = ({ tamperScore, showDetails = true }) => {
    if (!tamperScore) {
        return <div className="text-gray-500">No tamper analysis available</div>;
    }

    const {
        originalityPercentage,
        tamperLevel,
        colorCode,
        confidence,
        similarityScore
    } = tamperScore;

    const getIcon = () => {
        switch (colorCode) {
            case 'green':
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'yellow':
                return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
            case 'red':
                return <XCircle className="h-6 w-6 text-red-500" />;
            default:
                return <Shield className="h-6 w-6 text-gray-500" />;
        }
    };

    const getProgressBarColor = () => {
        switch (colorCode) {
            case 'green': return 'bg-green-500';
            case 'yellow': return 'bg-yellow-500';
            case 'red': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getBackgroundColor = () => {
        switch (colorCode) {
            case 'green': return 'bg-green-50 border-green-200';
            case 'yellow': return 'bg-yellow-50 border-yellow-200';
            case 'red': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className={`rounded-lg border p-6 ${getBackgroundColor()}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    {getIcon()}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Originality Score
                        </h3>
                        <p className="text-sm text-gray-600">
                            CNN-based tamper detection analysis
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                        {originalityPercentage}%
                    </div>
                    <div className={`text-sm font-medium ${
                        colorCode === 'green' ? 'text-green-600' :
                            colorCode === 'yellow' ? 'text-yellow-600' :
                                'text-red-600'
                    }`}>
                        {confidence.replace('_', ' ').toUpperCase()} CONFIDENCE
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Tamper Detection</span>
                    <span>{originalityPercentage}% Original</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                        style={{ width: `${originalityPercentage}%` }}
                    />
                </div>
            </div>

            {/* Tamper Level */}
            <div className="mb-4">
                <div className={`text-center py-2 px-4 rounded-md ${
                    colorCode === 'green' ? 'bg-green-100 text-green-800' :
                        colorCode === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                }`}>
                    <span className="font-medium">{tamperLevel}</span>
                </div>
            </div>

            {showDetails && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Similarity Score:</span>
                        <span className="font-medium">{(similarityScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Detection Method:</span>
                        <span className="font-medium">CNN + FAISS</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Analysis Type:</span>
                        <span className="font-medium">Perceptual Hashing</span>
                    </div>
                </div>
            )}

            {/* Interpretation Guide */}
            {showDetails && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        <strong>Interpretation:</strong> 95%+ = Original image,
                        85-94% = Minor edits, 70-84% = Moderate changes,
                        50-69% = Significant modifications, &lt;50% = Heavily altered
                    </p>
                </div>
            )}
        </div>
    );
};

export default TamperScore;