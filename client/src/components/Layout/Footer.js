import React from 'react';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <Shield className="h-8 w-8 text-blue-400" />
          <span className="ml-2 text-white font-bold text-xl">ImageGuard</span>
        </div>
        <p className="mt-4 text-center text-gray-400">
          © 2024 ImageGuard. All rights reserved. Protecting your visual content.
        </p>
      </div>
    </footer>
  );
};

export default Footer;