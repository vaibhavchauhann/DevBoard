import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectService, standupService } from '../../services';
import Topbar from '../../components/layout/Topbar';
import { toast } from 'react-toastify';
import '../projects/Projects.css';

export default function Standups() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [standups, setStandups] = useState([]);
  const [todayDone, setTodayDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ yesterday: '', today: '', blockers: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    projectService.getAll().then(r => { setProjects(r.data); if (r.data.length > 0) setSelectedProject(r.data[0].id); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    standupService.getByProject(selectedProject).then(r => setStandups(r.data));
    standupService.getToday(selectedProject).then(r => { if (r.data) setTodayDone(true); else setTodayDone(false); }).catch(() => setTodayDone(false));
  }, [selectedProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.yesterday.trim() || !form.today.trim()) return toast.error('Yesterday and Today fields are required');
    setSubmitting(true);
    try {
      await standupService.submit({ ...form, projectId: selectedProject });
      toast.success('Standup submitted!');
      setTodayDone(true);
      setForm({ yesterday: '', today: '', blockers: '' });
      standupService.getByProject(selectedProject).then(r => setStandups(r.data));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <Topbar title="Daily Standups" />
      <div className="page-container">
        <div className="page-header">
          <select className="form-select" style={{ width: 'auto', minWidth: 200 }} value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {!todayDone && selectedProject && (
          <motion.div className="card" style={{ marginBottom: 32 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h3 style={{ marginBottom: 16, fontSize: 'var(--font-md)', fontWeight: 600 }}>📝 Submit Today's Standup</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">What did you work on yesterday?</label>
                <textarea className="form-control" rows={3} value={form.yesterday} onChange={e => setForm({ ...form, yesterday: e.target.value })} placeholder="Completed authentication module..." />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">What will you work on today?</label>
                <textarea className="form-control" rows={3} value={form.today} onChange={e => setForm({ ...form, today: e.target.value })} placeholder="Working on Kanban board..." />
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Any blockers?</label>
                <textarea className="form-control" rows={2} value={form.blockers} onChange={e => setForm({ ...form, blockers: e.target.value })} placeholder="None / Waiting for API spec..." />
              </div>
              <button type="submit" className="btn-primary-custom" disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm" /> : 'Submit Standup'}
              </button>
            </form>
          </motion.div>
        )}

        {todayDone && (
          <div className="card" style={{ marginBottom: 32, textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
            <h3>Standup submitted for today!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Check back tomorrow for your next standup.</p>
          </div>
        )}

        <h3 style={{ marginBottom: 16, fontSize: 'var(--font-md)', fontWeight: 600 }}>Standup History</h3>
        {standups.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><h3>No standups yet</h3></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {standups.map((s, i) => (
              <motion.div key={s.id} className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="mini-avatar" style={{ width: 28, height: 28 }}>{s.user?.fullName?.charAt(0)}</div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{s.user?.fullName}</span>
                  </div>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{s.standupDate}</span>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div><span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>Yesterday</span><p style={{ margin: '4px 0 0', fontSize: 'var(--font-sm)', lineHeight: 1.5 }}>{s.yesterday}</p></div>
                  <div><span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>Today</span><p style={{ margin: '4px 0 0', fontSize: 'var(--font-sm)', lineHeight: 1.5 }}>{s.today}</p></div>
                  {s.blockers && <div><span style={{ fontSize: 'var(--font-xs)', color: 'var(--danger)', fontWeight: 500 }}>Blockers</span><p style={{ margin: '4px 0 0', fontSize: 'var(--font-sm)', lineHeight: 1.5 }}>{s.blockers}</p></div>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
