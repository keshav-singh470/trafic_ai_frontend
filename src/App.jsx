import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Upload, Search, Navigation, ShieldPlus, Ban, UserRound, Smartphone, Clock, Eye, AlertCircle, CheckCircle, Loader2, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const TRAFFIC_CASES = [
  { id: 'anpr', title: 'Number Plate', icon: <Search size={24} />, description: 'AI License Plate recognition' },
  { id: 'wrong_side', title: 'Wrong Side', icon: <Navigation size={24} />, description: 'Illegal direction detection' },
  { id: 'helmet', title: 'No Helmet', icon: <Ban size={24} />, description: 'Two-wheeler safety check' },
  { id: 'triple', title: 'Triple Riding', icon: <UserRound size={24} />, description: 'Overloading detection' },
  { id: 'wrong_lane', title: 'Wrong Lane', icon: <Smartphone size={24} />, description: 'Lane discipline monitoring' },
  { id: 'stalled', title: 'Stalled Vehicle', icon: <Clock size={24} />, description: 'Stationary traffic alert' },
  { id: 'seatbelt', title: 'No Seatbelt', icon: <ShieldPlus size={24} />, description: 'Occupant safety check' },
  { id: 'blacklist', title: 'Security Alert', icon: <Eye size={24} />, description: 'Blacklist/Theft detection' },
];

