import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { dashboardService, projectService } from '../../services';
import Topbar from '../../components/layout/Topbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineFolder, HiOutlineLightningBolt, HiOutlineClipboardCheck, HiOutlineClock, HiOutlineUsers, HiOutlineChat } from 'react-icons/hi';
import './Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a, p] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivity(),
          projectService.getAll(),
        ]);
        setStats(s.data);
        setActivity(a.data);
        setProjects(p.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = stats ? [
    { label: 'Projects', value: stats.totalProjects, icon: HiOutlineFolder, color: '#6366f1' },
    { label: 'Active Sprints', value: stats.activeSprintCount, icon: HiOutlineLightningBolt, color: '#10b981' },
    { label: 'Completed Tasks', value: stats.completedTasks, icon: HiOutlineClipboardCheck, color: '#3b82f6' },
    { label: 'Pending Tasks', value: stats.pendingTasks, icon: HiOutlineClock, color: '#f59e0b' },
    { label: 'Team Size', value: stats.teamSize, icon: HiOutlineUsers, color: '#a78bfa' },
    { label: "Today's Standups", value: stats.todayStandups, icon: HiOutlineChat, color: '#f472b6' },
  ] : [];

  const chartData = stats ? [
    { name: 'Completed', value: stats.completedTasks },
    { name: 'Pending', value: stats.pendingTasks },
  ] : [];

  const barData = projects.slice(0, 5).map(p => ({ name: p.name.substring(0, 12), tasks: p.taskCount }));

  if (loading) {
    return (
      <>
        <Topbar title="Dashboard" />
        <div className="page-container">
          <div className="stat-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton stat-skeleton" />)}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-container">
        <div className="stat-grid">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              className="stat-card card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color }}>
                <s.icon />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-grid">
          <motion.div className="card chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3>Tasks by Project</h3>
            <div className="chart-wrapper">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                    <Bar dataKey="tasks" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="empty-text">No project data yet</p>}
            </div>
          </motion.div>

          <motion.div className="card chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h3>Task Completion</h3>
            <div className="chart-wrapper pie-wrapper">
              {stats && stats.totalTasks > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="empty-text">No tasks yet</p>}
              {stats && stats.totalTasks > 0 && (
                <div className="pie-legend">
                  <span className="legend-item"><span className="legend-dot" style={{ background: COLORS[0] }} /> Completed</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: COLORS[1] }} /> Pending</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="card activity-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {activity.length === 0 ? (
                <p className="empty-text">No recent activity</p>
              ) : activity.slice(0, 10).map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" />
                  <div>
                    <div className="activity-msg">{a.message}</div>
                    <div className="activity-time">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="card projects-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="card-header-row">
              <h3>Projects</h3>
              <Link to="/projects" className="view-all-link">View all →</Link>
            </div>
            <div className="project-mini-list">
              {projects.length === 0 ? (
                <p className="empty-text">No projects yet</p>
              ) : projects.slice(0, 5).map(p => (
                <Link to={`/projects/${p.id}`} key={p.id} className="project-mini-item">
                  <div className="project-mini-icon">{p.name.charAt(0)}</div>
                  <div className="project-mini-info">
                    <div className="project-mini-name">{p.name}</div>
                    <div className="project-mini-meta">{p.taskCount} tasks · {p.sprintCount} sprints</div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
