export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  category: string;
} 