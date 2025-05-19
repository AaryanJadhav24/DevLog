import React from 'react';
import { FiHeart, FiGithub } from 'react-icons/fi';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-blue-50 text-gray-500 border-t border-gray-200 text-sm text-center py-4">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                <div className="flex items-center space-x-1 mb-4 sm:mb-0">
                    <span>Crafted with</span>
                    <FiHeart className="h-4 w-4 text-red-500 inline animate-pulse" />
                    <span> by </span>
                    <a
                        href="https://linkedin.com/in/aaryanjadhav"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                        Aaryan Jadhav
                    </a>
                </div>
                <div className="flex items-center space-x-4">
                    <span>© {currentYear} DevLog</span>
                    <a
                        href="https://github.com/AaryanJadhav24"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary-600 transition-colors"
                        aria-label="GitHub repository"
                    >
                        <FiGithub className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
