import { Button } from '@/components/ui/button';
import { Check, Pencil, Trash2, Timer, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: 'LOWER' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  focus_sessions: number;
}

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-success/20 text-success',
  MEDIUM: 'bg-warning/20 text-warning',
  HIGH: 'bg-destructive/20 text-destructive',
};

const TaskCard = ({ task, isSelected, onSelect, onToggleComplete, onEdit, onDelete }: TaskCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'glass rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-primary/30',
        isSelected && 'border-primary/60 glow-primary',
        task.completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
            task.completed ? 'border-success bg-success' : 'border-muted-foreground hover:border-primary'
          )}
        >
          {task.completed && <Check className="w-3 h-3 text-success-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn('font-medium text-foreground truncate', task.completed && 'line-through')}>
              {task.title}
            </h4>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', priorityColors[task.priority])}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            {task.focus_sessions > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <Flame className="w-3 h-3" />
                {task.focus_sessions} session{task.focus_sessions > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
