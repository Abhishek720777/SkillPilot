import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Terminal, Cpu, Code, Database } from 'lucide-react';
import '../styles/notfound.css';

const NotFoundPage = () => {
  return (
    <div className="notfound-container">
      <div className="floating-elements">
        <Terminal className="element e1" size={40} />
        <Cpu className="element e2" size={32} />
        <Code className="element e3" size={48} />
        <Database className="element e4" size={36} />
      </div>

      <div className="notfound-content">
        <div className="notfound-404">404</div>
        <h1 className="notfound-title">Endpoint Not Found</h1>
        <p className="notfound-text">
          The module or data you are looking for has been moved or deleted from the server. 
          Check the URL or return to the safe zone.
        </p>
        
        <Link to="/dashboard" className="notfound-btn">
          <ArrowLeft />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
