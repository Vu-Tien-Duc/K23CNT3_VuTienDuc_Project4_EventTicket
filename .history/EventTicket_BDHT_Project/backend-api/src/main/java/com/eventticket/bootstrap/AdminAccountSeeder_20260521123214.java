package com.eventticket.bootstrap;

import com.eventticket.entity.G8_users;
import com.eventticket.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.EventListener;
import org.springframework.context.annotation.PropertySource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import java.util.Optional;

@Slf4j
@Component
@PropertySource("classpath:admin-account.properties")
public class AdminAccountSeeder {

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void seedAdmin() {
        if (adminEmail == null || adminEmail.trim().isEmpty()) {
            log.warn("Admin seed skipped: app.admin.email is empty");
            return;
        }
        if (adminPassword == null || adminPassword.trim().isEmpty()) {
            log.warn("Admin seed skipped: app.admin.password is empty");
            return;
        }

        try {
            Optional<G8_users> existingOpt = userRepository.findByEmail(adminEmail);

            String adminRole = "ADMIN";
            boolean isActive = true;
            boolean isVerified = false;

            if (existingOpt.isEmpty()) {
                G8_users admin = new G8_users();
                admin.setFullName("Administrator");
                admin.setEmail(adminEmail);
                admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                admin.setPhoneNumber(null);
                admin.setRole(adminRole);
                admin.setIsVerified(isVerified);
                admin.setIsActive(isActive);

                userRepository.save(admin);
                log.info("✅ Seeded admin account: {}", adminEmail);
            } else {
                G8_users admin = existingOpt.get();

                boolean changed = false;
                if (!adminRole.equals(admin.getRole())) {
                    admin.setRole(adminRole);
                    changed = true;
                }
                if (admin.getIsActive() == null || !admin.getIsActive()) {
                    admin.setIsActive(isActive);
                    changed = true;
                }

                // Luôn đảm bảo passwordHash khớp config.
                // (Dù BCrypt có salt khác nhau, encoder.encode sẽ tạo hash khác -> update nếu
                // cần)
                String newHash = passwordEncoder.encode(adminPassword);
                if (admin.getPasswordHash() == null
                        || !passwordEncoder.matches(adminPassword, admin.getPasswordHash())) {
                    admin.setPasswordHash(newHash);
                    changed = true;
                }

                if (admin.getIsVerified() == null) {
                    admin.setIsVerified(isVerified);
                    changed = true;
                }

                if (changed) {
                    userRepository.save(admin);
                    log.info("✅ Updated admin account to match config: {}", adminEmail);
                } else {
                    log.info("ℹ️ Admin account already up-to-date: {}", adminEmail);
                }
            }
        } catch (Exception e) {
            log.error("❌ Failed to seed/update admin account: {}", adminEmail, e);
        }
    }
}
