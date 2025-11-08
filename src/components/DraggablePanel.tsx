import { GripVertical } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface DraggablePanelProps {
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  className?: string;
  style?: React.CSSProperties;
  dragHandleClassName?: string;
  enableHeaderDrag?: boolean; // Allow dragging from entire header
  showGrip?: boolean; // Show or hide the grip icon
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  children,
  initialPosition = { x: 0, y: 0 },
  className = '',
  style = {},
  dragHandleClassName = '',
  enableHeaderDrag = true, // Enable by default
  showGrip = true, // Show grip by default
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if clicking on the drag handle grip icon
    if (target.closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }
    
    // Check if header drag is enabled and clicking on header area
    if (enableHeaderDrag) {
      // Look for elements that should NOT trigger dragging
      const isInteractiveElement = target.closest('button, input, textarea, select, a, [role="button"]');
      const isScrollableContent = target.closest('[class*="overflow-"]');
      
      // Only allow dragging from the first child (header area) if not clicking interactive elements
      const firstChild = panelRef.current?.firstElementChild;
      if (firstChild && target.closest('div') === firstChild && !isInteractiveElement && !isScrollableContent) {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        e.preventDefault();
      }
    }
  };

  return (
    <div
      ref={panelRef}
      className={className}
      style={{
        ...style,
        position: 'fixed',
        left: initialPosition.x !== 0 ? `${position.x}px` : style.left,
        top: initialPosition.y !== 0 ? `${position.y}px` : style.top,
        right: initialPosition.x === 0 ? style.right : 'auto',
        transform: initialPosition.x !== 0 ? `translate(${position.x}px, ${position.y}px)` : undefined,
        cursor: isDragging ? 'grabbing' : 'auto',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag Handle */}
      {showGrip && (
        <div
          className={`drag-handle absolute top-2 right-2 cursor-grab hover:cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity z-50 ${dragHandleClassName}`}
          title="Drag to move panel"
        >
          <GripVertical size={20} />
        </div>
      )}
      {children}
    </div>
  );
};
