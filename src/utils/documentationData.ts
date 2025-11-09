export interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  category: 'guide' | 'technical' | 'reference';
  filename: string;
  icon: string;
}

export const documentationItems: DocumentationItem[] = [
  {
    id: 'architecture',
    title: 'Architecture',
    description: 'System design and component structure',
    category: 'technical',
    filename: 'architecture.md',
    icon: '🏗️',
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Mathematical algorithms and curve fitting techniques',
    category: 'technical',
    filename: 'algorithms.md',
    icon: '📐',
  },
  {
    id: 'user-guide',
    title: 'User Guide',
    description: 'How to use the Bézier Curve Designer',
    category: 'guide',
    filename: 'user_guide.md',
    icon: '📖',
  },
  {
    id: 'developer-guide',
    title: 'Developer Guide',
    description: 'Contributing and extending the application',
    category: 'guide',
    filename: 'developer_guide.md',
    icon: '👨‍💻',
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    description: 'Backend API endpoints and usage',
    category: 'reference',
    filename: 'api_reference.md',
    icon: '🔌',
  },
  {
    id: 'webgl-guide',
    title: 'WebGL Guide',
    description: 'Rendering engine and visualization',
    category: 'technical',
    filename: 'webgl_guide.md',
    icon: '🎨',
  },
  {
    id: 'ai-model',
    title: 'AI Model',
    description: 'Machine learning model for curve prediction',
    category: 'technical',
    filename: 'ai_model.md',
    icon: '🤖',
  },
  {
    id: 'deployment',
    title: 'Deployment',
    description: 'Deployment guide for production',
    category: 'guide',
    filename: 'deployment.md',
    icon: '🚀',
  },
];

export const categoryColors = {
  guide: 'from-blue-500 to-cyan-500',
  technical: 'from-purple-500 to-pink-500',
  reference: 'from-green-500 to-emerald-500',
};

export const categoryLabels = {
  guide: 'Guide',
  technical: 'Technical',
  reference: 'Reference',
};
