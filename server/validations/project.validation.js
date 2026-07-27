const z = require('zod');

const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional().nullable(),
    status: z.string().optional(),
    priority: z.string().optional(),
    dueDate: z.any().optional(),
    workspace: z.any().optional(),
  }),
});

module.exports = {
  createProjectSchema,
};
