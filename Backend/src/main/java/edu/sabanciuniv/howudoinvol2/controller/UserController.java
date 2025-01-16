package edu.sabanciuniv.howudoinvol2.controller;

import edu.sabanciuniv.howudoinvol2.model.User;
import edu.sabanciuniv.howudoinvol2.service.UserService;
import edu.sabanciuniv.howudoinvol2.exception.UserNotFoundException;
import edu.sabanciuniv.howudoinvol2.security.JwtHelperUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtHelperUtils jwtHelper;

    private String getUserEmailFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7); //
        }

        try {
            return jwtHelper.getUsernameFromToken(token);
        } catch (Exception e) {
            throw new RuntimeException("Unauthorized access");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(HttpServletRequest request, @PathVariable String id) {
        String userEmail = getUserEmailFromToken(request);

        User user = userService.getUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(HttpServletRequest request, @PathVariable String id, @RequestBody User updatedUser) {
        String userEmail = getUserEmailFromToken(request);

        User existingUser = userService.getUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPassword(updatedUser.getPassword());
        existingUser.setFriends(updatedUser.getFriends());

        User savedUser = userService.updateUser(existingUser);
        return ResponseEntity.ok(savedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(HttpServletRequest request, @PathVariable String id) {
        String userEmail = getUserEmailFromToken(request);

        userService.getUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
