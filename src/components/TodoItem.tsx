import { useState } from 'react';
import { Todo } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number, data: Partial<Todo>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    await onUpdate(todo.id, { completed: todo.completed ? 0 : 1 });
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsLoading(true);
    await onUpdate(todo.id, { title: title.trim(), description: description.trim() });
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setDescription(todo.description);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await onDelete(todo.id);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-card rounded-lg border shadow-soft animate-scale-in">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="mb-3 font-medium"
          autoFocus
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="mb-3 min-h-[80px] resize-none"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isLoading || !title.trim()}>
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group p-4 bg-card rounded-lg border shadow-soft transition-all hover:shadow-elevated animate-slide-up",
        todo.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={!!todo.completed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
          className="mt-1 h-5 w-5 rounded-md data-[state=checked]:bg-success data-[state=checked]:border-success"
        />
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-medium text-foreground transition-all",
              todo.completed && "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </h3>
          {todo.description && (
            <p
              className={cn(
                "mt-1 text-sm text-muted-foreground",
                todo.completed && "line-through"
              )}
            >
              {todo.description}
            </p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
