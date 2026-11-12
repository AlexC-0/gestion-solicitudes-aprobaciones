import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Recurso no encontrado.' },
  });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  if (error instanceof URIError) {
    response.status(400).json({
      error: { code: 'INVALID_REQUEST', message: 'Petición no válida.' },
    });
    return;
  }
  response.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'No se pudo completar la petición.' },
  });
};
