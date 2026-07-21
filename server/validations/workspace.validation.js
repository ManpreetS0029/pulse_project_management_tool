const z = require('zod');

const createWorkspaceSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Workspace name is required' })
      .trim()
      .min(2, 'Workspace name must be at least 2 characters')
      .max(100, 'Workspace name cannot exceed 100 characters'),

    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
  }),
});

const updateWorkspaceSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, 'Workspace name must be at least 2 characters')
        .max(100, 'Workspace name cannot exceed 100 characters')
        .optional(),

      description: z
        .string()
        .trim()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    })
    .refine(
      (data) => data.name !== undefined || data.description !== undefined,
      {
        message: 'At least one field must be provided',
      },
    ),
});

module.exports = {
  createWorkspaceSchema,
  updateWorkspaceSchema,
};
