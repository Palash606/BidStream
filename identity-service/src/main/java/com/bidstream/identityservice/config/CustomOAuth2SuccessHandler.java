package com.bidstream.identityservice.config;

import com.bidstream.identityservice.entity.User;
import com.bidstream.identityservice.repository.UserRepository;
import com.bidstream.identityservice.service.EmailOtpService;
import com.bidstream.identityservice.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailOtpService otpService;

    // MAANG Standard: Backend acts as a Traffic Controller for Social Handshakes
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String firstName = oauthUser.getAttribute("given_name");
        String lastName = oauthUser.getAttribute("family_name");

        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent()) {
            // Flow: Existing User -> Send OTP and redirect to Frontend Verify page
            otpService.sendOtp(email);
            String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/verify-otp")
                    .queryParam("email", email)
                    .queryParam("mode", "login")
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            // Flow: New User -> Redirect to Register Page with Pre-filled URL params
            // This prevents the 'null pan_card' violation because user hasn't been saved yet
            String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/register")
                    .queryParam("email", email)
                    .queryParam("firstName", firstName)
                    .queryParam("lastName", lastName)
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
    }
}