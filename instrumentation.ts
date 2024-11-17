import { registerOTel } from "@vercel/otel";
 
export function register() {
  registerOTel({
    serviceName: "multi-step-tool-calls-demo",
  });
}