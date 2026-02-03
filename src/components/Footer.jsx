import React from 'react'
import { FaChess, FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#1a1a1a] border-t border-gray-700 text-gray-300">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <FaChess className="text-yellow-400" size={32} />
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-blue-400 bg-clip-text text-transparent">
                                ChessMaster
                            </h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Master the game of kings with AI-powered analysis, interactive puzzles, and personalized learning paths.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                                <FaFacebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                                <FaTwitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-500 transition">
                                <FaLinkedin size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FaGithub size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Product</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                                    Puzzles
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                                    Analysis
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                                    Play
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                                    Pricing
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Resources</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                                    Tutorials
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                                    Community
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                                    Support
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="text-yellow-400" size={18} />
                                <a href="mailto:info@chessmaster.com" className="text-gray-400 hover:text-yellow-400 transition">
                                    info@chessmaster.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaPhone className="text-blue-400" size={18} />
                                <a href="tel:+1234567890" className="text-gray-400 hover:text-blue-400 transition">
                                    +1 (234) 567-890
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <FaMapMarkerAlt className="text-red-400 mt-1" size={18} />
                                <div className="text-gray-400">
                                    <p>123 Chess Street</p>
                                    <p>New York, NY 10001</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 pt-8 mb-8"></div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Copyright */}
                    <div className="text-sm text-gray-500">
                        <p>&copy; {currentYear} ChessMaster. All rights reserved.</p>
                    </div>

                    {/* Legal Links */}
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="text-gray-400 hover:text-white transition">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition">
                            Terms of Service
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition">
                            Cookie Policy
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition">
                            Sitemap
                        </a>
                    </div>

                    {/* Newsletter Signup */}
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="px-4 py-2 bg-[#303030] text-white placeholder-gray-500 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none transition text-sm"
                        />
                        <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition text-sm">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer