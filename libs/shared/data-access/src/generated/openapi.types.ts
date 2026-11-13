// =============================================================================
// openapi.types.ts — Tipos generados automáticamente desde openapi.v1.json
// Generado mediante: npm run api:types (tools/generate-api-types.mjs)
// NO EDITAR MANUALMENTE. Sincronizar con el contrato backend mediante npm run api:types.
// =============================================================================

export interface paths {
  '/api/v1/ai-governance/pending': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          Status?: components['schemas']['AgentActionStatus'];
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfAgentActionRecordDto'];
            'text/json': components['schemas']['PagedResultOfAgentActionRecordDto'];
            'text/plain': components['schemas']['PagedResultOfAgentActionRecordDto'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/ai-governance/propose': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ProposeAgentActionRequest'];
          'application/json': components['schemas']['ProposeAgentActionRequest'];
          'text/json': components['schemas']['ProposeAgentActionRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['AgentActionRecordDto'];
            'text/json': components['schemas']['AgentActionRecordDto'];
            'text/plain': components['schemas']['AgentActionRecordDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/ai-governance/{id}/review': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ReviewAgentActionRequest'];
          'application/json': components['schemas']['ReviewAgentActionRequest'];
          'text/json': components['schemas']['ReviewAgentActionRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['AgentActionRecordDto'];
            'text/json': components['schemas']['AgentActionRecordDto'];
            'text/plain': components['schemas']['AgentActionRecordDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/auth/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['LoginRequest'];
          'application/json': components['schemas']['LoginRequest'];
          'text/json': components['schemas']['LoginRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['LoginResponse'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/auth/ping': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': string;
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/branches': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          isActive?: boolean;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['BranchDto'][];
            'text/json': components['schemas']['BranchDto'][];
            'text/plain': components['schemas']['BranchDto'][];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateBranchRequest'];
          'application/json': components['schemas']['CreateBranchRequest'];
          'text/json': components['schemas']['CreateBranchRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['BranchDto'];
            'text/json': components['schemas']['BranchDto'];
            'text/plain': components['schemas']['BranchDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/branches/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['BranchDto'];
            'text/json': components['schemas']['BranchDto'];
            'text/plain': components['schemas']['BranchDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['UpdateBranchRequest'];
          'application/json': components['schemas']['UpdateBranchRequest'];
          'text/json': components['schemas']['UpdateBranchRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['BranchDto'];
            'text/json': components['schemas']['BranchDto'];
            'text/plain': components['schemas']['BranchDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/branches/{id}/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ChangeStatusRequest'];
          'application/json': components['schemas']['ChangeStatusRequest'];
          'text/json': components['schemas']['ChangeStatusRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': boolean;
            'text/json': boolean;
            'text/plain': boolean;
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/cash-registers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CashRegisterDto'][];
            'text/json': components['schemas']['CashRegisterDto'][];
            'text/plain': components['schemas']['CashRegisterDto'][];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateCashRegisterRequest'];
          'application/json': components['schemas']['CreateCashRegisterRequest'];
          'text/json': components['schemas']['CreateCashRegisterRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CashRegisterDto'];
            'text/json': components['schemas']['CashRegisterDto'];
            'text/plain': components['schemas']['CashRegisterDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/cash-registers/sessions/{sessionId}/close': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          sessionId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CloseCashRegisterSessionRequest'];
          'application/json': components['schemas']['CloseCashRegisterSessionRequest'];
          'text/json': components['schemas']['CloseCashRegisterSessionRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CashRegisterSessionDto'];
            'text/json': components['schemas']['CashRegisterSessionDto'];
            'text/plain': components['schemas']['CashRegisterSessionDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/cash-registers/{registerId}/active-session': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          registerId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CashRegisterSessionDto'];
            'text/json': components['schemas']['CashRegisterSessionDto'];
            'text/plain': components['schemas']['CashRegisterSessionDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/cash-registers/{registerId}/sessions/open': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          registerId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['OpenCashRegisterSessionRequest'];
          'application/json': components['schemas']['OpenCashRegisterSessionRequest'];
          'text/json': components['schemas']['OpenCashRegisterSessionRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CashRegisterSessionDto'];
            'text/json': components['schemas']['CashRegisterSessionDto'];
            'text/plain': components['schemas']['CashRegisterSessionDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/categories': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          SearchTerm?: string;
          IsActive?: boolean;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfCategoryDto'];
            'text/json': components['schemas']['PagedResultOfCategoryDto'];
            'text/plain': components['schemas']['PagedResultOfCategoryDto'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateCategoryRequest'];
          'application/json': components['schemas']['CreateCategoryRequest'];
          'text/json': components['schemas']['CreateCategoryRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CategoryDto'];
            'text/json': components['schemas']['CategoryDto'];
            'text/plain': components['schemas']['CategoryDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/categories/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CategoryDto'];
            'text/json': components['schemas']['CategoryDto'];
            'text/plain': components['schemas']['CategoryDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['UpdateCategoryRequest'];
          'application/json': components['schemas']['UpdateCategoryRequest'];
          'text/json': components['schemas']['UpdateCategoryRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CategoryDto'];
            'text/json': components['schemas']['CategoryDto'];
            'text/plain': components['schemas']['CategoryDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/categories/{id}/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ChangeStatusRequest'];
          'application/json': components['schemas']['ChangeStatusRequest'];
          'text/json': components['schemas']['ChangeStatusRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': boolean;
            'text/json': boolean;
            'text/plain': boolean;
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/customers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          SearchTerm?: string;
          IsActive?: boolean;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfCustomerDto'];
            'text/json': components['schemas']['PagedResultOfCustomerDto'];
            'text/plain': components['schemas']['PagedResultOfCustomerDto'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateCustomerRequest'];
          'application/json': components['schemas']['CreateCustomerRequest'];
          'text/json': components['schemas']['CreateCustomerRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CustomerDto'];
            'text/json': components['schemas']['CustomerDto'];
            'text/plain': components['schemas']['CustomerDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/customers/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CustomerDto'];
            'text/json': components['schemas']['CustomerDto'];
            'text/plain': components['schemas']['CustomerDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['UpdateCustomerRequest'];
          'application/json': components['schemas']['UpdateCustomerRequest'];
          'text/json': components['schemas']['UpdateCustomerRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CustomerDto'];
            'text/json': components['schemas']['CustomerDto'];
            'text/plain': components['schemas']['CustomerDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/customers/{id}/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ChangeStatusRequest'];
          'application/json': components['schemas']['ChangeStatusRequest'];
          'text/json': components['schemas']['ChangeStatusRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': boolean;
            'text/json': boolean;
            'text/plain': boolean;
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/demand-forecast/{productId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          daysAhead?: number | string;
        };
        header?: never;
        path: {
          productId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['DemandForecastDto'];
            'text/json': components['schemas']['DemandForecastDto'];
            'text/plain': components['schemas']['DemandForecastDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/inventory/movements': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['RecordInventoryMovementRequest'];
          'application/json': components['schemas']['RecordInventoryMovementRequest'];
          'text/json': components['schemas']['RecordInventoryMovementRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['InventoryMovementDto'];
            'text/json': components['schemas']['InventoryMovementDto'];
            'text/plain': components['schemas']['InventoryMovementDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/inventory/products/{productId}/movements': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          ProductId?: string;
          WarehouseId?: string;
          StartDate?: string;
          EndDate?: string;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path: {
          productId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfInventoryMovementDto'];
            'text/json': components['schemas']['PagedResultOfInventoryMovementDto'];
            'text/plain': components['schemas']['PagedResultOfInventoryMovementDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/inventory/products/{productId}/stock': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          productId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProductStockDto'];
            'text/json': components['schemas']['ProductStockDto'];
            'text/plain': components['schemas']['ProductStockDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/invoices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['IssueInvoiceRequest'];
          'application/json': components['schemas']['IssueInvoiceRequest'];
          'text/json': components['schemas']['IssueInvoiceRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['InvoiceDto'];
            'text/json': components['schemas']['InvoiceDto'];
            'text/plain': components['schemas']['InvoiceDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/invoices/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['InvoiceDto'];
            'text/json': components['schemas']['InvoiceDto'];
            'text/plain': components['schemas']['InvoiceDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/invoices/{id}/reconcile': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['InvoiceDto'];
            'text/json': components['schemas']['InvoiceDto'];
            'text/plain': components['schemas']['InvoiceDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/notifications': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateSystemNotificationRequest'];
          'application/json': components['schemas']['CreateSystemNotificationRequest'];
          'text/json': components['schemas']['CreateSystemNotificationRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SystemNotificationDto'];
            'text/json': components['schemas']['SystemNotificationDto'];
            'text/plain': components['schemas']['SystemNotificationDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/notifications/user/{userId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          UnreadOnly?: boolean;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path: {
          userId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfSystemNotificationDto'];
            'text/json': components['schemas']['PagedResultOfSystemNotificationDto'];
            'text/plain': components['schemas']['PagedResultOfSystemNotificationDto'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/notifications/{id}/read': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SystemNotificationDto'];
            'text/json': components['schemas']['SystemNotificationDto'];
            'text/plain': components['schemas']['SystemNotificationDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/payments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ProcessPaymentRequest'];
          'application/json': components['schemas']['ProcessPaymentRequest'];
          'text/json': components['schemas']['ProcessPaymentRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PaymentDto'];
            'text/json': components['schemas']['PaymentDto'];
            'text/plain': components['schemas']['PaymentDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/payments/sale/{saleId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          saleId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PaymentDto'][];
            'text/json': components['schemas']['PaymentDto'][];
            'text/plain': components['schemas']['PaymentDto'][];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/platform/outbox/dead-letter': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfDeadLetterMessageResponse'];
            'text/json': components['schemas']['PagedResultOfDeadLetterMessageResponse'];
            'text/plain': components['schemas']['PagedResultOfDeadLetterMessageResponse'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/platform/outbox/dead-letter/reprocess': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ReprocessDeadLetterMessagesRequest'];
          'application/json': components['schemas']['ReprocessDeadLetterMessagesRequest'];
          'text/json': components['schemas']['ReprocessDeadLetterMessagesRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ReprocessDeadLetterMessagesResponse'];
            'text/json': components['schemas']['ReprocessDeadLetterMessagesResponse'];
            'text/plain': components['schemas']['ReprocessDeadLetterMessagesResponse'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/platform/tenants': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          SearchTerm?: string;
          Status?: string;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfTenantDto'];
            'text/json': components['schemas']['PagedResultOfTenantDto'];
            'text/plain': components['schemas']['PagedResultOfTenantDto'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateTenantRequest'];
          'application/json': components['schemas']['CreateTenantRequest'];
          'text/json': components['schemas']['CreateTenantRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': string;
            'text/json': string;
            'text/plain': string;
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/pos-devices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['RegisterPosDeviceRequest'];
          'application/json': components['schemas']['RegisterPosDeviceRequest'];
          'text/json': components['schemas']['RegisterPosDeviceRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PosDeviceDto'];
            'text/json': components['schemas']['PosDeviceDto'];
            'text/plain': components['schemas']['PosDeviceDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/pos-devices/branch/{branchId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          branchId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PosDeviceDto'][];
            'text/json': components['schemas']['PosDeviceDto'][];
            'text/plain': components['schemas']['PosDeviceDto'][];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/pos-devices/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PosDeviceDto'];
            'text/json': components['schemas']['PosDeviceDto'];
            'text/plain': components['schemas']['PosDeviceDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/pos-devices/{id}/ping': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PosDeviceDto'];
            'text/json': components['schemas']['PosDeviceDto'];
            'text/plain': components['schemas']['PosDeviceDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/products': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          SearchTerm?: string;
          CategoryId?: string;
          IsActive?: boolean;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfProductDto'];
            'text/json': components['schemas']['PagedResultOfProductDto'];
            'text/plain': components['schemas']['PagedResultOfProductDto'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateProductRequest'];
          'application/json': components['schemas']['CreateProductRequest'];
          'text/json': components['schemas']['CreateProductRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProductDto'];
            'text/json': components['schemas']['ProductDto'];
            'text/plain': components['schemas']['ProductDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/products/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProductDto'];
            'text/json': components['schemas']['ProductDto'];
            'text/plain': components['schemas']['ProductDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['UpdateProductRequest'];
          'application/json': components['schemas']['UpdateProductRequest'];
          'text/json': components['schemas']['UpdateProductRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProductDto'];
            'text/json': components['schemas']['ProductDto'];
            'text/plain': components['schemas']['ProductDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/products/{id}/price': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['UpdateProductPriceRequest'];
          'application/json': components['schemas']['UpdateProductPriceRequest'];
          'text/json': components['schemas']['UpdateProductPriceRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProductDto'];
            'text/json': components['schemas']['ProductDto'];
            'text/plain': components['schemas']['ProductDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/products/{id}/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ChangeStatusRequest'];
          'application/json': components['schemas']['ChangeStatusRequest'];
          'text/json': components['schemas']['ChangeStatusRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': boolean;
            'text/json': boolean;
            'text/plain': boolean;
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/purchase-orders': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          SupplierId?: string;
          WarehouseId?: string;
          Status?: components['schemas']['PurchaseOrderStatus'];
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfPurchaseOrderDto'];
            'text/json': components['schemas']['PagedResultOfPurchaseOrderDto'];
            'text/plain': components['schemas']['PagedResultOfPurchaseOrderDto'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreatePurchaseOrderRequest'];
          'application/json': components['schemas']['CreatePurchaseOrderRequest'];
          'text/json': components['schemas']['CreatePurchaseOrderRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PurchaseOrderDto'];
            'text/json': components['schemas']['PurchaseOrderDto'];
            'text/plain': components['schemas']['PurchaseOrderDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/purchase-orders/{id}/receive': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ReceivePurchaseOrderRequest'];
          'application/json': components['schemas']['ReceivePurchaseOrderRequest'];
          'text/json': components['schemas']['ReceivePurchaseOrderRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PurchaseOrderDto'];
            'text/json': components['schemas']['PurchaseOrderDto'];
            'text/plain': components['schemas']['PurchaseOrderDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/purchase-orders/{id}/send': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PurchaseOrderDto'];
            'text/json': components['schemas']['PurchaseOrderDto'];
            'text/plain': components['schemas']['PurchaseOrderDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/roles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['RoleDto'][];
            'text/json': components['schemas']['RoleDto'][];
            'text/plain': components['schemas']['RoleDto'][];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateRoleRequest'];
          'application/json': components['schemas']['CreateRoleRequest'];
          'text/json': components['schemas']['CreateRoleRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['RoleDto'];
            'text/json': components['schemas']['RoleDto'];
            'text/plain': components['schemas']['RoleDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/sales': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          CustomerId?: string;
          Status?: components['schemas']['SaleStatus'];
          StartDate?: string;
          EndDate?: string;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfSaleDto'];
            'text/json': components['schemas']['PagedResultOfSaleDto'];
            'text/plain': components['schemas']['PagedResultOfSaleDto'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateSaleRequest'];
          'application/json': components['schemas']['CreateSaleRequest'];
          'text/json': components['schemas']['CreateSaleRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SaleDto'];
            'text/json': components['schemas']['SaleDto'];
            'text/plain': components['schemas']['SaleDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/sales/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SaleDto'];
            'text/json': components['schemas']['SaleDto'];
            'text/plain': components['schemas']['SaleDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/stock-adjustments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateStockAdjustmentRequest'];
          'application/json': components['schemas']['CreateStockAdjustmentRequest'];
          'text/json': components['schemas']['CreateStockAdjustmentRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['StockAdjustmentDto'];
            'text/json': components['schemas']['StockAdjustmentDto'];
            'text/plain': components['schemas']['StockAdjustmentDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/stock-transfers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          SourceWarehouseId?: string;
          DestinationWarehouseId?: string;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfStockTransferDto'];
            'text/json': components['schemas']['PagedResultOfStockTransferDto'];
            'text/plain': components['schemas']['PagedResultOfStockTransferDto'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateStockTransferRequest'];
          'application/json': components['schemas']['CreateStockTransferRequest'];
          'text/json': components['schemas']['CreateStockTransferRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['StockTransferDto'];
            'text/json': components['schemas']['StockTransferDto'];
            'text/plain': components['schemas']['StockTransferDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/suppliers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          SearchTerm?: string;
          IsActive?: boolean;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfSupplierDto'];
            'text/json': components['schemas']['PagedResultOfSupplierDto'];
            'text/plain': components['schemas']['PagedResultOfSupplierDto'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateSupplierRequest'];
          'application/json': components['schemas']['CreateSupplierRequest'];
          'text/json': components['schemas']['CreateSupplierRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SupplierDto'];
            'text/json': components['schemas']['SupplierDto'];
            'text/plain': components['schemas']['SupplierDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/suppliers/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SupplierDto'];
            'text/json': components['schemas']['SupplierDto'];
            'text/plain': components['schemas']['SupplierDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['UpdateSupplierRequest'];
          'application/json': components['schemas']['UpdateSupplierRequest'];
          'text/json': components['schemas']['UpdateSupplierRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SupplierDto'];
            'text/json': components['schemas']['SupplierDto'];
            'text/plain': components['schemas']['SupplierDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/suppliers/{id}/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ChangeStatusRequest'];
          'application/json': components['schemas']['ChangeStatusRequest'];
          'text/json': components['schemas']['ChangeStatusRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': boolean;
            'text/json': boolean;
            'text/plain': boolean;
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          SearchTerm?: string;
          IsActive?: boolean;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfUserDto'];
            'text/json': components['schemas']['PagedResultOfUserDto'];
            'text/plain': components['schemas']['PagedResultOfUserDto'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateUserRequest'];
          'application/json': components['schemas']['CreateUserRequest'];
          'text/json': components['schemas']['CreateUserRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['UserDto'];
            'text/json': components['schemas']['UserDto'];
            'text/plain': components['schemas']['UserDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/users/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['UserDto'];
            'text/json': components['schemas']['UserDto'];
            'text/plain': components['schemas']['UserDto'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['UpdateUserRequest'];
          'application/json': components['schemas']['UpdateUserRequest'];
          'text/json': components['schemas']['UpdateUserRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['UserDto'];
            'text/json': components['schemas']['UserDto'];
            'text/plain': components['schemas']['UserDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/users/{id}/role': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['UpdateUserRoleRequest'];
          'application/json': components['schemas']['UpdateUserRoleRequest'];
          'text/json': components['schemas']['UpdateUserRoleRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['UserDto'];
            'text/json': components['schemas']['UserDto'];
            'text/plain': components['schemas']['UserDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/users/{id}/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['ChangeStatusRequest'];
          'application/json': components['schemas']['ChangeStatusRequest'];
          'text/json': components['schemas']['ChangeStatusRequest'];
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': boolean;
            'text/json': boolean;
            'text/plain': boolean;
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
            'text/json': components['schemas']['ProblemDetails'];
            'text/plain': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    trace?: never;
  };
  '/api/v1/warehouses': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['WarehouseDto'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/*+json': components['schemas']['CreateWarehouseRequest'];
          'application/json': components['schemas']['CreateWarehouseRequest'];
          'text/json': components['schemas']['CreateWarehouseRequest'];
        };
      };
      responses: {
        /** @description Created */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['WarehouseDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Conflict */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/warehouses/{warehouseId}/movements': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          WarehouseId?: string;
          ProductId?: string;
          MovementType?: components['schemas']['InventoryMovementType'];
          StartDate?: string;
          EndDate?: string;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path: {
          warehouseId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfInventoryMovementDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/warehouses/{warehouseId}/stock': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          WarehouseId?: string;
          SearchTerm?: string;
          PageNumber?: number | string;
          PageSize?: number | string;
        };
        header?: never;
        path: {
          warehouseId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PagedResultOfStockLevelDto'];
          };
        };
        /** @description Bad Request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
        /** @description Not Found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ProblemDetails'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    AgentActionRecordDto: {
      agentId: string;
      /** Format: date-time */
      createdAtUtc: string;
      /** Format: uuid */
      id: string;
      payloadJson: string;
      proposedActionType: string;
      /** Format: date-time */
      reviewedAtUtc: null | string;
      /** Format: uuid */
      reviewedByUserId: null | string;
      riskLevelName: string;
      statusName: string;
    };
    /** @enum {unknown} */
    AgentActionStatus: 'PendingApproval' | 'Approved' | 'Rejected' | 'Executed' | null;
    BranchDto: {
      city: string;
      country: string;
      /** Format: date-time */
      createdAtUtc: string;
      /** Format: uuid */
      id: string;
      isActive: boolean;
      name: string;
      phoneNumber: string;
      street: string;
      /** Format: date-time */
      updatedAtUtc: null | string;
      zipCode: string;
    };
    CashRegisterDto: {
      /** Format: date-time */
      createdAtUtc: string;
      /** Format: uuid */
      currentSessionId: null | string;
      /** Format: uuid */
      id: string;
      isActive: boolean;
      name: string;
      serialNumber: string;
      /** Format: date-time */
      updatedAtUtc: null | string;
    };
    CashRegisterSessionDto: {
      /** Format: double */
      actualFinalAmount: null | number | string;
      /** Format: uuid */
      cashRegisterId: string;
      /** Format: date-time */
      closedAtUtc: null | string;
      currency: string;
      /** Format: double */
      expectedFinalAmount: null | number | string;
      /** Format: uuid */
      id: string;
      /** Format: double */
      initialAmount: number | string;
      notes: null | string;
      /** Format: date-time */
      openedAtUtc: string;
      statusName: string;
      /** Format: uuid */
      userId: string;
    };
    CategoryDto: {
      /** Format: date-time */
      createdAtUtc: string;
      description: null | string;
      /** Format: uuid */
      id: string;
      isActive: boolean;
      name: string;
      /** Format: date-time */
      updatedAtUtc: null | string;
    };
    ChangeStatusRequest: {
      isActive: boolean;
    };
    CloseCashRegisterSessionRequest: {
      /** Format: double */
      actualFinalAmount: number | string;
      /** @default USD */
      currency: string;
      /** Format: double */
      expectedFinalAmount: number | string;
      notes?: null | string;
    };
    CreateBranchRequest: {
      city: string;
      country: string;
      name: string;
      phoneNumber: string;
      street: string;
      zipCode: string;
    };
    CreateCashRegisterRequest: {
      /** Format: uuid */
      branchId: string;
      name: string;
      /** @default  */
      serialNumber: string;
    };
    CreateCategoryRequest: {
      description: null | string;
      name: string;
    };
    CreateCustomerRequest: {
      city?: null | string;
      country?: null | string;
      /** @default  */
      email: string;
      fullName: string;
      /** @default  */
      phone: string;
      street?: null | string;
      taxCountryCode: string;
      taxId: string;
      zipCode?: null | string;
    };
    CreateProductRequest: {
      barcode?: null | string;
      /** Format: uuid */
      categoryId: string;
      /** Format: double */
      costAmount?: null | number | string;
      currency: string;
      description?: null | string;
      /**
       * Format: int32
       * @default 0
       */
      initialStock: number | string;
      name: string;
      /** Format: double */
      priceAmount: number | string;
      sku: string;
    };
    CreatePurchaseOrderItemRequest: {
      /** @default USD */
      currency: string;
      /** Format: uuid */
      productId: string;
      /** Format: double */
      quantity: number | string;
      /** Format: double */
      unitCostAmount: number | string;
    };
    CreatePurchaseOrderRequest: {
      items: components['schemas']['CreatePurchaseOrderItemRequest'][];
      notes?: null | string;
      orderNumber: string;
      /** Format: uuid */
      supplierId: string;
      /** Format: uuid */
      warehouseId: string;
    };
    CreateRoleRequest: {
      description?: null | string;
      name: string;
      permissions?: null | string[];
    };
    CreateSaleItemRequest: {
      /** Format: uuid */
      productId: string;
      productName: string;
      /** Format: double */
      quantity: number | string;
      /** Format: double */
      unitPriceAmount: number | string;
    };
    CreateSaleRequest: {
      /** @default USD */
      currency: string;
      /** Format: uuid */
      customerId: null | string;
      items: components['schemas']['CreateSaleItemRequest'][];
      receiptNumber: string;
      /** Format: uuid */
      sessionId: string;
      /**
       * Format: double
       * @default 0
       */
      taxRatePercentage: number | string;
    };
    CreateStockAdjustmentItemRequest: {
      /** Format: uuid */
      productId: string;
      /** Format: double */
      quantity: number | string;
    };
    CreateStockAdjustmentRequest: {
      items: components['schemas']['CreateStockAdjustmentItemRequest'][];
      notes?: null | string;
      reason: components['schemas']['StockAdjustmentReason'];
      /** Format: uuid */
      warehouseId: string;
    };
    CreateStockTransferItemRequest: {
      /** Format: uuid */
      productId: string;
      /** Format: double */
      quantity: number | string;
    };
    CreateStockTransferRequest: {
      /** Format: uuid */
      destinationWarehouseId: string;
      items: components['schemas']['CreateStockTransferItemRequest'][];
      notes?: null | string;
      /** Format: uuid */
      sourceWarehouseId: string;
    };
    CreateSupplierRequest: {
      city: string;
      contactName: string;
      country: string;
      email: string;
      name: string;
      phone: string;
      street: string;
      taxCountryCode: string;
      taxIdValue: string;
      zipCode: string;
    };
    CreateSystemNotificationRequest: {
      message: string;
      title: string;
      /** Format: uuid */
      userId: string;
    };
    CreateTenantRequest: {
      adminEmail: string;
      adminPassword: string;
      documentNumber: string;
      name: string;
    };
    CreateUserRequest: {
      email: string;
      firstName: string;
      lastName: string;
      password: string;
      /** Format: uuid */
      roleId: string;
      /** Format: uuid */
      tenantId?: null | string;
    };
    CreateWarehouseRequest: {
      /** Format: uuid */
      branchId: string;
      description: null | string;
      isDefault: boolean;
      name: string;
    };
    CustomerDto: {
      city: null | string;
      country: null | string;
      /** Format: date-time */
      createdAtUtc: string;
      email: string;
      fullName: string;
      /** Format: uuid */
      id: string;
      isActive: boolean;
      phone: string;
      street: null | string;
      taxCountryCode: string;
      taxId: string;
      /** Format: date-time */
      updatedAtUtc: null | string;
      zipCode: null | string;
    };
    DeadLetterMessageResponse: {
      content: string;
      error: null | string;
      /** Format: uuid */
      id: string;
      /** Format: date-time */
      occurredOnUtc: string;
      /** Format: int32 */
      retryCount: number | string;
      /** Format: uuid */
      tenantId: null | string;
      type: string;
    };
    DemandForecastDto: {
      /** Format: date-time */
      calculatedAtUtc: string;
      /** Format: int32 */
      daysAhead: number | string;
      /** Format: int32 */
      predictedRequiredQuantity: number | string;
      /** Format: uuid */
      productId: string;
    };
    InventoryMovementDto: {
      /** Format: date-time */
      createdAtUtc: string;
      /** Format: uuid */
      id: string;
      movementType: components['schemas']['InventoryMovementType'];
      movementTypeName: string;
      notes: null | string;
      /** Format: uuid */
      productId: string;
      /** Format: double */
      quantity: number | string;
      /** Format: uuid */
      referenceId: null | string;
    };
    /** @enum {unknown} */
    InventoryMovementType:
      | 'Purchase'
      | 'Sale'
      | 'Adjustment'
      | 'ReturnFromCustomer'
      | 'ReturnToSupplier'
      | 'TransferOut'
      | 'TransferIn';
    /** @enum {unknown} */
    InvoiceDocumentType: 'Invoice' | 'Receipt';
    InvoiceDto: {
      currency: string;
      customerTaxCountryCode: string;
      customerTaxId: string;
      documentNumber: string;
      documentTypeName: string;
      /** Format: uuid */
      id: string;
      /** Format: date-time */
      issueDateUtc: string;
      /** Format: date-time */
      manualInterventionAtUtc?: null | string;
      manualInterventionReason?: null | string;
      /** Format: uuid */
      saleId: string;
      statusName: string;
      /** Format: double */
      totalAmount: number | string;
    };
    IssueInvoiceRequest: {
      customerTaxCountryCode: string;
      customerTaxIdValue: string;
      documentType: components['schemas']['InvoiceDocumentType'];
      /** Format: uuid */
      saleId: string;
    };
    LoginRequest: {
      email: string;
      password: string;
    };
    LoginResponse: {
      email: string;
      /** Format: date-time */
      expiresAtUtc: string;
      fullName: string;
      role: string;
      /** Format: uuid */
      roleId: string;
      /** Format: uuid */
      tenantId: null | string;
      token: string;
      /** Format: uuid */
      userId: string;
    };
    OpenCashRegisterSessionRequest: {
      /** @default USD */
      currency: string;
      /** Format: double */
      initialAmount: number | string;
      notes?: null | string;
      /** Format: uuid */
      userId: string;
    };
    PagedResultOfAgentActionRecordDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['AgentActionRecordDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfCategoryDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['CategoryDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfCustomerDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['CustomerDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfDeadLetterMessageResponse: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['DeadLetterMessageResponse'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfInventoryMovementDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['InventoryMovementDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfProductDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['ProductDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfPurchaseOrderDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['PurchaseOrderDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfSaleDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['SaleDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfStockLevelDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['StockLevelDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfStockTransferDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['StockTransferDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfSupplierDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['SupplierDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfSystemNotificationDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['SystemNotificationDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfTenantDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['TenantDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PagedResultOfUserDto: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      items: components['schemas']['UserDto'][];
      /** Format: int32 */
      pageNumber: number | string;
      /** Format: int32 */
      pageSize: number | string;
      /** Format: int32 */
      totalCount: number | string;
      /** Format: int32 */
      totalPages?: number | string;
    };
    PaymentDto: {
      /** Format: double */
      amount: number | string;
      /** Format: date-time */
      createdAtUtc: string;
      currency: string;
      externalReference: null | string;
      /** Format: uuid */
      id: string;
      methodName: string;
      /** Format: uuid */
      saleId: string;
      statusName: string;
    };
    /** @enum {unknown} */
    PaymentMethod: 'Cash' | 'CreditCard' | 'DebitCard' | 'Transfer';
    PosDeviceDto: {
      /** Format: uuid */
      branchId: string;
      /** Format: date-time */
      createdAtUtc: string;
      /** Format: uuid */
      id: string;
      isActive: boolean;
      /** Format: date-time */
      lastPingUtc: null | string;
      name: string;
      serialNumber: string;
      /** Format: date-time */
      updatedAtUtc: null | string;
    };
    ProblemDetails: {
      /** @description Código de error de dominio RFC 9457 (ADR 0023). */
      code?: null | string;
      detail?: null | string;
      instance?: null | string;
      /** Format: int32 */
      status?: null | number | string;
      title?: null | string;
      type?: null | string;
    };
    ProcessPaymentRequest: {
      /** Format: double */
      amount: number | string;
      /** @default USD */
      currency: string;
      externalReference?: null | string;
      method: components['schemas']['PaymentMethod'];
      /** Format: uuid */
      saleId: string;
    };
    ProductDto: {
      barcode: null | string;
      /** Format: uuid */
      categoryId: string;
      /** Format: double */
      costAmount: null | number | string;
      /** Format: date-time */
      createdAtUtc: string;
      currency: string;
      description: null | string;
      /** Format: uuid */
      id: string;
      isActive: boolean;
      name: string;
      /** Format: double */
      priceAmount: number | string;
      sku: string;
      /** Format: int32 */
      stockQuantity: number | string;
      /** Format: date-time */
      updatedAtUtc: null | string;
    };
    ProductStockDto: {
      /** Format: double */
      currentStockCalculated: number | string;
      /** Format: uuid */
      productId: string;
      productName: string;
      sku: string;
    };
    ProposeAgentActionRequest: {
      agentId: string;
      payloadJson: string;
      proposedActionType: string;
      riskLevel: components['schemas']['RiskLevel'];
    };
    PurchaseOrderDto: {
      /** Format: date-time */
      createdAtUtc: string;
      currency: string;
      /** Format: uuid */
      id: string;
      lines: components['schemas']['PurchaseOrderLineDto'][];
      notes: null | string;
      orderNumber: string;
      status: components['schemas']['PurchaseOrderStatus'];
      statusName: string;
      /** Format: uuid */
      supplierId: string;
      /** Format: double */
      totalOrderedCostAmount: number | string;
      /** Format: date-time */
      updatedAtUtc: null | string;
      /** Format: uuid */
      warehouseId: string;
    };
    PurchaseOrderLineDto: {
      currency: string;
      /** Format: uuid */
      id: string;
      isFullyReceived: boolean;
      /** Format: uuid */
      productId: string;
      /** Format: double */
      quantityOrdered: number | string;
      /** Format: double */
      quantityPending: number | string;
      /** Format: double */
      quantityReceived: number | string;
      /** Format: double */
      unitCostAmount: number | string;
    };
    /** @enum {unknown} */
    PurchaseOrderStatus: 'Draft' | 'Sent' | 'PartiallyReceived' | 'Received' | 'Cancelled';
    ReceivePurchaseOrderItemRequest: {
      batchNumber?: null | string;
      /** Format: date-time */
      expirationDate?: null | string;
      /** Format: uuid */
      productId: string;
      /** Format: double */
      receivedQuantity: number | string;
    };
    ReceivePurchaseOrderRequest: {
      lines: components['schemas']['ReceivePurchaseOrderItemRequest'][];
    };
    RecordInventoryMovementRequest: {
      movementType: components['schemas']['InventoryMovementType'];
      notes?: null | string;
      /** Format: uuid */
      productId: string;
      /** Format: double */
      quantity: number | string;
      /** Format: uuid */
      referenceId?: null | string;
      /** Format: uuid */
      warehouseId: null | string;
    };
    RegisterPosDeviceRequest: {
      /** Format: uuid */
      branchId: string;
      name: string;
      serialNumber: string;
    };
    ReprocessDeadLetterMessagesRequest: {
      messageIds: string[];
    };
    ReprocessDeadLetterMessagesResponse: {
      /** Format: int32 */
      reprocessedCount: number | string;
    };
    ReviewAgentActionRequest: {
      action: string;
      comment: null | string;
    };
    /** @enum {unknown} */
    RiskLevel: 'Low' | 'Medium' | 'High';
    RoleDto: {
      description: null | string;
      /** Format: uuid */
      id: string;
      name: string;
      permissions: string[];
    };
    SaleDto: {
      /** Format: date-time */
      createdAtUtc: string;
      currency: string;
      /** Format: uuid */
      customerId: null | string;
      /** Format: uuid */
      id: string;
      lineItems: components['schemas']['SaleLineItemDto'][];
      receiptNumber: string;
      /** Format: uuid */
      sessionId: string;
      statusName: string;
      /** Format: double */
      subTotalAmount: number | string;
      /** Format: double */
      taxAmount: number | string;
      /** Format: double */
      totalAmount: number | string;
    };
    SaleLineItemDto: {
      currency: string;
      /** Format: uuid */
      id: string;
      /** Format: uuid */
      productId: string;
      productName: string;
      /** Format: double */
      quantity: number | string;
      /** Format: double */
      subTotalAmount: number | string;
      /** Format: double */
      unitPriceAmount: number | string;
    };
    /** @enum {unknown} */
    SaleStatus: 'Completed' | 'Cancelled' | 'Paid' | null;
    StockAdjustmentDto: {
      /** Format: date-time */
      createdAtUtc: string;
      /** Format: uuid */
      id: string;
      lines: components['schemas']['StockAdjustmentLineDto'][];
      notes: null | string;
      reason: components['schemas']['StockAdjustmentReason'];
      reasonName: string;
      /** Format: uuid */
      warehouseId: string;
    };
    StockAdjustmentLineDto: {
      /** Format: uuid */
      productId: string;
      /** Format: double */
      quantity: number | string;
    };
    /** @enum {unknown} */
    StockAdjustmentReason: 'Shrinkage' | 'PhysicalCount' | 'Correction' | 'Donation' | 'Breakage';
    StockLevelDto: {
      /** Format: uuid */
      containerId: null | string;
      /** Format: uuid */
      id: string;
      isBelowMinThreshold: boolean;
      /** Format: double */
      minStockThreshold: number | string;
      /** Format: uuid */
      productId: string;
      /** Format: double */
      quantityAvailable: number | string;
      /** Format: double */
      quantityReserved: number | string;
      /** Format: double */
      totalPhysical: number | string;
      /** Format: uuid */
      warehouseId: string;
    };
    StockTransferDto: {
      /** Format: date-time */
      createdAtUtc: string;
      /** Format: uuid */
      destinationWarehouseId: string;
      /** Format: uuid */
      id: string;
      lines: components['schemas']['StockTransferLineDto'][];
      notes: null | string;
      /** Format: uuid */
      sourceWarehouseId: string;
    };
    StockTransferLineDto: {
      /** Format: uuid */
      productId: string;
      /** Format: double */
      quantity: number | string;
    };
    SupplierDto: {
      city: string;
      contactName: string;
      country: string;
      /** Format: date-time */
      createdAtUtc: string;
      email: string;
      /** Format: uuid */
      id: string;
      isActive: boolean;
      name: string;
      phone: string;
      street: string;
      taxCountryCode: string;
      taxId: string;
      /** Format: date-time */
      updatedAtUtc: null | string;
      zipCode: string;
    };
    SystemNotificationDto: {
      /** Format: date-time */
      createdAtUtc: string;
      /** Format: uuid */
      id: string;
      isRead: boolean;
      message: string;
      title: string;
      /** Format: uuid */
      userId: string;
    };
    TenantDto: {
      /** Format: date-time */
      createdAtUtc: string;
      documentNumber: string;
      /** Format: uuid */
      id: string;
      name: string;
      status: string;
    };
    UpdateBranchRequest: {
      city: string;
      country: string;
      name: string;
      phoneNumber: string;
      street: string;
      zipCode: string;
    };
    UpdateCategoryRequest: {
      description: null | string;
      name: string;
    };
    UpdateCustomerRequest: {
      city?: null | string;
      country?: null | string;
      /** @default  */
      email: string;
      fullName: string;
      /** @default  */
      phone: string;
      street?: null | string;
      taxCountryCode: string;
      taxId: string;
      zipCode?: null | string;
    };
    UpdateProductPriceRequest: {
      currency: string;
      /** Format: double */
      priceAmount: number | string;
    };
    UpdateProductRequest: {
      barcode: null | string;
      /** Format: uuid */
      categoryId: string;
      description: null | string;
      name: string;
    };
    UpdateSupplierRequest: {
      city: string;
      contactName: string;
      country: string;
      email: string;
      name: string;
      phone: string;
      street: string;
      taxCountryCode: string;
      taxIdValue: string;
      zipCode: string;
    };
    UpdateUserRequest: {
      email: string;
      firstName: string;
      lastName: string;
    };
    UpdateUserRoleRequest: {
      /** Format: uuid */
      roleId: string;
    };
    UserDto: {
      /** Format: date-time */
      createdAtUtc: string;
      email: string;
      firstName: string;
      fullName: string;
      /** Format: uuid */
      id: string;
      isActive: boolean;
      lastName: string;
      /** Format: uuid */
      roleId: string;
      /** Format: uuid */
      tenantId: null | string;
      /** Format: date-time */
      updatedAtUtc: null | string;
    };
    WarehouseDto: {
      /** Format: uuid */
      branchId: string;
      /** Format: date-time */
      createdAtUtc: string;
      description: null | string;
      /** Format: uuid */
      id: string;
      isActive: boolean;
      isDefault: boolean;
      name: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
