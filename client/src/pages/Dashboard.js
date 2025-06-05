import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Upload, 
  Image as ImageIcon, 
  Shield, 
  Eye, 
  TrendingUp, 
  Clock,
  Download,
  Users,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentImages, setRecentImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/images/stats/overview');
        setStats(response.data.stats);
        setRecentImages(response.data.recentImages);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const quickActions = [
    {
      title: 'Upload Images',
      description: 'Upload and protect your images',
      icon: Upload,
      href: '/upload',
      color: 'bg-blue-500'
    },
    {
      title: 'Add Watermark',
      description: 'Protect images with watermarks',
      icon: Shield,
      href: '/watermark',
      color: 'bg-green-500'
    },
    {
      title: 'Detect Usage',
      description: 'Find unauthorized usage',
      icon: Eye,
      href: '/detection',
      color: 'bg-purple-500'
    },
    {
      title: 'View Gallery',
      description: 'Browse your protected images',
      icon: ImageIcon,
      href: '/gallery',
      color: 'bg-orange-500'
    }
  ];

  const statCards = [
    {
      title: 'Total Images',
      value: stats?.totalImages || 0,
      icon: ImageIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Watermarked',
      value: stats?.watermarkedImages || 0,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Downloads',
      value: stats?.totalDownloads || 0,
      icon: Download,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor your image protection activities and analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Recent Images */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Images</h2>
          </div>
          <div className="p-6">
            {recentImages.length > 0 ? (
              <div className="space-y-4">
                {recentImages.map((image, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{image.originalName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        image.status === 'protected' ? 'bg-green-100 text-green-800' :
                        image.status === 'uploaded' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {image.status}
                      </span>
                      <Link
                        to={`/image/${image._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No images uploaded yet</p>
                <Link
                  to="/upload"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Upload your first image
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;