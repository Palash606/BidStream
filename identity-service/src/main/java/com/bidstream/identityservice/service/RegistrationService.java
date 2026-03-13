package com.bidstream.identityservice.service;

import com.bidstream.identityservice.dto.RegistrationRequest;
import com.bidstream.identityservice.entity.Address;
import com.bidstream.identityservice.entity.User;
import com.bidstream.identityservice.entity.UserRole;
import com.bidstream.identityservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RegistrationService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailOtpService otpService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;

    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    @Transactional
    public Map<String, Object> switchRole(String email, String targetRole) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        System.out.println("Processing SwitchRole for " + email + " to " + targetRole);
        
        // Robust role normalization
        String normalizedRole = targetRole.toUpperCase();
        String enumLookup;
        
        if (normalizedRole.contains("SELLER")) {
            enumLookup = "SELLER";
        } else if (normalizedRole.contains("BIDDER")) {
            enumLookup = "BIDDER";
        } else if (normalizedRole.contains("ADMIN")) {
            enumLookup = "ADMIN";
        } else if (normalizedRole.contains("PENDING")) {
            enumLookup = "ROLE_SELECTION_PENDING";
        } else {
            enumLookup = normalizedRole.replace("ROLE_", "");
        }
        
        System.out.println("Enum lookup result: " + enumLookup);
        
        try {
            UserRole newRole = UserRole.valueOf(enumLookup);
            user.setRole(newRole);
            user.setLastActiveRole(newRole);
            userRepository.save(user);

            // Generate new tokens with the updated role
            String newAccessToken = jwtService.generateToken(user);
            String newRefreshToken = jwtService.generateRefreshToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully switched to " + enumLookup + " mode.");
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", newRefreshToken);
            response.put("role", newRole);
            return response;
        } catch (IllegalArgumentException e) {
            System.err.println("CRITICAL: Failed to find enum for " + enumLookup);
            throw new RuntimeException("Invalid role: " + enumLookup + ". Available roles: BIDDER, SELLER, ADMIN");
        }
    }

    @Transactional
    public void initiateRegistration(String email, RegistrationRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered. Please log in.");
        }
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new IllegalArgumentException("Phone number is already associated with an account.");
        }
        if (userRepository.existsByPanCard(request.panCard())) {
            throw new IllegalArgumentException("PAN Card is already associated with an account.");
        }

        String passwordLower = request.password().toLowerCase();
        String fNameLower = request.firstName().toLowerCase();
        String lNameLower = request.lastName().toLowerCase();

        if (passwordLower.contains(fNameLower) || passwordLower.contains(lNameLower)) {
            throw new IllegalArgumentException("Password cannot contain your first or last name.");
        }

        if (!request.password().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match!");
        }

        otpService.sendOtp(email);
    }

    @Transactional
    public void registerNewUser(String email, String otp, RegistrationRequest request) {

        String passwordLower = request.password().toLowerCase();
        String fNameLower = request.firstName().toLowerCase();
        String lNameLower = request.lastName().toLowerCase();

        if (passwordLower.contains(fNameLower) || passwordLower.contains(lNameLower)) {
            throw new IllegalArgumentException("Password cannot contain your first or last name.");
        }

        if (!request.password().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match!");
        }

        User existingUser = userRepository.findByEmail(email).orElse(null);
        if (existingUser != null && existingUser.getLockoutUntil() != null
                && existingUser.getLockoutUntil().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException(
                    "Account locked due to multiple failed attempts. Please try again after 12 hours.");
        }

        if (!otpService.validateOtp(email, otp)) {
            handleFailedOtp(email);
            throw new IllegalArgumentException("Invalid OTP. Attempts are being tracked.");
        }

        UserRole assignedRole = email.equalsIgnoreCase("palashshah606@gmail.com")
                ? UserRole.ADMIN
                : UserRole.ROLE_SELECTION_PENDING;

        User user = User.builder()
                .email(email)
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .panCard(request.panCard())
                .countryCode(request.countryCode())
                .phoneNumber(request.phoneNumber())
                .address(new Address(request.street(), request.city(), request.state(), request.zipCode(),
                        request.country()))
                .role(assignedRole)
                .lastActiveRole(assignedRole)
                .isVerified(true)
                .build();

        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    private void handleFailedOtp(String email) {
        User user = userRepository.findByEmail(email).orElse(new User());
        int attempts = user.getFailedOtpAttempts() + 1;
        user.setFailedOtpAttempts(attempts);

        if (attempts >= 3) {
            user.setLockoutUntil(LocalDateTime.now().plusHours(12));
            userRepository.save(user);
            throw new IllegalStateException(
                    "3 failed attempts. Account locked for 12 hours. Please try again after 12 hours");
        }
        userRepository.save(user);
    }

    public String authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        checkLockout(user);

        if (!passwordEncoder.matches(password, user.getPassword())) {
            handleFailedAttempt(user);
            throw new IllegalArgumentException("Invalid email or password.");
        }

        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        otpService.sendOtp(email);
        return "OTP sent for 2FA verification.";
    }

    @Transactional
    public Map<String, Object> verifyAndGenerateToken(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        checkLockout(user);

        if (!otpService.validateOtp(email, otp)) {
            handleFailedAttempt(user);
            throw new IllegalArgumentException("Invalid OTP.");
        }

        user.setFailedOtpAttempts(0);
        user.setFailedLoginAttempts(0);
        user.setVerified(true);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        return response;
    }

    private void checkLockout(User user) {
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException("Account locked. Try again after 12 hours.");
        }
    }

    private void handleFailedAttempt(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        user.setFailedOtpAttempts(attempts);

        if (attempts >= 3) {
            user.setLockoutUntil(LocalDateTime.now().plusHours(12));
        }
        userRepository.save(user);
    }
}