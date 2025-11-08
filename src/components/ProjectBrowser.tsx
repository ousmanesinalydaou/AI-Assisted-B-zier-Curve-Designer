import { Clock, FolderOpen, Search, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { glassMorphism } from '../styles/designSystem';
import { DraggablePanel } from './DraggablePanel';

interface ProjectBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Project {
  project_id: string;
  name: string;
  description?: string;
  strokes: any[];
  created_at: string;
  updated_at: string;
}

export const ProjectBrowser: React.FC<ProjectBrowserProps> = ({ isOpen, onClose }) => {
  const { theme, loadProject } = useAppStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await apiClient.listProjects(0, 50);
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const project = await apiClient.loadProject(projectId);
      loadProject(JSON.stringify(project));
      onClose();
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    // Delete endpoint would need to be added to backend
    try {
      // await apiClient.deleteProject(projectId);
      setProjects(projects.filter(p => p.project_id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <DraggablePanel
        className="w-[90vw] max-w-6xl h-[85vh] p-6 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col"
        style={glassMorphism(theme)}
        initialPosition={{ x: 0, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500">
              <FolderOpen size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Project Browser
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {projects.length} projects available
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
          }`}>
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${
                theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <FolderOpen size={64} className={theme === 'dark' ? 'text-gray-600' : 'text-gray-300'} />
              <p className={`mt-4 text-lg font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {searchQuery ? 'Try a different search term' : 'Create your first project by saving your work'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                  isSelected={selectedProject === project.project_id}
                  onSelect={() => setSelectedProject(project.project_id)}
                  onLoad={() => handleLoadProject(project.project_id)}
                  onDelete={() => handleDeleteProject(project.project_id)}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700/30">
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 hover:scale-105' 
                : 'bg-white/70 hover:bg-gray-100/70 text-gray-700 hover:scale-105'
            }`}
          >
            Close
          </button>
          
          <button
            onClick={fetchProjects}
            className="py-3 px-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            Refresh
          </button>
        </div>
      </DraggablePanel>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onLoad: () => void;
  onDelete: () => void;
  theme: 'light' | 'dark';
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  isSelected, 
  onSelect, 
  onLoad, 
  onDelete,
  theme 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      onClick={onSelect}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-2 border-purple-500/50 scale-[1.02]'
          : theme === 'dark'
            ? 'bg-gray-800/50 hover:bg-gray-700/50 border-2 border-transparent hover:border-gray-600/50'
            : 'bg-white/50 hover:bg-gray-100/50 border-2 border-transparent hover:border-gray-300/50'
      }`}
    >
      {/* Thumbnail Preview */}
      <div className={`w-full h-32 mb-3 rounded-lg flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100/50'
      }`}>
        <FolderOpen size={48} className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} />
        {/* TODO: Generate actual thumbnail from project.strokes */}
      </div>

      {/* Project Info */}
      <h3 className={`font-bold text-lg mb-1 truncate ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {project.name}
      </h3>
      
      {project.description && (
        <p className={`text-sm mb-3 line-clamp-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {project.description}
        </p>
      )}

      {/* Metadata */}
      <div className={`flex items-center gap-2 text-xs mb-3 ${
        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
      }`}>
        <Clock size={12} />
        <span>{formatDate(project.updated_at)}</span>
      </div>

      <div className={`text-xs mb-4 ${
        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
      }`}>
        {project.strokes?.length || 0} curves
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLoad();
          }}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white hover:scale-105"
        >
          Open
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
            theme === 'dark' 
              ? 'bg-red-900/30 hover:bg-red-800/50 text-red-400' 
              : 'bg-red-100 hover:bg-red-200 text-red-600'
          }`}
          title="Delete project"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
