import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskForm from '@/components/TaskForm';
import TaskCard from '@/components/TaskCard';
import { Plus, LogOut, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: TaskPriority;
  completed: boolean;
  focus_sessions: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (task: { title: string; description: string; due_date: string | null; priority: TaskPriority }) => {
      const { error } = await supabase.from('tasks').insert({
        ...task,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      toast({ title: 'Task created!' });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (selectedTaskId) setSelectedTaskId(null);
      toast({ title: 'Task deleted' });
    },
  });

  const handleSessionComplete = useCallback(() => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;
    updateTask.mutate({ id: selectedTaskId, focus_sessions: task.focus_sessions + 1 });
    toast({ title: '🎉 Focus session completed!' });
  }, [selectedTaskId, tasks, updateTask, toast]);

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const completionPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">StudySprint</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
            <span className="text-2xl font-bold text-primary font-mono">{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedTasks.length} of {tasks.length} tasks completed
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tasks */}
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
                    updateTask.mutate({ id: editingTask.id, ...data });
                  } else {
                    createTask.mutate(data);
                  }
                }}
                onCancel={() => { setShowForm(false); setEditingTask(null); }}
              />
            )}

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading tasks...</div>
            ) : activeTasks.length === 0 && !showForm ? (
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
                    onToggleComplete={() => updateTask.mutate({ id: task.id, completed: true })}
                    onEdit={() => { setEditingTask(task); setShowForm(false); }}
                    onDelete={() => deleteTask.mutate(task.id)}
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
                      onToggleComplete={() => updateTask.mutate({ id: task.id, completed: false })}
                      onEdit={() => { setEditingTask(task); setShowForm(false); }}
                      onDelete={() => deleteTask.mutate(task.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timer sidebar */}
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
