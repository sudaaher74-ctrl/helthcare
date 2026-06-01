import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/tasks
export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, category, priority } = req.query;
    const where: any = { userId: req.user!.id };
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: { timeLogs: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    // Group by status for Kanban
    const kanban = {
      BACKLOG: tasks.filter((t) => t.status === 'BACKLOG'),
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
      REVIEW: tasks.filter((t) => t.status === 'REVIEW'),
      DONE: tasks.filter((t) => t.status === 'DONE'),
    };

    res.json({ success: true, data: { tasks, kanban } });
  } catch (e) { next(e); }
};

// POST /api/tasks
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, priority, status, dueDate, estimatedMinutes, tags } = req.body;
    const task = await prisma.task.create({
      data: {
        userId: req.user!.id,
        title,
        description,
        category: category || 'PERSONAL',
        priority: priority || 'MEDIUM',
        status: status || 'BACKLOG',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        estimatedMinutes,
        tags: tags || [],
      },
    });
    res.status(201).json({ success: true, data: task });
  } catch (e) { next(e); }
};

// PUT /api/tasks/:id
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body };
    if (data.status === 'DONE' && !data.completedAt) data.completedAt = new Date();
    if (data.status === 'IN_PROGRESS' && !data.startedAt) data.startedAt = new Date();
    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const task = await prisma.task.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data,
    });
    res.json({ success: true, data: task });
  } catch (e) { next(e); }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.task.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ success: true, message: 'Task deleted' });
  } catch (e) { next(e); }
};

// POST /api/tasks/:id/time-log
export const logTaskTime = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startTime, endTime, notes } = req.body;
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    const durationMinutes = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;

    const log = await prisma.timeLog.create({
      data: { taskId: req.params.id, userId: req.user!.id, startTime: start, endTime: end || undefined, durationMinutes: durationMinutes || undefined, notes },
    });
    res.status(201).json({ success: true, data: log });
  } catch (e) { next(e); }
};
