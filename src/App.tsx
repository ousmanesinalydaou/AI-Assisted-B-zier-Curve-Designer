import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import BezierApp from './BezierApp';
import { Homepage } from './components/Homepage';
import { NavBar } from './components/NavBar';
import { useAppStore } from './store/useAppStore';

function App() {
  const { theme, toggleTheme } = useAppStore();
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(theme);

  const handleToggleTheme = () => {
    toggleTheme();
    setLocalTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar theme={localTheme} onToggleTheme={handleToggleTheme} />
              <Homepage theme={localTheme} />
            </>
          }
        />
        <Route path="/app" element={<BezierApp />} />
      </Routes>
    </div>
  );
}

export default App;
