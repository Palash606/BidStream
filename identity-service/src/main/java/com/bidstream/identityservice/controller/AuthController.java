package com.bidstream.identityservice.controller;

import com.bidstream.identityservice.dto.RegistrationRequest;
import com.bidstream.identityservice.dto.SellerVerificationRequest;
import com.bidstream.identityservice.entity.User;
import com.bidstream.identityservice.repository.UserRepository;
import com.bidstream.identityservice.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private EmailOtpService otpService;
    @Autowired
    private RegistrationService registrationService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CountryCodeService countryCodeService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private SellerVerificationService verificationService;

    private final Map<String, String> resetTokenCache = new ConcurrentHashMap<>();

    @GetMapping("/countries")
    public ResponseEntity<?> getCountries() {
        return ResponseEntity.ok(countryCodeService.getAllCodes());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            String resetToken = UUID.randomUUID().toString();
            resetTokenCache.put(resetToken, email);
            String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;
            otpService.sendResetPasswordEmail(email, resetLink);
        }
        return ResponseEntity.ok("If an account exists, a reset link has been sent to your email.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        String email = resetTokenCache.get(token);
        if (email == null)
            return ResponseEntity.badRequest().body("Invalid or expired token.");

        User user = userRepository.findByEmail(email).orElseThrow();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetTokenCache.remove(token);
        return ResponseEntity.ok("Password reset successfully! &#x1F680;");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing token");
        }
        String token = authHeader.substring(7);
        if (jwtService.isTokenValid(token)) {
            String email = jwtService.extractUsername(token);
            User user = userRepository.findByEmail(email).orElseThrow();

            String newAccessToken = jwtService.generateToken(user);
            String newRefreshToken = jwtService.generateRefreshToken(user);

            return ResponseEntity.ok(Map.of(
                    "accessToken", newAccessToken,
                    "refreshToken", newRefreshToken));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2FA(@RequestParam String email, @RequestParam String otp) {
        if (otpService.validateOtp(email, otp)) {
            User user = userRepository.findByEmail(email).orElseThrow();
            return ResponseEntity.ok(Map.of(
                    "token", jwtService.generateToken(user),
                    "refreshToken", jwtService.generateRefreshToken(user),
                    "role", user.getRole()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP.");
    }

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestParam String email) {
        otpService.sendOtp(email);
        return ResponseEntity.ok("OTP sent to " + email);
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        if (registrationService.isUsernameAvailable(username)) {
            return ResponseEntity.ok("Username is available");
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Username is already taken");
    }

    @GetMapping("/all-users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(registrationService.getAllUsers());
    }

    @PostMapping("/switch-role")
    public ResponseEntity<?> switchRole(@RequestParam String email, @RequestParam String role) {
        try {
            Map<String, Object> response = registrationService.switchRole(email, role);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-seller")
    public ResponseEntity<?> verifySeller(@RequestBody SellerVerificationRequest request) {
        try {
            return ResponseEntity.ok(verificationService.verifySeller(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/check-verification")
    public ResponseEntity<?> checkVerification(@RequestParam String email) {
        return ResponseEntity.ok(verificationService.isVerifiedSeller(email));
    }

    @PostMapping("/initiate-registration")
    public ResponseEntity<?> initiateRegistration(
            @RequestParam String email,
            @Valid @RequestBody RegistrationRequest request) {
        try {
            registrationService.initiateRegistration(email, request);
            return ResponseEntity.ok("OTP sent to " + email);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred during validation.");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @RequestParam String email,
            @RequestParam String otp,
            @Valid @RequestBody RegistrationRequest request) {

        try {
            registrationService.registerNewUser(email, otp, request);
            return ResponseEntity.ok("Registration successful!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String email, @RequestParam String password) {
        return ResponseEntity.ok(registrationService.authenticateUser(email, password));
    }

    @PostMapping("/verify-final")
    public ResponseEntity<?> verifyFinal(@RequestParam String email, @RequestParam String otp) {
        Map<String, Object> verificationResult = registrationService.verifyAndGenerateToken(email, otp);
        return ResponseEntity.ok(verificationResult);
    }

    @GetMapping("/user-details")
    public ResponseEntity<?> getUserDetails(@RequestParam UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "isVerifiedSeller", user.isVerifiedSeller()
        ));
    }
}