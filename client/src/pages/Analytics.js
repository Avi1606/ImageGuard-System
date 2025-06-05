import React from 'react';
import { BarChart3, TrendingUp, Eye, Download } from 'lucide-react';

const Analytics = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600 mt-2">
                        Detailed insights into your image protection activities
                    </p>
                </div>

                <div className="text-center py-12">
                    <BarChart3 className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Analytics Coming Soon</h3>
                    <p className="text-gray-600 mt-2">
                        Advanced analytics and reporting features will be available soon.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;