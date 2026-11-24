import * as request from 'supertest';

export type ApiResponse<T = unknown> = { status: number; body: T };

type SignUpInput = {
  name: string;
  username: string;
  email: string;
  password: string;
};

/**
 * Sends real HTTP requests (supertest) to the backend, carrying one user's
 * session cookie — or none, for a signed-out visitor.
 */
export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly cookie?: string,
    readonly userId?: string,
  ) {}

  static async signUp(baseUrl: string, input: SignUpInput): Promise<ApiClient> {
    const response = await request(baseUrl)
      .post('/api/auth/sign-up/email')
      .set('Origin', process.env.FRONTEND_URL ?? 'http://localhost:3050')
      .send(input);
    if (response.status !== 200) {
      throw new Error(`Sign-up failed (${response.status}): ${response.text}`);
    }
    const setCookie = response.headers['set-cookie'] as unknown as
      string[] | undefined;
    const cookie = (setCookie ?? [])
      .map((header) => header.split(';')[0])
      .join('; ');
    const body = response.body as { user: { id: string } };
    return new ApiClient(baseUrl, cookie, body.user.id);
  }

  get<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.send<T>(request(this.baseUrl).get(`/api${path}`));
  }

  post<T = unknown>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.send<T>(
      request(this.baseUrl)
        .post(`/api${path}`)
        .send(body as object),
    );
  }

  put<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.send<T>(request(this.baseUrl).put(`/api${path}`));
  }

  delete<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.send<T>(request(this.baseUrl).delete(`/api${path}`));
  }

  private async send<T>(test: request.Test): Promise<ApiResponse<T>> {
    if (this.cookie) test.set('Cookie', this.cookie);
    const response = await test;
    return { status: response.status, body: response.body as T };
  }
}
