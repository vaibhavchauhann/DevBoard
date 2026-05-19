import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectService, teamService } from '../../services';
import Topbar from '../../components/layout/Topbar';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import '../projects/Projects.css';

export default function Team() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'DEVELOPER' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    projectService.getAll().then(r => { setProjects(r.data); if (r.data.length > 0) setSelectedProject(r.data[0].id); }).finally(() => setLoading(false));
  }, []);

  const loadMembers = () => {
    if (!selectedProject) return;
    teamService.getMembers(selectedProject).then(r => setMembers(r.data));
  };

  useEffect(() => { loadMembers(); }, [selectedProject]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return toast.error('Email is required');
    setSubmitting(true);
    try {
      await teamService.addMember(selectedProject, form);
      toast.success('Member added!');
      setShowModal(false);
      setForm({ email: '', role: 'DEVELOPER' });
      loadMembers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
    finally { setSubmitting(false); }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try { await teamService.removeMember(selectedProject, userId); toast.success('Member removed'); loadMembers(); }
    catch { toast.error('Failed'); }
  };

  const handleRoleChange = async (userId, role) => {
    try { await teamService.updateRole(selectedProject, userId, role); toast.success('Role updated'); loadMembers(); }
    catch { toast.error('Failed'); }
  };

  return (
    <>
      <Topbar title="Team Management" />
      <div className="page-container">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <select className="form-select" style={{ width: 'auto', minWidth: 200 }} value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <p className="page-subheading" style={{ margin: 0 }}>{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary-custom" onClick={() => setShowModal(true)} disabled={!selectedProject}><HiOutlinePlus /> Add Member</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72 }} />)}</div>
        ) : members.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">👥</div><h3>No team members</h3><p>Add members to start collaborating</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map((m, i) => (
              <motion.div key={m.id} className="card" style={{ padding: '16px 20px' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="sidebar-avatar" style={{ width: 40, height: 40 }}>{m.user?.fullName?.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-base)' }}>{m.user?.fullName}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{m.user?.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: 'var(--font-xs)' }} value={m.role} onChange={e => handleRoleChange(m.user.id, e.target.value)}>
                      <option value="ADMIN">Admin</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="DEVELOPER">Developer</option>
                    </select>
                    <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleRemove(m.user.id)} title="Remove"><HiOutlineTrash /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div className="modal-box" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <h2>Add Team Member</h2>
              <form onSubmit={handleAdd}>
                <div className="form-group" style={{ marginBottom: 16 }}><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="member@company.com" /></div>
                <div className="form-group" style={{ marginBottom: 24 }}><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="DEVELOPER">Developer</option><option value="PROJECT_MANAGER">Project Manager</option><option value="ADMIN">Admin</option></select></div>
                <div className="modal-actions"><button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn-primary-custom" disabled={submitting}>{submitting ? <span className="spinner-border spinner-border-sm" /> : 'Add Member'}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
