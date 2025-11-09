import { motion } from 'framer-motion';
import { Download, ExternalLink, FileText } from 'lucide-react';

interface ReportSectionProps {
  theme: 'light' | 'dark';
}

export function ReportSection({ theme }: ReportSectionProps) {
  const reportPdfPath = '/docs/project_report.pdf';
  const presentationPdfPath = '/docs/presentation.pdf';

  return (
    <section
      id="report"
      className={`min-h-screen py-20 px-4 sm:px-6 lg:px-8 ${
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="text-cyan-500" size={32} />
            <h2
              className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-purple-500 bg-clip-text text-transparent`}
            >
              Project Report
            </h2>
          </div>
          <p
            className={`text-lg md:text-xl ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Detailed project overview, methodology, and results
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Project Report Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`rounded-2xl border overflow-hidden ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h3
                    className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Full Project Report
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Comprehensive documentation
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <ul className={`space-y-3 mb-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  Introduction and Background
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Mathematical Foundations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                  Implementation Details
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Results and Analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Conclusions and Future Work
                </li>
              </ul>

              <div className="flex gap-3">
                <a
                  href={reportPdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105"
                >
                  <ExternalLink size={18} />
                  View Report
                </a>
                <a
                  href={reportPdfPath}
                  download="bezier_designer_report.pdf"
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                  aria-label="Download report"
                >
                  <Download size={18} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Presentation Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`rounded-2xl border overflow-hidden ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h3
                    className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Presentation Slides
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Visual overview and demos
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <ul className={`space-y-3 mb-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Project Overview
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                  Key Features Demo
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  Technical Architecture
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  AI Model Performance
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Live Demonstration
                </li>
              </ul>

              <div className="flex gap-3">
                <a
                  href={presentationPdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105"
                >
                  <ExternalLink size={18} />
                  View Slides
                </a>
                <a
                  href={presentationPdfPath}
                  download="bezier_designer_presentation.pdf"
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                  aria-label="Download presentation"
                >
                  <Download size={18} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Embedded PDF Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className={`rounded-2xl border overflow-hidden shadow-2xl ${
            theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Preview: Project Report
            </h3>
          </div>
          <div className="relative w-full h-[600px]">
            <iframe
              src={`${reportPdfPath}#view=FitH`}
              className="w-full h-full"
              title="Project Report PDF"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
