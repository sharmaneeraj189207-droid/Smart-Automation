import { errorResponse } from '../utils/apiResponse.js';

export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const validatedData = await schema.parseAsync(dataToValidate);
      req[source] = validatedData;
      next();
    } catch (err) {
      if (err.errors) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return errorResponse(res, 'Validation failed', errors, 400);
      }
      return errorResponse(res, 'Invalid request data', [err.message], 400);
    }
  };
};
