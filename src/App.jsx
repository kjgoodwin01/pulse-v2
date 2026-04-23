import React, { useEffect, useState } from 'react';
import { initSchema } from './schema';
import CommandCenter from './components/CommandCenter';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initSchema()
      .then(() => {
        setTimeout(() => setIsReady(true), 1000);
      })
      .catch(err => {
        console.error('Database failed to boot:', err);
        // Force ready anyway so we can see the UI, even if DB is empty
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#050506',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div className="bolt-container pulse-health-good" style={{ marginBottom: '20px' }}>
          <svg viewBox="0 0 24 24" style={{ width: '32px', height: '32px', fill: 'url(#metallicGradient)' }}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: '800', 
          letterSpacing: '0.4em', 
          color: '#94a3b8',
          textTransform: 'uppercase',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          Booting Financial OS...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="aurora-canvas">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>
      <CommandCenter />
    </>
  );
}

export default App;
