package com.CivicAI.backend.service;

import org.springframework.stereotype.Service;

import com.CivicAI.backend.entity.User;
import com.CivicAI.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    public User registerUser(User user) {

        if (user.getName() == null ||
                user.getName().trim().isEmpty()) {

            throw new RuntimeException("Name is required");
        }

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            throw new RuntimeException("Email is required");
        }

        if (user.getPassword() == null ||
                user.getPassword().trim().isEmpty()) {

            throw new RuntimeException("Password is required");
        }

        User existingUser =
                userRepository.findByEmail(user.getEmail());

        if (existingUser != null) {
            throw new RuntimeException(
                    "Email already registered"
            );
        }

        if (user.getRole() == null ||
                user.getRole().trim().isEmpty()) {

            user.setRole("CITIZEN");
        }

        return userRepository.save(user);
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public User login(
            String email,
            String password) {

        if (email == null ||
                email.trim().isEmpty() ||
                password == null ||
                password.trim().isEmpty()) {

            return null;
        }

        User user =
                userRepository.findByEmail(email);

        if (user != null &&
                user.getPassword().equals(password)) {

            return user;
        }

        return null;
    }

    // =========================================================
    // GET USER
    // =========================================================

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));
    }

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    public User updateUser(
            Long id,
            User updatedUser) {

        User user = getUserById(id);

        if (updatedUser.getName() != null &&
                !updatedUser.getName()
                        .trim()
                        .isEmpty()) {

            user.setName(updatedUser.getName());
        }

        if (updatedUser.getEmail() != null &&
                !updatedUser.getEmail()
                        .trim()
                        .isEmpty() &&
                !updatedUser.getEmail()
                        .equalsIgnoreCase(user.getEmail())) {

            User existing =
                    userRepository.findByEmail(
                            updatedUser.getEmail()
                    );

            if (existing != null &&
                    !existing.getId().equals(id)) {

                throw new RuntimeException(
                        "Email already registered"
                );
            }

            user.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getPassword() != null &&
                !updatedUser.getPassword()
                        .trim()
                        .isEmpty()) {

            user.setPassword(updatedUser.getPassword());
        }

        return userRepository.save(user);
    }
}