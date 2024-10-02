import { SECRET_JWT_KEY_EMAIL } from "./config.js";
import brevo from "@getbrevo/brevo";

export const sendEmail = async (email, code) => {
  try {
    const apiInstance = new brevo.TransactionalEmailsApi();
    let apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = SECRET_JWT_KEY_EMAIL;

    const sendSmtEmail = new brevo.SendSmtpEmail();
    sendSmtEmail.subject = "Recover Password";
    sendSmtEmail.to = [{ email: email }];
    sendSmtEmail.htmlContent = `<html><head><style>body {font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;} .container {background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);} h1 {color: #333;} p {font-size: 16px; color: #555;} .code {font-size: 20px; font-weight: bold; color: #007BFF; padding: 10px; background-color: #f0f8ff; border: 1px solid #007BFF; border-radius: 5px;} .footer {margin-top: 20px; font-size: 12px; color: #888;}</style></head><body><div class="container"><h1>Recuperación de Contraseña</h1><p>Recibimos una solicitud para restablecer tu contraseña. Aquí está tu código de recuperación:</p><p class="code">${code}</p><p>Si no solicitaste un restablecimiento de contraseña, por favor contacta al administrador.</p><div class="footer"><p>Gracias,</p><p>cacaoAPI</p></div></div></body></html>`;
    sendSmtEmail.sender = { email: "artur.acost0414@gmail.com" };

    // Enviar el email
    await apiInstance.sendTransacEmail(sendSmtEmail);
  } catch (error) {
    throw new Error(error.message);
  }
};
