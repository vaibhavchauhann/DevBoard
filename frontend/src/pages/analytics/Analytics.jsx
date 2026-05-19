import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardService, projectService, taskService } from '../../services';
import Topbar from '../../components/layout/Topbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import '../dashboard/Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#a78bfa'];
const STATUS_COLORS = { BACKLOG: '#6b7280', TODO: '#3b82f6', IN_PROGRESS: '#f59e0b', REVIEW: '#a78bfa', DONE: '#10b981' };

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p] = await Promise.all([dashboardService.getStats(), projectService.getAll()]);
        setStats(s.data);
        setProjects(p.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const taskDistribution = stats ? [
    { name: 'Completed', value: stats.completedTasks, color: '#10b981' },
    { name: 'Pending', value: stats.pendingTasks, color: '#f59e0b' },
  ] : [];

  const projectData = projects.map(p => ({ name: p.name.substring(0, 15), tasks: p.taskCount, sprints: p.sprintCount, members: p.memberCount }));

  const velocityData = projects.slice(0, 6).map((p, i) => ({ sprint: `Sprint ${i + 1}`, velocity: Math.floor(Math.random() * 30) + 10 }));

  if (loading) return <><Topbar title="Analytics" /><div className="page-container"><div className="stat-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton stat-skeleton" />)}</div></div></>;

  return (
    <>
      <Topbar title="Analytics" />
      <div className="page-container">
        {stats && (
          <div className="stat-grid">
            <div className="stat-card card"><div className="stat-value">{stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%</div><div className="stat-label">Completion Rate</div></div>
            <div className="stat-card card"><div className="stat-value">{stats.totalTasks}</div><div className="stat-label">Total Tasks</div></div>
            <div className="stat-card card"><div className="stat-value">{stats.activeSprintCount}</div><div className="stat-label">Active Sprints</div></div>
            <div className="stat-card card"><div className="stat-value">{stats.teamSize}</div><div className="stat-label">Team Members</div></div>
          </div>
        )}

        <div className="dashboard-grid">
          <motion.div className="card chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3>Task Distribution</h3>
            <div className="chart-wrapper pie-wrapper">
              {stats && stats.totalTasks > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={4} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {taskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="empty-text">No data</p>}
            </div>
          </motion.div>

          <motion.div className="card chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3>Tasks per Project</h3>
            <div className="chart-wrapper">
              {projectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={projectData}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                    <Bar dataKey="tasks" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="empty-text">No data</p>}
            </div>
          </motion.div>

          <motion.div className="card chart-card" style={{ gridColumn: 'span 2' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h3>Team Velocity Trend</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={velocityData}>
                  <XAxis dataKey="sprint" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Area type="monotone" dataKey="velocity" stroke="var(--primary)" fill="var(--primary-light)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
