import { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { projectService, sprintService, taskService, teamService } from '../../services';
import Topbar from '../../components/layout/Topbar';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineCalendar, HiOutlineUser } from 'react-icons/hi';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';
import './Board.css';

const COLUMNS = [
  { id: 'BACKLOG', label: 'Backlog', color: '#6b7280' },
  { id: 'TODO', label: 'Todo', color: '#3b82f6' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b' },
  { id: 'REVIEW', label: 'Review', color: '#a78bfa' },
  { id: 'DONE', label: 'Done', color: '#10b981' },
];

const PRIORITY_COLORS = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981' };

function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(task.id) });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="kanban-card" onClick={() => onClick(task)}>
      {task.labels && <div className="kanban-labels">{task.labels.split(',').map((l, i) => <span key={i} className="kanban-label">{l.trim()}</span>)}</div>}
      <div className="kanban-card-title">{task.title}</div>
      <div className="kanban-card-meta">
        <span className="badge-priority" style={{ background: `${PRIORITY_COLORS[task.priority]}18`, color: PRIORITY_COLORS[task.priority] }}>{task.priority}</span>
        {task.dueDate && <span className="kanban-due"><HiOutlineCalendar /> {task.dueDate}</span>}
      </div>
      <div className="kanban-card-footer">
        {task.assignee ? (
          <div className="kanban-assignee"><div className="mini-avatar">{task.assignee.fullName?.charAt(0)}</div><span>{task.assignee.fullName}</span></div>
        ) : <span className="kanban-unassigned"><HiOutlineUser /> Unassigned</span>}
        {task.commentCount > 0 && <span className="kanban-comments">💬 {task.commentCount}</span>}
      </div>
    </div>
  );
}

export default function Board() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'BACKLOG', assigneeId: '', dueDate: '', labels: '' });
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    projectService.getAll().then(r => { setProjects(r.data); if (r.data.length > 0) setSelectedProject(r.data[0].id); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    sprintService.getByProject(selectedProject).then(r => { setSprints(r.data); const active = r.data.find(s => s.status === 'ACTIVE'); if (active) setSelectedSprint(active.id); else if (r.data.length > 0) setSelectedSprint(r.data[0].id); });
    teamService.getMembers(selectedProject).then(r => setMembers(r.data));
  }, [selectedProject]);

  const loadTasks = useCallback(() => {
    if (!selectedSprint) return;
    taskService.getBySprint(selectedSprint).then(r => setTasks(r.data)).catch(() => toast.error('Failed to load tasks'));
  }, [selectedSprint]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // WebSocket for live board updates
  useEffect(() => {
    if (!selectedSprint) return;
    const wsUrl = `${window.location.protocol}//${window.location.host}/ws`;
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      onConnect: () => { client.subscribe(`/topic/board/${selectedSprint}`, () => loadTasks()); },
    });
    client.activate();
    return () => client.deactivate();
  }, [selectedSprint, loadTasks]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const taskId = parseInt(active.id);
    const newStatus = over.id;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try { await taskService.updateStatus(taskId, { status: newStatus, position: 0 }); }
    catch { loadTasks(); toast.error('Failed to move task'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    try {
      await taskService.create({ ...form, projectId: selectedProject, sprintId: selectedSprint, assigneeId: form.assigneeId || null });
      toast.success('Task created!');
      setShowCreate(false);
      setForm({ title: '', description: '', priority: 'MEDIUM', status: 'BACKLOG', assigneeId: '', dueDate: '', labels: '' });
      loadTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const getColumnTasks = (status) => tasks.filter(t => t.status === status);
  const dragTask = activeId ? tasks.find(t => t.id === parseInt(activeId)) : null;

  return (
    <>
      <Topbar title="Kanban Board" />
      <div className="board-container">
        <div className="board-toolbar">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select className="form-select" style={{ width: 'auto' }} value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={selectedSprint} onChange={e => setSelectedSprint(e.target.value)}>
              {sprints.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
            </select>
          </div>
          <button className="btn-primary-custom" onClick={() => setShowCreate(true)} disabled={!selectedSprint}><HiOutlinePlus /> Add Task</button>
        </div>

        {!selectedSprint ? (
          <div className="empty-state"><div className="empty-icon">📋</div><h3>Select a sprint</h3><p>Choose a project and sprint to view the board</p></div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={e => setActiveId(e.active.id)} onDragEnd={handleDragEnd}>
            <div className="kanban-board">
              {COLUMNS.map(col => (
                <div key={col.id} className="kanban-column">
                  <div className="kanban-column-header">
                    <span className="kanban-column-dot" style={{ background: col.color }} />
                    <span className="kanban-column-title">{col.label}</span>
                    <span className="kanban-column-count">{getColumnTasks(col.id).length}</span>
                  </div>
                  <SortableContext items={getColumnTasks(col.id).map(t => String(t.id))} strategy={verticalListSortingStrategy} id={col.id}>
                    <div className="kanban-column-body" id={col.id} data-column={col.id}>
                      {getColumnTasks(col.id).map(task => (
                        <TaskCard key={task.id} task={task} onClick={setShowDetail} />
                      ))}
                      {getColumnTasks(col.id).length === 0 && <div className="kanban-empty">No tasks</div>}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>
            <DragOverlay>{dragTask ? <div className="kanban-card drag-overlay"><div className="kanban-card-title">{dragTask.title}</div></div> : null}</DragOverlay>
          </DndContext>
        )}

        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <motion.div className="modal-box" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 520 }}>
              <h2>Create Task</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group" style={{ marginBottom: 16 }}><label className="form-label">Title</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" /></div>
                <div className="form-group" style={{ marginBottom: 16 }}><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the task..." /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group"><label className="form-label">Priority</label><select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></div>
                  <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group"><label className="form-label">Assignee</label><select className="form-select" value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}><option value="">Unassigned</option>{members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.fullName}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-control" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}><label className="form-label">Labels (comma separated)</label><input className="form-control" value={form.labels} onChange={e => setForm({ ...form, labels: e.target.value })} placeholder="bug, frontend, urgent" /></div>
                <div className="modal-actions"><button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn-primary-custom">Create Task</button></div>
              </form>
            </motion.div>
          </div>
        )}

        {showDetail && (
          <div className="modal-overlay" onClick={() => setShowDetail(null)}>
            <motion.div className="modal-box" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 560 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>{showDetail.title}</h2>
                <span className="badge-priority" style={{ background: `${PRIORITY_COLORS[showDetail.priority]}18`, color: PRIORITY_COLORS[showDetail.priority] }}>{showDetail.priority}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', lineHeight: 1.6 }}>{showDetail.description || 'No description'}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                <div><span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Status</span><div style={{ marginTop: 4, fontSize: 'var(--font-sm)' }}>{showDetail.status}</div></div>
                <div><span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Assignee</span><div style={{ marginTop: 4, fontSize: 'var(--font-sm)' }}>{showDetail.assignee?.fullName || 'Unassigned'}</div></div>
                <div><span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Due Date</span><div style={{ marginTop: 4, fontSize: 'var(--font-sm)' }}>{showDetail.dueDate || 'None'}</div></div>
                <div><span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Comments</span><div style={{ marginTop: 4, fontSize: 'var(--font-sm)' }}>{showDetail.commentCount}</div></div>
              </div>
              <div className="modal-actions" style={{ marginTop: 24 }}><button className="btn-ghost" onClick={() => setShowDetail(null)}>Close</button></div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
