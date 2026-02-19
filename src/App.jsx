import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Upload, Search, Navigation, ShieldPlus, Ban, UserRound, Smartphone, Clock, Eye, AlertCircle, CheckCircle, Loader2, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Resolve image URL:
// - Presigned S3 URL (starts with https://) → use as-is
// - Local path (starts with /) → prepend API_BASE
// - null/undefined → null
const resolveImgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url}`;
};

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
      //const res = await axios.post(`${API_BASE}/upload`, formData);
      // Use direct API base URL to bypass Vercel limits
      const res = await axios.post(`${API_BASE}/upload`, formData);

      setJobId(res.data.job_id);
    } catch (e) {
      console.error("Upload failed", e);
      setStatus('error');
    }
  };

  return (
    <div className="container">
      <header className="header px-4 py-8 md:py-12 lg:py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="gradient-text text-3xl md:text-5xl lg:text-6xl font-extrabold mb-2 md:mb-4">Smart Traffic AI</h1>
          <p className="text-sm md:text-lg lg:text-xl text-[var(--text-muted)]">State-of-the-art Neural Analytics & Automated Reporting</p>
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
                <div className="section-title flex items-center gap-4 mb-6 md:mb-8">
                  <ShieldPlus className="size-6 md:size-8" color="var(--primary)" />
                  <h3 className="text-xl md:text-2xl font-semibold">1. Select Detection Module</h3>
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

              <div className="section-title flex items-center gap-4 mt-12 md:mt-16 mb-6 md:mb-8">
                <Upload className="size-6 md:size-8" color="var(--primary)" />
                <h3 className="text-xl md:text-2xl font-semibold">2. Upload Target Video</h3>
              </div>

              <motion.div
                className="glass-card upload-area p-8 md:p-12 lg:p-16 text-center cursor-pointer"
                whileHover={{ scale: 1.01, borderColor: 'var(--primary)' }}
                whileTap={{ scale: 0.99 }}
                onClick={() => document.getElementById('fileInput').click()}
                style={{ border: '2px dashed rgba(255,255,255,0.1)' }}
              >
                <Smartphone className="size-12 md:size-16 pulse mx-auto mb-4 md:mb-6" color="var(--primary)" />
                <h3 className="text-lg md:text-2xl font-semibold">Drop your .mp4 here or Click to Browse</h3>
                <p className="text-sm md:text-base text-[var(--text-muted)] mt-2 md:mt-4">
                  Process video for high-accuracy <b>{TRAFFIC_CASES.find(c => c.id === selectedCase)?.title}</b>
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept="video/mp4"
                  onChange={handleUpload}
                  className="hidden"
                />
              </motion.div>
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card text-center mt-12 md:mt-20 p-6 md:p-12"
            >
              <div className="loading-container">
                <Loader2 className="size-10 md:size-12 animate-spin mx-auto mb-4 md:mb-6 text-[var(--primary)]" />
                <h3 className="text-xl md:text-2xl font-semibold">Intelligent Analysis in Progress...</h3>
                <p className="text-sm md:text-base text-[var(--text-muted)] mt-2">
                  Running <b>{TRAFFIC_CASES.find(c => c.id === selectedCase)?.title}</b> neural pipeline
                </p>
              </div>

              {/* Live Report Table */}
              <div className="mt-8 md:mt-12 text-left">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <FileText className="size-6 text-[var(--primary)]" />
                  <h3 className="text-lg md:text-xl font-semibold">Live Violation Stream</h3>
                </div>
                <div className="table-container bg-white/5 rounded-xl p-2 md:p-4">
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
                            {resolveImgUrl(row.plate_image || row.CropImgUrl) ? (
                              <a
                                href={resolveImgUrl(row.vehicle_image || row.FullImgUrl)}
                                target="_blank" rel="noreferrer" title="View Full Evidence"
                              >
                                <img
                                  src={resolveImgUrl(row.plate_image || row.CropImgUrl)}
                                  alt={row.extracted_number || 'Violation'}
                                  style={{ height: '40px', borderRadius: '4px', border: '1px solid var(--primary)', cursor: 'zoom-in' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'inline';
                                  }}
                                />
                                <span style={{ display: 'none', color: 'var(--error)', fontSize: '0.75rem' }}>⚠ Load failed</span>
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
              className="glass-card results-section p-6 md:p-12"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold">Analysis Insights</h2>
                <span className="status-badge status-completed w-fit px-4 py-2 text-sm md:text-base">
                  <CheckCircle size={18} className="mr-2 inline" /> Success
                </span>
              </div>

              {videoUrl && (
                <div className="video-wrapper" style={{ borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                  <video className="video-preview" controls autoPlay muted loop style={{ width: '100%', display: 'block' }}>
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </div>
              )}

              <div className="mt-12 md:mt-20">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <FileText className="size-8 text-[var(--primary)]" />
                  <h3 className="text-xl md:text-2xl font-semibold">Automated Violation Report</h3>
                </div>

                <div className="table-container bg-white/5 rounded-xl p-2 md:p-4">
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
                            {resolveImgUrl(row.plate_image || row.CropImgUrl) ? (
                              <a
                                href={resolveImgUrl(row.vehicle_image || row.FullImgUrl)}
                                target="_blank" rel="noreferrer" title="View Full Evidence"
                              >
                                <img
                                  src={resolveImgUrl(row.plate_image || row.CropImgUrl)}
                                  alt={row.extracted_number || 'Violation'}
                                  style={{ height: '40px', borderRadius: '4px', border: '1px solid var(--primary)', cursor: 'zoom-in' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'inline';
                                  }}
                                />
                                <span style={{ display: 'none', color: 'var(--error)', fontSize: '0.75rem' }}>⚠ Load failed</span>
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

              <div className="mt-12 md:mt-16 text-center">
                <button className="btn btn-primary w-full md:w-auto px-8 py-3 text-lg" onClick={() => window.location.reload()}>
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
              className="glass-card text-center border-2 border-[var(--error)] p-8 md:p-20 mt-12 md:mt-20"
            >
              <AlertCircle className="size-12 md:size-16 mx-auto mb-6 text-[var(--error)]" />
              <h3 className="text-2xl md:text-3xl font-bold">Analysis Pipeline Interrupted</h3>
              <p className="text-sm md:text-lg text-[var(--text-muted)] mt-4">
                The AI service encountered an unexpected state. Please check the video format.
              </p>
              <button className="btn btn-primary w-full md:w-auto mt-8 px-8 py-3" onClick={() => window.location.reload()}>
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
