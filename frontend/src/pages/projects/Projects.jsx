import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectService } from '../../services';
import Topbar from '../../components/layout/Topbar';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineArchive } from 'react-icons/hi';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try { const res = await projectService.getAll(); setProjects(res.data); }
    catch (e) { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setSubmitting(true);
    try {
      await projectService.create(form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleArchive = async (id) => {
    try { await projectService.archive(id); toast.success('Project archived'); load(); }
    catch { toast.error('Failed to archive'); }
  };

  return (
    <>
      <Topbar title="Projects" />
      <div className="page-container">
        <div className="page-header">
          <div>
            <h2 className="page-heading">Your Projects</h2>
            <p className="page-subheading">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary-custom" onClick={() => setShowModal(true)} id="create-project-btn">
            <HiOutlinePlus /> New Project
          </button>
        </div>

        {loading ? (
          <div className="project-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton project-skeleton" />)}</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No projects yet</h3>
            <p>Create your first project to get started</p>
            <button className="btn-primary-custom" onClick={() => setShowModal(true)}>Create Project</button>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/projects/${p.id}`} className="project-card card">
                  <div className="project-card-header">
                    <div className="project-card-icon">{p.name.charAt(0)}</div>
                    <span className={`badge-status badge-${p.status?.toLowerCase()}`}>{p.status}</span>
                  </div>
                  <h3 className="project-card-name">{p.name}</h3>
                  <p className="project-card-desc">{p.description || 'No description'}</p>
                  <div className="project-card-stats">
                    <span>{p.taskCount} tasks</span>
                    <span>{p.sprintCount} sprints</span>
                    <span>{p.memberCount} members</span>
                  </div>
                  <div className="project-card-footer">
                    <span className="project-card-date">{new Date(p.createdAt).toLocaleDateString()}</span>
                    <button className="icon-btn" onClick={(e) => { e.preventDefault(); handleArchive(p.id); }} title="Archive">
                      <HiOutlineArchive />
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div className="modal-box" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <h2>Create Project</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Project Name</label>
                  <input className="form-control" placeholder="e.g. DevBoard v2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary-custom" disabled={submitting}>
                    {submitting ? <span className="spinner-border spinner-border-sm" /> : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
