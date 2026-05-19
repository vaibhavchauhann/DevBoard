import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService, sprintService, taskService, teamService } from '../../services';
import Topbar from '../../components/layout/Topbar';
import { toast } from 'react-toastify';
import './Projects.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s, t, m] = await Promise.all([
          projectService.getById(id), sprintService.getByProject(id),
          taskService.getByProject(id), teamService.getMembers(id),
        ]);
        setProject(p.data); setSprints(s.data); setTasks(t.data); setMembers(m.data);
      } catch { toast.error('Failed to load project'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <><Topbar title="Project" /><div className="page-container"><div className="skeleton" style={{ height: 200 }} /></div></>;
  if (!project) return <><Topbar title="Project" /><div className="page-container"><p>Project not found</p></div></>;

  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <>
      <Topbar title={project.name} />
      <div className="page-container">
        <div className="detail-header">
          <div className="project-card-icon" style={{ width: 56, height: 56, fontSize: '1.5rem' }}>{project.name.charAt(0)}</div>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700 }}>{project.name}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{project.description || 'No description'}</p>
          </div>
        </div>

        <div className="stat-grid" style={{ marginTop: 24 }}>
          <div className="stat-card card"><div className="stat-value">{tasks.length}</div><div className="stat-label">Total Tasks</div></div>
          <div className="stat-card card"><div className="stat-value">{doneTasks}</div><div className="stat-label">Completed</div></div>
          <div className="stat-card card"><div className="stat-value">{sprints.length}</div><div className="stat-label">Sprints</div></div>
          <div className="stat-card card"><div className="stat-value">{members.length}</div><div className="stat-label">Members</div></div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 12 }}>Progress</h3>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{progress}% complete</span>
        </div>

        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          <div className="card">
            <h3>Sprints</h3>
            {sprints.length === 0 ? <p className="empty-text">No sprints</p> : sprints.map(s => (
              <div key={s.id} className="activity-item">
                <div className="activity-dot" />
                <div><div className="activity-msg">{s.name}</div><div className="activity-time">{s.status} · {s.totalTasks} tasks</div></div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>Team Members</h3>
            {members.length === 0 ? <p className="empty-text">No members</p> : members.map(m => (
              <div key={m.id} className="activity-item">
                <div className="sidebar-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{m.user?.fullName?.charAt(0)}</div>
                <div><div className="activity-msg">{m.user?.fullName}</div><div className="activity-time">{m.role}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
