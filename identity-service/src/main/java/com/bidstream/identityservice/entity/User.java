package com.bidstream.identityservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, updatable = false)
    @Email(message = "Email is not valid")
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false, updatable = false, length = 10)
    private String panCard;
    private String countryCode;
    private String phoneNumber;

    @Embedded
    private Address address;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserRole role = UserRole.ROLE_SELECTION_PENDING;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserRole lastActiveRole = UserRole.ROLE_SELECTION_PENDING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserState currentState = UserState.IDLE;

    @Builder.Default
    private boolean isVerified = false;
    @Builder.Default
    private boolean isVerifiedSeller = false;
    
    @Column(unique = true, updatable = false)
    private String providerId;

    @Builder.Default
    private int failedLoginAttempts = 0;
    @Builder.Default
    private int failedOtpAttempts = 0;
    private LocalDateTime lockoutUntil;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    private List<String> interests;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = this.role.name();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }
        return List.of(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Logic for your 12-hour lockout
        return lockoutUntil == null || lockoutUntil.isBefore(LocalDateTime.now());
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.isVerified;
    }
}
