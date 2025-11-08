import { AlertCircle, CheckCircle, Loader, Sparkles, TrendingUp, Wand2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { glassMorphism } from '../styles/designSystem';
import { DraggablePanel } from './DraggablePanel';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIPanel: React.FC = () => {
  const { 
    theme, 
    selectedStroke, 
    strokes, 
    showAIPanel, 
    updateStroke,
    fittingOptions 
  } = useAppStore();
  
  const [aiStatus, setAIStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [aiMessage, setAIMessage] = useState('');
  const [mlAvailable, setMLAvailable] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hi! I\'m your AI assistant. I can help you with:\n\n• Predicting control points using ML\n• Smoothing curves with C¹/C² continuity\n• Analyzing curvature profiles\n• Optimizing curve fitting\n\nDraw a curve to get started!',
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check ML model availability
    apiClient.checkMLStatus()
      .then(status => {
        const available = status.model_available !== undefined ? status.model_available : status.available;
        setMLAvailable(available || false);
        if (available) {
          addAssistantMessage('✅ ML model loaded and ready!');
        }
      })
      .catch(() => {
        setMLAvailable(false);
        addAssistantMessage('⚠️ ML model unavailable. Basic features still work!');
      });
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-suggestions based on strokes
  useEffect(() => {
    if (strokes.length > 0 && chatMessages.length === 1) {
      setTimeout(() => {
        addAssistantMessage('💡 I see you\'ve drawn a curve! Try "Predict Control Points" to get ML-powered suggestions.');
      }, 2000);
    }
  }, [strokes.length]);

  const addAssistantMessage = (content: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (content: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const message = userInput.trim();
    setUserInput('');
    addUserMessage(message);

    // Simple keyword-based responses
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('help')) {
      addAssistantMessage('I can help with:\n\n1. **Predict Control Points** - Use ML to suggest optimal control points\n2. **Smart Smooth** - Apply C¹/C² continuity smoothing\n3. **Analyze Curvature** - Get detailed curvature metrics\n\nJust click the buttons below or ask me questions!');
    } else if (lowerMessage.includes('smooth')) {
      addAssistantMessage('To smooth your curves, click the "Smart Smooth" button below. This will apply AI-powered smoothing with C¹ continuity to reduce discontinuities.');
    } else if (lowerMessage.includes('predict') || lowerMessage.includes('control')) {
      addAssistantMessage('The "Predict Control Points" feature uses a neural network trained on 10,000+ curves to suggest optimal control points. This can reduce fitting iterations by 30-50%!');
    } else if (lowerMessage.includes('curvature')) {
      addAssistantMessage('Curvature analysis provides:\n• Maximum curvature value\n• Minimum curvature value\n• Average curvature\n• 100-point profile\n\nClick "Analyze Curvature" to see detailed metrics!');
    } else {
      addAssistantMessage('I\'m a specialized AI for Bézier curves. Try asking about "help", "smooth curves", "predict control points", or "curvature analysis"!');
    }
  };

  const handlePredictControlPoints = async () => {
    const stroke = strokes.find(s => s.id === selectedStroke);
    if (!stroke || stroke.points.length < 4) {
      setAIStatus('error');
      setAIMessage('Please select a stroke with at least 4 points');
      addAssistantMessage('❌ Need at least 4 points to predict control points. Draw a longer curve!');
      setTimeout(() => setAIStatus('idle'), 3000);
      return;
    }

    setAIStatus('loading');
    setAIMessage('AI is analyzing your stroke...');
    addUserMessage('Predict control points for my curve');

    try {
      const result = await apiClient.predictControlPoints(stroke.points, 32);
      
      if (result.status === 'ok' && result.confidence > 0.5) {
        setAIStatus('success');
        setAIMessage(`AI predicted control points with ${(result.confidence * 100).toFixed(1)}% confidence`);
        addAssistantMessage(`✅ Control points predicted!\n\nConfidence: ${(result.confidence * 100).toFixed(1)}%\n\nP0: (${result.control_points.p0.x.toFixed(2)}, ${result.control_points.p0.y.toFixed(2)})\nP1: (${result.control_points.p1.x.toFixed(2)}, ${result.control_points.p1.y.toFixed(2)})\nP2: (${result.control_points.p2.x.toFixed(2)}, ${result.control_points.p2.y.toFixed(2)})\nP3: (${result.control_points.p3.x.toFixed(2)}, ${result.control_points.p3.y.toFixed(2)})`);
        
        // Apply to stroke (create a fitted curve)
        updateStroke(stroke.id, {
          fittedCurves: [{
            p0: result.control_points.p0,
            p1: result.control_points.p1,
            p2: result.control_points.p2,
            p3: result.control_points.p3
          }]
        });
      } else {
        setAIStatus('error');
        setAIMessage(result.message || 'ML prediction failed');
        addAssistantMessage(`❌ ${result.message || 'Prediction failed. Using traditional fitting might work better.'}`);
      }
    } catch (error) {
      setAIStatus('error');
      setAIMessage('Failed to get AI predictions. Make sure the backend is running.');
      addAssistantMessage('❌ Backend connection failed. Is the API server running on http://localhost:8000?');
    }
    
    setTimeout(() => setAIStatus('idle'), 3000);
  };

  const handleSmartSmooth = async () => {
    const stroke = strokes.find(s => s.id === selectedStroke);
    if (!stroke) {
      setAIStatus('error');
      setAIMessage('Please select a stroke first');
      addAssistantMessage('❌ No stroke selected. Draw a curve first!');
      setTimeout(() => setAIStatus('idle'), 3000);
      return;
    }

    // If no fitted curves, try to fit first
    if (stroke.fittedCurves.length === 0 && stroke.points.length >= 4) {
      setAIStatus('loading');
      setAIMessage('Fitting curve first...');
      addUserMessage('Smooth my curves');
      addAssistantMessage('First, let me fit the curve, then I\'ll smooth it...');
      
      try {
        // Use the backend API to fit the curve
        const fitResult = await apiClient.fitCurve(stroke.points, {
          parameterization: fittingOptions.parameterization,
          max_iterations: fittingOptions.maxIterations,
          tolerance: fittingOptions.tolerance
        });
        
        if (fitResult.status === 'ok' && fitResult.segments.length > 0) {
          // Update stroke with fitted curves
          const fittedCurves = fitResult.segments.map(seg => seg.control_points);
          updateStroke(stroke.id, { fittedCurves });
          
          // Now try smoothing if we have multiple segments
          if (fittedCurves.length >= 2) {
            const smoothResult = await apiClient.smoothCurve(fittedCurves, 'C1', 0.01);
            if (smoothResult.status === 'smoothed') {
              setAIStatus('success');
              setAIMessage(`Fitted and smoothed ${smoothResult.discontinuities_fixed} discontinuities`);
              addAssistantMessage(`✅ Complete!\n\n1. Fitted curve into ${fittedCurves.length} segments\n2. Smoothed ${smoothResult.discontinuities_fixed} discontinuities\n3. Applied C¹ continuity\n\nYour curve is now smooth!`);
              updateStroke(stroke.id, { fittedCurves: smoothResult.control_points });
            } else {
              setAIStatus('success');
              setAIMessage('Curve fitted successfully!');
              addAssistantMessage(`✅ Curve fitted into ${fittedCurves.length} segments!\n\nThe curves are already smooth with no discontinuities to fix.`);
            }
          } else {
            setAIStatus('success');
            setAIMessage('Curve fitted as single segment');
            addAssistantMessage(`✅ Curve fitted!\n\nThis is a simple curve with just 1 segment, so smoothing isn't needed. Try drawing a more complex curve for multi-segment smoothing.`);
          }
        } else {
          setAIStatus('error');
          setAIMessage('Curve fitting failed');
          addAssistantMessage('❌ Could not fit the curve. Try drawing a smoother stroke.');
        }
      } catch (error) {
        setAIStatus('error');
        setAIMessage('Backend connection failed');
        addAssistantMessage('❌ Backend API unavailable. Make sure the server is running on http://localhost:8000');
      }
      setTimeout(() => setAIStatus('idle'), 3000);
      return;
    }

    // Check if we have curves to smooth
    if (stroke.fittedCurves.length < 1) {
      setAIStatus('error');
      setAIMessage('No curves to smooth');
      addAssistantMessage('❌ No fitted curves found. Draw a longer, more complex stroke!');
      setTimeout(() => setAIStatus('idle'), 3000);
      return;
    }

    // Single curve - inform user but still try to "smooth" it
    if (stroke.fittedCurves.length === 1) {
      setAIStatus('success');
      setAIMessage('Single curve - already smooth!');
      addAssistantMessage('✅ This curve has only 1 segment, so it\'s already perfectly smooth!\n\nTip: Draw a more complex curve to see multi-segment smoothing in action.');
      setTimeout(() => setAIStatus('idle'), 3000);
      return;
    }

    setAIStatus('loading');
    setAIMessage('Applying AI-powered smoothing...');
    addUserMessage('Smooth my curves');

    try {
      const result = await apiClient.smoothCurve(stroke.fittedCurves, 'C1', 0.01);
      
      if (result.status === 'smoothed') {
        setAIStatus('success');
        setAIMessage(`Smoothed ${result.discontinuities_fixed} discontinuities with C¹ continuity`);
        addAssistantMessage(`✅ Smoothing complete!\n\nFixed ${result.discontinuities_fixed} discontinuities\nApplied C¹ continuity\n\nYour curve now has smooth transitions between segments!`);
        
        // Apply smoothed curves
        updateStroke(stroke.id, {
          fittedCurves: result.control_points
        });
      } else {
        setAIStatus('success');
        setAIMessage('Curves already smooth!');
        addAssistantMessage('✅ Your curves are already smooth! No discontinuities detected.');
      }
    } catch (error) {
      setAIStatus('error');
      setAIMessage('Smoothing failed. Check backend connection.');
      addAssistantMessage('❌ Smoothing failed. Make sure the backend API is running.');
    }
    
    setTimeout(() => setAIStatus('idle'), 3000);
  };

  const handleAnalyzeCurvature = async () => {
    const stroke = strokes.find(s => s.id === selectedStroke);
    if (!stroke || stroke.fittedCurves.length === 0) {
      setAIStatus('error');
      setAIMessage('Please select a curve first');
      addAssistantMessage('❌ No curve selected. Draw and fit a curve first!');
      setTimeout(() => setAIStatus('idle'), 3000);
      return;
    }

    setAIStatus('loading');
    setAIMessage('Analyzing curve geometry...');
    addUserMessage('Analyze curvature');

    try {
      const curve = stroke.fittedCurves[0];
      const result = await apiClient.analyzeCurvature(curve, 100);
      
      setAIStatus('success');
      setAIMessage(`Max curvature: ${result.max_curvature.toFixed(3)}, ${result.curvature_profile.length} samples analyzed`);
      addAssistantMessage(`📊 Curvature Analysis Results:\n\n• Max Curvature: ${result.max_curvature.toFixed(4)}\n• Min Curvature: ${result.min_curvature.toFixed(4)}\n• Avg Curvature: ${result.avg_curvature.toFixed(4)}\n• Samples: ${result.curvature_profile.length}\n\n${result.max_curvature > 10 ? '⚠️ High curvature detected! Consider smoothing.' : '✅ Curvature looks good!'}`);
    } catch (error) {
      setAIStatus('error');
      setAIMessage('Analysis failed. Check backend connection.');
      addAssistantMessage('❌ Analysis failed. Backend API might be unavailable.');
    }
    
    setTimeout(() => setAIStatus('idle'), 3000);
  };

  const handleOptimizeFitting = () => {
    addUserMessage('Optimize my fitting parameters');
    const suggestions = [];
    
    if (fittingOptions.tolerance > 0.005) {
      suggestions.push('• Reduce tolerance to 0.001 for more accurate fits');
    }
    if (fittingOptions.maxIterations < 30) {
      suggestions.push('• Increase max iterations to 40 for better convergence');
    }
    if (fittingOptions.parameterization === 'uniform') {
      suggestions.push('• Try "centripetal" parameterization for better results');
    }
    
    if (suggestions.length > 0) {
      addAssistantMessage(`💡 Optimization Suggestions:\n\n${suggestions.join('\n')}\n\nAdjust these in the Property Panel on the right!`);
    } else {
      addAssistantMessage('✅ Your fitting parameters look optimal! Current settings:\n\n• Tolerance: ' + fittingOptions.tolerance + '\n• Max Iterations: ' + fittingOptions.maxIterations + '\n• Method: ' + fittingOptions.parameterization);
    }
  };

  if (!showAIPanel) return null;

  return (
    <DraggablePanel 
      className="right-4 top-24 w-96 h-[75vh] rounded-2xl shadow-2xl z-40 backdrop-blur-md flex flex-col"
      style={glassMorphism(theme)}
      initialPosition={{ x: 0, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b" style={{
        borderColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'
      }}>
        <div className="relative">
          <Sparkles className="text-purple-500" size={24} />
          {mlAvailable && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            AI Assistant
          </h2>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {mlAvailable ? 'Model loaded' : 'Connecting...'}
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl p-3 ${
              msg.role === 'user'
                ? theme === 'dark'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800/80 text-gray-200'
                  : 'bg-white/80 text-gray-800'
            } shadow-md`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <span className={`text-[10px] mt-1 block ${
                msg.role === 'user' 
                  ? 'text-purple-200' 
                  : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Status Message */}
      {aiMessage && (
        <div className={`mx-4 mb-3 p-3 rounded-lg flex items-start gap-2 ${
          aiStatus === 'success' ? 'bg-green-500/10 border border-green-500/30' :
          aiStatus === 'error' ? 'bg-red-500/10 border border-red-500/30' :
          aiStatus === 'loading' ? 'bg-blue-500/10 border border-blue-500/30' :
          'bg-gray-500/10 border border-gray-500/30'
        }`}>
          {aiStatus === 'success' && <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />}
          {aiStatus === 'error' && <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />}
          {aiStatus === 'loading' && <Loader size={16} className="text-blue-500 mt-0.5 flex-shrink-0 animate-spin" />}
          <p className={`text-xs ${
            aiStatus === 'success' ? 'text-green-600 dark:text-green-400' :
            aiStatus === 'error' ? 'text-red-600 dark:text-red-400' :
            aiStatus === 'loading' ? 'text-blue-600 dark:text-blue-400' :
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {aiMessage}
          </p>
        </div>
      )}

      {/* AI Action Buttons */}
      <div className="px-4 pb-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePredictControlPoints}
            disabled={!mlAvailable || !selectedStroke || aiStatus === 'loading'}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
              !mlAvailable || !selectedStroke || aiStatus === 'loading'
                ? 'opacity-50 cursor-not-allowed bg-gray-700'
                : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
            }`}
            title="Use ML to predict control points"
          >
            <Wand2 size={14} />
            Predict
          </button>
          
          <button
            onClick={handleSmartSmooth}
            disabled={!selectedStroke || aiStatus === 'loading'}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
              !selectedStroke || aiStatus === 'loading'
                ? 'opacity-50 cursor-not-allowed bg-gray-700'
                : 'bg-cyan-600 hover:bg-cyan-700 text-white hover:scale-105'
            }`}
            title="Apply C¹ smoothing"
          >
            <TrendingUp size={14} />
            Smooth
          </button>
          
          <button
            onClick={handleAnalyzeCurvature}
            disabled={!selectedStroke || aiStatus === 'loading'}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
              !selectedStroke || aiStatus === 'loading'
                ? 'opacity-50 cursor-not-allowed bg-gray-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105'
            }`}
            title="Analyze curvature profile"
          >
            <Sparkles size={14} />
            Analyze
          </button>
          
          <button
            onClick={handleOptimizeFitting}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-105 flex items-center justify-center gap-1"
            title="Get optimization tips"
          >
            💡 Tips
          </button>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t" style={{
        borderColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'
      }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            className={`flex-1 px-3 py-2 rounded-lg text-sm ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-200 placeholder-gray-500'
                : 'bg-white text-gray-800 placeholder-gray-400'
            } border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim()}
            className={`px-4 py-2 rounded-lg transition-all ${
              userInput.trim()
                ? 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            title="Send message"
          >
            💬
          </button>
        </div>
      </div>
    </DraggablePanel>
  );
};
