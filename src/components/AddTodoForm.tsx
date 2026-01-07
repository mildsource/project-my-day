import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface AddTodoFormProps {
  onAdd: (title: string, description?: string) => Promise<void>;
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    await onAdd(title.trim(), description.trim() || undefined);
    setTitle('');
    setDescription('');
    setIsOpen(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full justify-start gap-2 h-12 border-dashed text-muted-foreground hover:text-foreground hover:border-primary/50"
      >
        <Plus className="h-4 w-4" />
        Add a new task
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-card rounded-lg border shadow-soft animate-scale-in">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="mb-3 font-medium"
        autoFocus
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description (optional)"
        className="mb-3 min-h-[80px] resize-none"
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isLoading || !title.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>
    </form>
  );
}
