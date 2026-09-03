package com.CivicAI.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CivicAI.backend.entity.User;
import com.CivicAI.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {

        User savedUser = userService.registerUser(user);

        return ResponseEntity.ok(savedUser);
    }
    @PostMapping("/login")
     public User login(@RequestBody User user) {
       return userService.login(user.getEmail(), user.getPassword());
    }
    

}
