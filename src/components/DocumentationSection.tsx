import { motion } from 'framer-motion';
import 'highlight.js/styles/github-dark.css';
import { BookOpen, Filter, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {
    categoryColors,
    categoryLabels,
    documentationItems,
    type DocumentationItem,
} from '../utils/documentationData';

interface DocumentationSectionProps {
  theme: 'light' | 'dark';
}

export function DocumentationSection({ theme }: DocumentationSectionProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentationItem | null>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['all', 'guide', 'technical', 'reference'];

  const filteredDocs = documentationItems.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (selectedDoc) {
      setIsLoading(true);
      fetch(`/docs/${selectedDoc.filename}`)
        .then((res) => res.text())
        .then((text) => {
          setDocContent(text);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load documentation:', error);
          setDocContent('# Error\n\nFailed to load documentation. Please try again.');
          setIsLoading(false);
        });
    }
  }, [selectedDoc]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="documentation"
      className={`min-h-screen py-20 px-4 sm:px-6 lg:px-8 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
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
            <BookOpen className="text-purple-500" size={32} />
            <h2
              className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent`}
            >
              Documentation
            </h2>
          </div>
          <p
            className={`text-lg md:text-xl ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Comprehensive guides, technical references, and API documentation
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}
              size={20}
            />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter
              className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
              size={20}
            />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Documentation Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {filteredDocs.map((doc) => (
            <motion.button
              key={doc.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDoc(doc)}
              className={`p-6 rounded-2xl border text-left transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20'
                  : 'bg-white border-gray-200 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10'
              }`}
            >
              <div className="flex items-start gap-4 mb-3">
                <span className="text-4xl">{doc.icon}</span>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {doc.title}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                      categoryColors[doc.category]
                    } text-white`}
                  >
                    {categoryLabels[doc.category]}
                  </span>
                </div>
              </div>
              <p
                className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {doc.description}
              </p>
            </motion.button>
          ))}
        </motion.div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              No documentation found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Documentation Modal */}
      {selectedDoc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedDoc(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedDoc.icon}</span>
                <div>
                  <h3
                    className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {selectedDoc.title}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedDoc.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Close documentation"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                </div>
              ) : (
                <div
                  className={`prose prose-lg max-w-none ${
                    theme === 'dark'
                      ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-purple-400 prose-code:text-cyan-400 prose-pre:bg-gray-800'
                      : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-purple-600 prose-code:text-cyan-600'
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  >
                    {docContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
