import { useState, useEffect, useCallback } from 'react';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: TaskPriority;
  completed: boolean;
  focus_sessions: number;
  created_at: string;
}

const STORAGE_KEY = 'studysprint-tasks';

const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const useLocalTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const createTask = useCallback((data: { title: string; description: string; due_date: string | null; priority: TaskPriority }) => {
    const newTask: Task = {
      ...data,
      id: crypto.randomUUID(),
      completed: false,
      focus_sessions: 0,
      created_at: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, createTask, updateTask, deleteTask };
};
