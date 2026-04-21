export class ResponseHandler<T = unknown> {
  public data: T | null;
  public error: string | null;

  constructor(data: T | null = null, error: string | null = null) {
    this.data = data;
    this.error = error;
  }
}