const CaseCard = ({ title, icon, description, isActive, onClick, disabled }) => (
  <motion.div
    className={`glass-card case-card ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
    onClick={!disabled ? onClick : null}
    whileHover={!disabled ? { y: -5, scale: 1.02 } : {}}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: isActive ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)'
    }}
  >
    <div className="case-header">
      <div className="case-icon" style={{ background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)' }}>
        {icon}
      </div>
      <div className="case-info">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  </motion.div>
);

function App() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [report, setReport] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [selectedCase, setSelectedCase] = useState('anpr');

  useEffect(() => {
    let interval;
    if (jobId && status === 'processing') {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE}/status/${jobId}`);

          // Always fetch current report to show live updates
          fetchReport(jobId);

          if (res.data.status === 'completed') {
            setStatus('completed');
            setVideoUrl(`${API_BASE}${res.data.video_url}`);
            clearInterval(interval);
          } else if (res.data.status === 'error') {
            setStatus('error');
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [jobId, status]);

  const fetchReport = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/report/${id}`);
      setReport(res.data);
    } catch (e) {
      console.error("Failed to fetch report", e);
    }
  };

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setStatus('processing');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('case_type', selectedCase);

    try {
      //const res = await axios.post(`${API_BASE}/upload`, formData);
      const res = await axios.post("/api/upload", formData);

      setJobId(res.data.job_id);
    } catch (e) {
      console.error("Upload failed", e);
      setStatus('error');
    }
  };

  return (
    <div className="container">
      <header className="header" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Smart Traffic AI</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>State-of-the-art Neural Analytics & Automated Reporting</p>
        </motion.div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {!jobId && status !== 'processing' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="cases-section">
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <ShieldPlus size={32} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.8rem' }}>1. Select Detection Module</h3>
                </div>
                <div className="cases-grid">
                  {TRAFFIC_CASES.map(tc => (
                    <CaseCard
                      key={tc.id}
                      {...tc}
                      isActive={selectedCase === tc.id}
                      onClick={() => setSelectedCase(tc.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="section-title" style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Upload size={32} color="var(--primary)" />
                <h3 style={{ fontSize: '1.8rem' }}>2. Upload Target Video</h3>
              </div>

              <motion.div
                className="glass-card upload-area"
                whileHover={{ scale: 1.01, borderColor: 'var(--primary)' }}
                whileTap={{ scale: 0.99 }}
                onClick={() => document.getElementById('fileInput').click()}
                style={{ padding: '4rem', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.1)' }}
              >
                <Smartphone size={64} className="pulse" color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.5rem' }}>Drop your .mp4 here or Click to Browse</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '1.1rem' }}>
                  Process video for high-accuracy <b>{TRAFFIC_CASES.find(c => c.id === selectedCase)?.title}</b>
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept="video/mp4"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />
              </motion.div>
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
              style={{ textAlign: 'center', marginTop: '5rem', padding: '3rem' }}
            >
              <div className="loading-container">
                <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.8rem' }}>Intelligent Analysis in Progress...</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                  Running <b>{TRAFFIC_CASES.find(c => c.id === selectedCase)?.title}</b> neural pipeline
                </p>
              </div>

              {/* Live Report Table */}
              <div style={{ marginTop: '3rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <FileText size={24} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.4rem' }}>Live Violation Stream</h3>
                </div>
                <div className="table-container" style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '1rem', padding: '1rem' }}>
                  <table className="violations-table">
                    <thead>
                      <tr>
                        <th>Frame</th>
                        <th>Vehicle ID</th>
                        <th>Class</th>
                        <th>Detection Result</th>
                        <th>Evidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.length > 0 ? report.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.Frame}</td>
                          <td><span className="id-badge">{row.VehicleID}</span></td>
                          <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{row.Type}</td>
                          <td><code className="plate-code">{row.Plate || 'N/A'}</code></td>
                          <td>
                            {row.CropImgUrl ? (
                              <a href={row.FullImgUrl?.startsWith('http') ? row.FullImgUrl : `${API_BASE}${row.FullImgUrl}`} target="_blank" rel="noreferrer" title="View Full Evidence">
                                <img
                                  src={row.CropImgUrl?.startsWith('http') ? row.CropImgUrl : `${API_BASE}${row.CropImgUrl}`}
                                  alt="Violation"
                                  style={{ height: '40px', borderRadius: '4px', border: '1px solid var(--primary)', cursor: 'zoom-in' }}
                                />
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Waiting for detections...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {status === 'completed' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card results-section"
              style={{ padding: '3rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.2rem' }}>Analysis Insights</h2>
                <span className="status-badge status-completed" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
                  <CheckCircle size={18} style={{ marginRight: '0.5rem' }} /> Success
                </span>
              </div>

              {videoUrl && (
                <div className="video-wrapper" style={{ borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                  <video className="video-preview" controls autoPlay muted loop style={{ width: '100%', display: 'block' }}>
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </div>
              )}

              <div style={{ marginTop: '5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <FileText size={32} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.8rem' }}>Automated Violation Report</h3>
                </div>

                <div className="table-container" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', padding: '1rem' }}>
                  <table className="violations-table">
                    <thead>
                      <tr>
                        <th>Frame</th>
                        <th>Vehicle ID</th>
                        <th>Class</th>
                        <th>Detection Result</th>
                        <th>Evidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.length > 0 ? report.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.Frame}</td>
                          <td><span className="id-badge">{row.VehicleID}</span></td>
                          <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{row.Type}</td>
                          <td><code className="plate-code">{row.Plate || 'N/A'}</code></td>
                          <td>
                            {row.CropImgUrl ? (
                              <a href={row.FullImgUrl?.startsWith('http') ? row.FullImgUrl : `${API_BASE}${row.FullImgUrl}`} target="_blank" rel="noreferrer" title="View Full Evidence">
                                <img
                                  src={row.CropImgUrl?.startsWith('http') ? row.CropImgUrl : `${API_BASE}${row.CropImgUrl}`}
                                  alt="Violation"
                                  style={{ height: '40px', borderRadius: '4px', border: '1px solid var(--primary)', cursor: 'zoom-in' }}
                                />
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            No instances detected in this segment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                <button className="btn btn-primary btn-large" onClick={() => window.location.reload()}>
                  Start New Session
                </button>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card"
              style={{ textAlign: 'center', border: '2px solid var(--error)', padding: '5rem', marginTop: '5rem' }}
            >
              <AlertCircle size={64} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '2rem' }}>Analysis Pipeline Interrupted</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '1.2rem' }}>
                The AI service encountered an unexpected state. Please check the video format.
              </p>
              <button className="btn btn-primary" style={{ marginTop: '2.5rem', padding: '1rem 3rem' }} onClick={() => window.location.reload()}>
                Re-initialize System
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
