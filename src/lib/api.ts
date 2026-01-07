const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authApi = {
  register: (email: string, password: string, name?: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  updateProfile: (data: { name?: string; avatar_url?: string }) =>
    request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Todos API
export const todosApi = {
  getAll: () => request<{ todos: Todo[] }>('/todos'),

  create: (title: string, description?: string) =>
    request<{ todo: Todo }>('/todos', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),

  update: (id: number, data: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>) =>
    request<{ todo: Todo }>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ success: boolean }>(`/todos/${id}`, {
      method: 'DELETE',
    }),
};

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description: string;
  completed: number;
  created_at: string;
  updated_at: string;
}
