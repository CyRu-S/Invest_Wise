package com.fsad.mutualfund.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final boolean mailEnabled;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.mail.enabled:false}") boolean mailEnabled,
                        @Value("${app.mail.from:noreply@investwise.local}") String fromAddress) {
        this.mailSender = mailSender;
        this.mailEnabled = mailEnabled;
        this.fromAddress = fromAddress;
    }

    public void sendRegistrationVerificationCode(String email, String fullName, String code) {
        String body = String.format(
                "Hi %s,%n%nYour InvestWise email verification code is: %s%n%nThis code will expire soon. If you did not start this signup, you can ignore this email.%n",
                fullName,
                code
        );
        sendEmail(email, "Verify your InvestWise account", body, code, "registration");
    }

    public void sendPasswordResetCode(String email, String fullName, String code) {
        String body = String.format(
                "Hi %s,%n%nYour InvestWise password reset code is: %s%n%nUse this code together with the captcha on the reset screen to set a new password. If you did not request this, you can ignore this email.%n",
                fullName,
                code
        );
        sendEmail(email, "Reset your InvestWise password", body, code, "password reset");
    }

    private void sendEmail(String email, String subject, String body, String code, String purpose) {
        if (!mailEnabled) {
            System.out.printf("[MAIL DISABLED] %s code for %s: %s%n", purpose, email, code);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom(fromAddress);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
