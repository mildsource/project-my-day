import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { TodoItem } from '@/components/TodoItem';
import { AddTodoForm } from '@/components/AddTodoForm';
import { todosApi, Todo } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const { todos } = await todosApi.getAll();
      setTodos(todos);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (title: string, description?: string) => {
    try {
      const { todo } = await todosApi.create(title, description);
      setTodos((prev) => [todo, ...prev]);
      toast({ title: 'Task added', description: 'Your new task has been created.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add task',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (id: number, data: Partial<Todo>) => {
    try {
      const { todo } = await todosApi.update(id, data);
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await todosApi.delete(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      toast({ title: 'Task deleted', description: 'The task has been removed.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold mb-2">My Tasks</h1>
          <p className="text-muted-foreground">
            {activeTodos.length === 0
              ? 'All done! Time to relax or add new tasks.'
              : `You have ${activeTodos.length} task${activeTodos.length > 1 ? 's' : ''} to complete`}
          </p>
        </div>

        {/* Add Todo Form */}
        <div className="mb-6">
          <AddTodoForm onAdd={handleAdd} />
        </div>

        {/* Todos List */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1 gap-2">
              <ListTodo className="h-4 w-4" />
              All ({todos.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1 gap-2">
              <Circle className="h-4 w-4" />
              Active ({activeTodos.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Done ({completedTodos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-0">
            {todos.length === 0 ? (
              <EmptyState />
            ) : (
              todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-3 mt-0">
            {activeTodos.length === 0 ? (
              <EmptyState message="No active tasks. Great job!" />
            ) : (
              activeTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-0">
            {completedTodos.length === 0 ? (
              <EmptyState message="No completed tasks yet." />
            ) : (
              completedTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function EmptyState({ message = "No tasks yet. Add your first task above!" }: { message?: string }) {
  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <ListTodo className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
