import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Gallery from './pages/Gallery';
import ImageDetail from './pages/ImageDetail';
import Watermark from './pages/Watermark';
import Detection from './pages/Detection';
import MLDetection from './pages/MLDetection'; // Add ML Detection
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';

// Private Route Component
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return user ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navbar />

                    <main className="flex-grow">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                }
                            />

                            {/* Private Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/upload"
                                element={
                                    <PrivateRoute>
                                        <Upload />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/gallery"
                                element={
                                    <PrivateRoute>
                                        <Gallery />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/image/:id"
                                element={
                                    <PrivateRoute>
                                        <ImageDetail />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/watermark"
                                element={
                                    <PrivateRoute>
                                        <Watermark />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/detection"
                                element={
                                    <PrivateRoute>
                                        <Detection />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/ml-detection"
                                element={
                                    <PrivateRoute>
                                        <MLDetection />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <PrivateRoute>
                                        <Profile />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/analytics"
                                element={
                                    <PrivateRoute>
                                        <Analytics />
                                    </PrivateRoute>
                                }
                            />

                            {/* Catch all route */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>

                    <Footer />

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                        }}
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;