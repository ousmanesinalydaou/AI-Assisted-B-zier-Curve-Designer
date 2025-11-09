import { motion } from 'framer-motion';
import { ArrowRight, Book, Code2, Cpu, Github, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BezierBackground } from './BezierBackground';
import { DocumentationSection } from './DocumentationSection';
import { ReportSection } from './ReportSection';

interface HomepageProps {
  theme: 'light' | 'dark';
}

export function Homepage({ theme }: HomepageProps) {
  const features = [
    {
      icon: <Sparkles className="text-purple-500" size={32} />,
      title: 'AI-Powered Assistance',
      description: 'Machine learning model predicts control points and suggests curve optimizations',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Code2 className="text-cyan-500" size={32} />,
      title: 'Advanced Algorithms',
      description: 'Newton-Raphson fitting, curvature analysis, and mathematical precision',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: <Cpu className="text-green-500" size={32} />,
      title: 'WebGL Rendering',
      description: 'Real-time hardware-accelerated graphics with Three.js and custom shaders',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Zap className="text-yellow-500" size={32} />,
      title: 'Interactive Design',
      description: 'Intuitive tools for creating, editing, and exporting professional curves',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  const technologies = [
    { name: 'React + TypeScript', color: 'bg-blue-500' },
    { name: 'WebGL + Three.js', color: 'bg-purple-500' },
    { name: 'Python + FastAPI', color: 'bg-green-500' },
    { name: 'PyTorch ML', color: 'bg-red-500' },
    { name: 'TailwindCSS', color: 'bg-cyan-500' },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Animated Background */}
      <BezierBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
        <div className="max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto"
                >
                  <motion.path
                    d="M10 100 Q30 10, 60 60 T110 10"
                    stroke="url(#heroGradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  />
                  <motion.circle
                    cx="10"
                    cy="100"
                    r="6"
                    fill="#8B5CF6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  <motion.circle
                    cx="30"
                    cy="10"
                    r="5"
                    fill="#06B6D4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 }}
                  />
                  <motion.circle
                    cx="90"
                    cy="110"
                    r="5"
                    fill="#EC4899"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 }}
                  />
                  <motion.circle
                    cx="110"
                    cy="10"
                    r="6"
                    fill="#3B82F6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.1 }}
                  />
                  <defs>
                    <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="33%" stopColor="#06B6D4" />
                      <stop offset="66%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-full blur-3xl opacity-30"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            </motion.div>

            <h1
              className={`text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight`}
            >
              <span className="bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500 bg-clip-text text-transparent">
                AI-Assisted
              </span>
              <br />
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Bézier Curve Designer
              </span>
            </h1>

            <p
              className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Create stunning parametric curves with intelligent machine learning assistance,
              advanced mathematical algorithms, and real-time WebGL rendering.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/app"
                className="group px-8 py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center gap-3"
              >
                <Sparkles className="group-hover:animate-spin" size={24} />
                Launch Application
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </Link>

              <a
                href="#documentation"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#documentation')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-8 py-4 rounded-2xl text-lg font-bold border-2 transition-all hover:scale-105 flex items-center gap-3 ${
                  theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 hover:border-purple-500'
                    : 'border-gray-300 bg-white/50 text-gray-900 hover:bg-white hover:border-purple-500'
                }`}
              >
                <Book size={24} />
                View Documentation
              </a>
            </motion.div>

            {/* Technology Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 flex flex-wrap gap-3 justify-center"
            >
              {technologies.map((tech, index) => (
                <motion.span
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium text-white ${tech.color} shadow-lg`}
                >
                  {tech.name}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-6 h-10 border-2 rounded-full ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-400'
            } flex justify-center pt-2`}
          >
            <motion.div
              className={`w-1.5 h-1.5 rounded-full ${
                theme === 'dark' ? 'bg-gray-400' : 'bg-gray-600'
              }`}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* About / Features Section */}
      <section
        id="about"
        className={`relative py-20 px-4 sm:px-6 lg:px-8 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent`}
            >
              Powerful Features
            </h2>
            <p
              className={`text-lg md:text-xl max-w-3xl mx-auto ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Combining cutting-edge AI, mathematical precision, and modern web technologies
              to deliver the ultimate curve design experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
                className={`p-8 rounded-2xl border backdrop-blur-sm ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border-gray-700 hover:border-purple-500'
                    : 'bg-gray-50/50 border-gray-200 hover:border-purple-500'
                } transition-all shadow-lg hover:shadow-2xl`}
              >
                <div className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                  {feature.icon}
                </div>
                <h3
                  className={`text-2xl font-bold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-lg ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <DocumentationSection theme={theme} />

      {/* Report Section */}
      <ReportSection theme={theme} />

      {/* Footer */}
      <footer
        className={`py-12 px-4 sm:px-6 lg:px-8 border-t ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <svg
                width="40"
                height="40"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 28 Q8 4, 16 16 T28 4"
                  stroke="url(#footerGradient)"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle cx="4" cy="28" r="2" fill="#8B5CF6" />
                <circle cx="16" cy="16" r="2" fill="#06B6D4" />
                <circle cx="28" cy="4" r="2" fill="#EC4899" />
                <defs>
                  <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <p
                  className={`font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  AI-Assisted Bézier Designer
                </p>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Geometric Modeling Project
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://github.com/ousmanesinalydaou/AI-Assisted-B-zier-Curve-Designer"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Github size={20} />
                <span className="text-sm font-medium">GitHub</span>
              </a>
              <Link
                to="/app"
                className={`flex items-center gap-2 transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles size={20} />
                <span className="text-sm font-medium">Launch App</span>
              </Link>
            </div>
          </div>

          <div
            className={`mt-8 pt-8 border-t text-center text-sm ${
              theme === 'dark'
                ? 'border-gray-800 text-gray-500'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            <p>
              © 2025 AI-Assisted Bézier Curve Designer. Created for Geometric Modeling course.
            </p>
            <p className="mt-2">
              Built with React, TypeScript, WebGL, PyTorch, and FastAPI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
