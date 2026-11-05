// nombre.service.ts

export class BackendHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = "BackendHttpError";
  }
}

/**
 * Cliente HTTP configurable para comunicarse con el backend.
 * La URL base se proporciona desde la configuración de la aplicación;
 * la ruta se indica al invocar request, sin asumir endpoints.
 */
export class NombreService {
  private readonly baseUrl: URL;

  constructor(backendBaseUrl: string) {
    const baseUrl = new URL(backendBaseUrl);

    if (baseUrl.protocol !== "http:" && baseUrl.protocol !== "https:") {
      throw new Error("La URL del backend debe usar HTTP o HTTPS.");
    }

    if (baseUrl.search || baseUrl.hash) {
      throw new Error("La URL base del backend no debe incluir query ni fragmento.");
    }

    baseUrl.pathname = `${baseUrl.pathname.replace(/\/+$/, "")}/`;
    this.baseUrl = baseUrl;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const relativePath = path.replace(/^\/+/, "");
    const url = new URL(relativePath, this.baseUrl);

    if (url.origin !== this.baseUrl.origin) {
      throw new Error("La ruta debe pertenecer al mismo origen que el backend.");
    }

    const headers = new Headers(init.headers);
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    const response = await fetch(url, { ...init, headers });
    const body = await this.readBody(response);

    if (!response.ok) {
      throw new BackendHttpError(
        response.status,
        body,
        `La solicitud al backend falló con HTTP ${response.status}.`,
      );
    }

    return body as T;
  }

  private async readBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return undefined;
    }

    const text = await response.text();
    if (!text.trim()) {
      return undefined;
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (contentType.includes("application/json") || contentType.includes("+json")) {
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return text;
      }
    }

    return text;
  }
}