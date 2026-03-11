package com.bidstream.identityservice.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailOtpService {
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private TemplateEngine templateEngine;

    private final Map<String, OtpData> otpCache = new ConcurrentHashMap<>();

    public void sendOtp(String email) {
        String otp = "123456"; // String.valueOf(new Random().nextInt(900000) + 100000);
        otpCache.put(email, new OtpData(otp, LocalDateTime.now().plusMinutes(5)));

        // Commented out email sending logic
        /*
         * try {
         * SimpleMailMessage message = new SimpleMailMessage();
         * message.setFrom("BidStream Admin <no-reply@bidstream.com>");
         * message.setTo(email);
         * message.setSubject("🚀 Action Required: Verify your BidStream Account");
         * message.setText(
         * "Welcome to BidStream! 🔨\n\n" +
         * "Your security is our top priority. Please use the following One-Time Password (OTP) to complete your verification:\n\n"
         * +
         * "👉 " + otp + " 👈\n\n" +
         * "This code is valid for 5 minutes. If you did not request this, please secure your account.\n\n"
         * +
         * "Happy Bidding!\n" +
         * "The BidStream Security Team 🤝"
         * );
         * mailSender.send(message);
         * System.out.println("✅ Email successfully sent to: " + email);
         * } catch (Exception e) {
         * System.err.println("❌ FAILED to send email to " + email + ". Error: " +
         * e.getMessage());
         * }
         */
        System.out.println("✅ Dummy OTP generated successfully for email: " + email + " OTP is: " + otp);
    }

    public void sendResetPasswordEmail(String email, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("resetLink", resetLink);
            String htmlContent = templateEngine.process("forgot-password-email", context);

            helper.setTo(email);
            helper.setSubject("🛠️ Action Required: Reset Your BidStream Password");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Failed to send reset email: " + e.getMessage());
        }
    }

    public boolean validateOtp(String email, String userOtp) {
        OtpData cached = otpCache.get(email);
        if (cached == null || cached.expiry().isBefore(LocalDateTime.now())) {
            return false;
        }
        return cached.otp().equals(userOtp);
    }
}

record OtpData(String otp, LocalDateTime expiry) {
}