declare module '@emailjs/nodejs' {
  interface EmailJSResponse {
    status: number;
    text: string;
  }

  interface EmailJSOptions {
    publicKey: string;
    privateKey?: string;
  }

  interface SendParams {
    service_id: string;
    template_id: string;
    template_params: Record<string, unknown>;
    user_id?: string;
  }

  const emailjs: {
    init(options: EmailJSOptions): void;
    send(service_id: string, template_id: string, template_params: Record<string, unknown>, options: { publicKey: string }): Promise<EmailJSResponse>;
  };

  export = emailjs;
}
