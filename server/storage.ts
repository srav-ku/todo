import { type User, type InsertUser, type Project, type InsertProject, type Task, type InsertTask, type UpdateTask, type Event, type InsertEvent, type TaskWithProject } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;

  // Tasks
  getAllTasks(): Promise<TaskWithProject[]>;
  getTask(id: string): Promise<TaskWithProject | undefined>;
  getTasksByStatus(status: string): Promise<TaskWithProject[]>;
  getTasksByProject(projectId: string): Promise<TaskWithProject[]>;
  createTask(task: InsertTask): Promise<TaskWithProject>;
  updateTask(id: string, updates: UpdateTask): Promise<TaskWithProject | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Events
  getAllEvents(): Promise<Event[]>;
  getEventsByDate(date: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;
  private events: Map<string, Event>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.events = new Map();
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default user
    const defaultUser = await this.createUser({
      username: "mide",
      email: "manager@gmail.com",
      name: "Mide",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
    });

    // Create default projects
    const projects = [
      { name: "User Experience Design", color: "blue" },
      { name: "Design Systems", color: "green" },
      { name: "Icon Pack Update", color: "red" },
      { name: "Website Redesign", color: "green" }
    ];

    const createdProjects = [];
    for (const project of projects) {
      createdProjects.push(await this.createProject(project));
    }

    // Create default tasks
    const tasks = [
      {
        title: "User Research",
        description: "Gathering resourceful information from and for products and trying to deduce and look out for user problems needing solution.",
        status: "completed",
        projectId: createdProjects[0].id,
        taskNumber: "Task #1"
      },
      {
        title: "Conduct User Interviews",
        description: "Using the necessary information gathered to conduct user interviews with users to get or deduce the user problems.",
        status: "pending",
        projectId: createdProjects[0].id,
        taskNumber: "Task #2"
      },
      {
        title: "Drawing Wireframes",
        description: "Connecting information architecture to visual design, creating blueprints to establish structure and flow of possible design solutions.",
        status: "in-progress",
        projectId: createdProjects[0].id,
        taskNumber: "Task #3"
      },
      {
        title: "Information Architecture",
        description: "Using the necessary information gathered to conduct user interviews with users to get or deduce the user problems.",
        status: "pending",
        projectId: createdProjects[2].id,
        taskNumber: "Task #4"
      },
      {
        title: "Creating High Fidelity Design",
        description: "Using the necessary information gathered to conduct user interviews with users to get or deduce the user problems.",
        status: "pending",
        projectId: createdProjects[2].id,
        taskNumber: "Task #5"
      },
      {
        title: "Documenting Design Process",
        description: "Using the necessary information gathered to conduct user interviews with users to get or deduce the user problems.",
        status: "in-progress",
        projectId: createdProjects[0].id,
        taskNumber: "Task #6"
      }
    ];

    for (const task of tasks) {
      await this.createTask(task);
    }

    // Create default events
    const events = [
      {
        title: "Portfolio Review",
        description: "",
        scheduledTime: "15:00",
        date: "2025-01-21",
        icon: "fas fa-briefcase"
      },
      {
        title: "Meeting with friends",
        description: "",
        scheduledTime: "20:00",
        date: "2025-01-21",
        icon: "fas fa-users"
      },
      {
        title: "Druids Alpha Class",
        description: "",
        scheduledTime: "22:00",
        date: "2025-01-21",
        icon: "fas fa-graduation-cap"
      },
      {
        title: "Illustration Design",
        description: "",
        scheduledTime: "00:00",
        date: "2025-01-22",
        icon: "fas fa-paint-brush"
      }
    ];

    for (const event of events) {
      await this.createEvent(event);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  // Tasks
  async getAllTasks(): Promise<TaskWithProject[]> {
    return Promise.all(
      Array.from(this.tasks.values()).map(async (task) => ({
        ...task,
        project: task.projectId ? await this.getProject(task.projectId) : undefined
      }))
    );
  }

  async getTask(id: string): Promise<TaskWithProject | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    return {
      ...task,
      project: task.projectId ? await this.getProject(task.projectId) : undefined
    };
  }

  async getTasksByStatus(status: string): Promise<TaskWithProject[]> {
    const allTasks = await this.getAllTasks();
    return allTasks.filter(task => task.status === status);
  }

  async getTasksByProject(projectId: string): Promise<TaskWithProject[]> {
    const allTasks = await this.getAllTasks();
    return allTasks.filter(task => task.projectId === projectId);
  }

  async createTask(insertTask: InsertTask): Promise<TaskWithProject> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tasks.set(id, task);
    
    return {
      ...task,
      project: task.projectId ? await this.getProject(task.projectId) : undefined
    };
  }

  async updateTask(id: string, updates: UpdateTask): Promise<TaskWithProject | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;

    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      updatedAt: new Date()
    };
    this.tasks.set(id, updatedTask);

    return {
      ...updatedTask,
      project: updatedTask.projectId ? await this.getProject(updatedTask.projectId) : undefined
    };
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEventsByDate(date: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.date === date);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = {
      ...insertEvent,
      id,
      createdAt: new Date()
    };
    this.events.set(id, event);
    return event;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }
}

export const storage = new MemStorage();
