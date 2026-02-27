import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalTasks } from '@/hooks/useLocalTasks';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskForm from '@/components/TaskForm';
import TaskCard from '@/components/TaskCard';
import { Plus, Zap, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks, createTask, updateTask, deleteTask } = useLocalTasks();
  const { toast } = useToast();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<typeof tasks[0] | null>(null);

  const handleSessionComplete = useCallback(() => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;
    updateTask(selectedTaskId, { focus_sessions: task.focus_sessions + 1 });
    toast({ title: '🎉 Focus session completed!' });
  }, [selectedTaskId, tasks, updateTask, toast]);

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const completionPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">StudySprint</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Home
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Your Progress!</h2>
            <span className="text-2xl font-bold text-primary font-mono">{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedTasks.length} of {tasks.length} tasks completed
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Active Tasks</h2>
              <Button onClick={() => { setShowForm(true); setEditingTask(null); }} className="gradient-primary text-primary-foreground" size="sm">
                <Plus className="w-4 h-4 mr-2" /> New Task
              </Button>
            </div>

            {(showForm || editingTask) && (
              <TaskForm
                initial={editingTask ? {
                  title: editingTask.title,
                  description: editingTask.description,
                  due_date: editingTask.due_date,
                  priority: editingTask.priority,
                } : undefined}
                onSubmit={(data) => {
                  if (editingTask) {
                    updateTask(editingTask.id, data);
                    setEditingTask(null);
                  } else {
                    createTask(data);
                    setShowForm(false);
                  }
                  toast({ title: editingTask ? 'Task updated!' : 'Task created!' });
                }}
                onCancel={() => { setShowForm(false); setEditingTask(null); }}
              />
            )}

            {activeTasks.length === 0 && !showForm ? (
              <div className="text-center py-12 glass rounded-xl">
                <p className="text-muted-foreground mb-2">No active tasks yet</p>
                <p className="text-sm text-muted-foreground">Create your first task to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onSelect={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                    onToggleComplete={() => updateTask(task.id, { completed: true })}
                    onEdit={() => { setEditingTask(task); setShowForm(false); }}
                    onDelete={() => { deleteTask(task.id); if (selectedTaskId === task.id) setSelectedTaskId(null); toast({ title: 'Task deleted' }); }}
                  />
                ))}
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-muted-foreground mb-3">Completed ({completedTasks.length})</h3>
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isSelected={false}
                      onSelect={() => {}}
                      onToggleComplete={() => updateTask(task.id, { completed: false })}
                      onEdit={() => { setEditingTask(task); setShowForm(false); }}
                      onDelete={() => { deleteTask(task.id); toast({ title: 'Task deleted' }); }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <PomodoroTimer
              onSessionComplete={handleSessionComplete}
              isTaskSelected={!!selectedTaskId}
            />
            {selectedTaskId && (
              <div className="mt-4 glass rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Focusing on:</p>
                <p className="font-medium text-foreground truncate">
                  {tasks.find(t => t.id === selectedTaskId)?.title}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
