const z = require('zod');

const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Task title is required' })
      .min(1, 'Task title is required')
      .max(200, 'Title cannot exceed 200 characters'),
    workspace: z.string().optional().nullable(),
    workspaceName: z.string().optional().nullable(),
    project: z.string().optional().nullable(),
    projectName: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(['todo', 'inProgress', 'inReview', 'done']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    assignee: z.string().optional().nullable(),
    assigneeName: z.string().optional().nullable(),
    assigneeInitials: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateTaskSchema = z.object({
  body: createTaskSchema.shape.body.partial(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};
