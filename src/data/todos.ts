export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  category: string;
}

export const mockTodos: {
  today: Todo[];
  upcoming: Todo[];
  completed: Todo[];
} = {
  today: [
    {
      id: 1,
      title: "Review design mockups for mobile app",
      completed: false,
      priority: "High",
      dueDate: "2024-01-15",
      category: "Work",
    },
    {
      id: 2,
      title: "Call dentist to schedule appointment",
      completed: true,
      priority: "Medium",
      dueDate: "2024-01-15",
      category: "Personal",
    },
  ],
  upcoming: [
    {
      id: 3,
      title: "Prepare presentation for client meeting",
      completed: false,
      priority: "High",
      dueDate: "2024-01-17",
      category: "Work",
    },
    {
      id: 4,
      title: "Buy groceries for the week",
      completed: false,
      priority: "Low",
      dueDate: "2024-01-16",
      category: "Personal",
    },
  ],
  completed: [
    {
      id: 5,
      title: "Update portfolio website",
      completed: true,
      priority: "Medium",
      dueDate: "2024-01-14",
      category: "Work",
    },
  ],
}; 