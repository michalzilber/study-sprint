import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Zap, Target, Timer, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="container max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">StudySprint</span>
        </div>
        <Button onClick={() => navigate('/auth')} variant="secondary" size="sm">
          Sign In
        </Button>
      </header>

      <main className="flex-1 flex items-center">
        <div className="container max-w-6xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
              Stay focused.<br />
              <span className="text-primary">Sprint ahead.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Manage tasks, track focus sessions, and crush your study goals with a built-in Pomodoro timer.
            </p>
            <Button onClick={() => navigate('/auth')} size="lg" className="gradient-primary text-primary-foreground font-semibold text-lg px-8">
              Get Started Free
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Target, title: 'Task Management', desc: 'Create, prioritize, and track all your study tasks.' },
              { icon: Timer, title: 'Pomodoro Timer', desc: '25-minute focused sprints to maximize productivity.' },
              { icon: BarChart3, title: 'Track Progress', desc: 'See your completion rate and focus sessions at a glance.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
