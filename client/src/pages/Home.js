import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Upload, Eye, BarChart3, CheckCircle } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Advanced Watermarking',
      description: 'Protect your images with customizable watermarks that preserve image quality while deterring unauthorized use.'
    },
    {
      icon: Eye,
      title: 'Unauthorized Usage Detection',
      description: 'Advanced algorithms detect when your images are used without permission across the web.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Tracking',
      description: 'Monitor how your images are being used with detailed analytics and usage reports.'
    },
    {
      icon: Upload,
      title: 'Bulk Processing',
      description: 'Upload and protect multiple images at once with our efficient batch processing system.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900">
              Protect Your Images with
              <span className="text-blue-600"> ImageGuard</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Advanced watermarking and image protection system that detects unauthorized usage, 
              tampering, and redistribution of your valuable visual content.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Complete Image Protection Solution
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to protect and monitor your visual content
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Why Choose ImageGuard?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Protect your intellectual property with our advanced image protection system.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Advanced perceptual hashing algorithms',
                  'Invisible and visible watermarking options',
                  'Real-time unauthorized usage detection',
                  'Comprehensive analytics dashboard',
                  'Batch processing capabilities',
                  'Secure cloud storage'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 lg:mt-0">
              <div className="bg-gray-100 rounded-lg p-8">
                <div className="text-center">
                  <Shield className="h-24 w-24 text-blue-600 mx-auto" />
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    Enterprise-Grade Security
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Your images are protected with military-grade encryption and secure processing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Ready to Protect Your Images?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of creators protecting their visual content with ImageGuard.
            </p>
            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Start Protecting Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;