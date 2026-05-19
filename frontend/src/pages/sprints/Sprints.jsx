import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectService, sprintService } from '../../services';
import Topbar from '../../components/layout/Topbar';
import { toast } from 'react-toastify';
import { HiOutlinePlus } from 'react-icons/hi';
import '../projects/Projects.css';

export default function Sprints() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    projectService.getAll().then(r => { setProjects(r.data); if (r.data.length > 0) setSelectedProject(r.data[0].id); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    sprintService.getByProject(selectedProject).then(r => setSprints(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, [selectedProject]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Sprint name is required');
    setSubmitting(true);
    try {
      await sprintService.create(selectedProject, form);
      toast.success('Sprint created!');
      setShowModal(false);
      setForm({ name: '', goal: '', startDate: '', endDate: '' });
      sprintService.getByProject(selectedProject).then(r => setSprints(r.data));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id, status) => {
    try { await sprintService.updateStatus(id, status); toast.success('Status updated'); sprintService.getByProject(selectedProject).then(r => setSprints(r.data)); }
    catch { toast.error('Failed'); }
  };

  return (
    <>
      <Topbar title="Sprints" />
      <div className="page-container">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <select className="form-select" style={{ width: 'auto', minWidth: 200 }} value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <p className="page-subheading" style={{ margin: 0 }}>{sprints.length} sprint{sprints.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary-custom" onClick={() => setShowModal(true)} disabled={!selectedProject}><HiOutlinePlus /> New Sprint</button>
        </div>

        {loading ? (
          <div className="project-grid">{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}</div>
        ) : sprints.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🏃</div><h3>No sprints yet</h3><p>Create your first sprint to start tracking work</p></div>
        ) : (
          <div className="project-grid">
            {sprints.map((s, i) => {
              const pct = s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 0;
              return (
                <motion.div key={s.id} className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600 }}>{s.name}</h3>
                    <span className={`badge-status badge-${s.status?.toLowerCase()}`}>{s.status}</span>
                  </div>
                  {s.goal && <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 12 }}>{s.goal}</p>}
                  <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    <span>{s.completedTasks}/{s.totalTasks} tasks</span>
                    <span>{s.startDate} → {s.endDate}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {s.status === 'PLANNING' && <button className="btn-ghost" style={{ fontSize: 'var(--font-xs)', padding: '4px 12px' }} onClick={() => handleStatusChange(s.id, 'ACTIVE')}>Start Sprint</button>}
                    {s.status === 'ACTIVE' && <button className="btn-ghost" style={{ fontSize: 'var(--font-xs)', padding: '4px 12px' }} onClick={() => handleStatusChange(s.id, 'COMPLETED')}>Complete</button>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div className="modal-box" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <h2>Create Sprint</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group" style={{ marginBottom: 16 }}><label className="form-label">Sprint Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Sprint 1" /></div>
                <div className="form-group" style={{ marginBottom: 16 }}><label className="form-label">Goal</label><textarea className="form-control" rows={2} value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="Sprint goal..." /></div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">Start Date</label><input type="date" className="form-control" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">End Date</label><input type="date" className="form-control" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
                </div>
                <div className="modal-actions"><button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn-primary-custom" disabled={submitting}>{submitting ? <span className="spinner-border spinner-border-sm" /> : 'Create'}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
