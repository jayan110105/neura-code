import { Reminder } from "@/types"

export const mockReminders: Reminder[] = [
  {
    id: 1,
    title: "Team standup meeting",
    description: "Daily standup with the development team",
    time: "9:00 AM",
    date: "2024-01-16",
    repeat: "Daily",
    enabled: true,
    category: "Work",
  },
  {
    id: 2,
    title: "Take medication",
    description: "Remember to take vitamin D supplement",
    time: "8:00 PM",
    date: "2024-01-15",
    repeat: "Daily",
    enabled: true,
    category: "Health",
  },
  {
    id: 3,
    title: "Call mom",
    description: "Weekly check-in call with family",
    time: "3:00 PM",
    date: "2024-01-17",
    repeat: "Weekly",
    enabled: false,
    category: "Personal",
  },
  {
    id: 4,
    title: "Review monthly expenses",
    description: "Go through credit card statements and budget",
    time: "10:00 AM",
    date: "2024-01-31",
    repeat: "Monthly",
    enabled: true,
    category: "Finance",
  },
] 