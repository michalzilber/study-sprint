import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (task: { title: string; description: string; due_date: string | null; priority: 'LOW' | 'MEDIUM' | 'HIGH' }) => void;
  onCancel: () => void;
  initial?: { title: string; description: string; due_date: string | null; priority: 'LOW' | 'MEDIUM' | 'HIGH' };
}

const TaskForm = ({ onSubmit, onCancel, initial }: TaskFormProps) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>(initial?.priority ?? 'MEDIUM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), due_date: dueDate || null, priority });
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{initial ? 'Edit Task' : 'New Task'}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" required className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" className="bg-secondary border-border resize-none" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Due Date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as 'LOW' | 'MEDIUM' | 'HIGH')}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">
          {initial ? 'Update Task' : 'Create Task'}
        </Button>
      </form>
    </div>
  );
};

export default TaskForm;
