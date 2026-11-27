import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { APP_CONFIG } from '@nalunpos/shared/data-access';
import type { AuthResponse, LoginRequest } from '../interfaces/auth.interfaces';
import { AuthApiClient } from './auth-api.client';

describe('AuthApiClient', () => {
  let client: AuthApiClient;
  let postMock: ReturnType<typeof vi.fn>;

  const TEST_APP_CONFIG = {
    apiUrl: 'https://api.nalunpos.com',
    appName: 'NalunPos',
    production: false,
  };

  const mockAuthResponse: AuthResponse = {
    token: 'jwt-api-client-token',
    userId: 'usr-001',
    roleId: '00000000-0000-0000-0000-000000000001',
    role: 'SuperAdmin',
    email: 'admin@nalunpos.com',
    fullName: 'Administrador Nalun',
    tenantId: null,
    expiresAtUtc: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  beforeEach(() => {
    postMock = vi.fn().mockReturnValue(of(mockAuthResponse));

    TestBed.configureTestingModule({
      providers: [
        AuthApiClient,
        { provide: APP_CONFIG, useValue: TEST_APP_CONFIG },
        { provide: HttpClient, useValue: { post: postMock } },
      ],
    });

    client = TestBed.inject(AuthApiClient);
  });

  it('debe enviar POST /api/v1/auth/login con credenciales y withCredentials', () => {
    const credentials: LoginRequest = {
      email: 'admin@nalunpos.com',
      password: 'StrongPassword123!',
    };

    let received: AuthResponse | undefined;
    client.login(credentials).subscribe((response) => {
      received = response;
    });

    expect(postMock).toHaveBeenCalledWith(
      'https://api.nalunpos.com/api/v1/auth/login',
      credentials,
      { withCredentials: true },
    );
    expect(received).toEqual(mockAuthResponse);
  });

  it('debe enviar POST /api/v1/auth/refresh sin cuerpo y withCredentials', () => {
    client.refresh().subscribe();

    expect(postMock).toHaveBeenCalledWith('https://api.nalunpos.com/api/v1/auth/refresh', null, {
      withCredentials: true,
    });
  });

  it('debe enviar POST /api/v1/auth/logout sin cuerpo y withCredentials', () => {
    postMock.mockReturnValue(of(undefined));

    let completed = false;
    client.logout().subscribe({
      next: () => {
        /* 204 sin cuerpo */
      },
      complete: () => {
        completed = true;
      },
    });

    expect(postMock).toHaveBeenCalledWith('https://api.nalunpos.com/api/v1/auth/logout', null, {
      withCredentials: true,
    });
    expect(completed).toBe(true);
  });
});
