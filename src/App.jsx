import React, { useEffect, useState } from 'react';
import { initSchema } from './schema';
import CommandCenter from './components/CommandCenter';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initSchema().then(() => {
      // Small delay to ensure DB is fully initialized
      setTimeout(() => setIsReady(true), 500);
    });
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0b]">
        <div className="text-xl font-medium animate-pulse text-[#eab308] mono uppercase tracking-widest">
          Booting Financial OS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <CommandCenter />
    </div>
  );
}

export default App;
