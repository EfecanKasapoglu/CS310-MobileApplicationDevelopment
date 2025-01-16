package edu.sabanciuniv.howudoinvol2.controller;

import edu.sabanciuniv.howudoinvol2.model.User;
import edu.sabanciuniv.howudoinvol2.service.UserService;
import edu.sabanciuniv.howudoinvol2.security.JwtHelperUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/friends")
public class FriendController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtHelperUtils jwtHelper;

    @PostMapping("/add")
    public ResponseEntity<String> addFriend(@RequestBody Map<String, String> request) {
        String senderId = request.get("senderId");
        String receiverId = request.get("receiverId");

        System.out.println("Sender ID: " + senderId);
        System.out.println("Receiver ID: " + receiverId);

        userService.sendFriendRequest(senderId, receiverId);
        return ResponseEntity.ok("Friend request sent successfully.");
    }
    @PostMapping("/accept")
    public ResponseEntity<String> acceptFriendRequest(@RequestBody Map<String, String> request) {
        String senderId = request.get("senderId");
        String receiverId = request.get("receiverId");
        userService.acceptFriendRequest(receiverId, senderId);
        return ResponseEntity.ok("Friend request accepted successfully.");
    }

    @GetMapping
    public ResponseEntity<List<User>> getFriends(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String userEmail = jwtHelper.getUsernameFromToken(token);
        User user = userService.getUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> friends = user.getFriends().stream()
                .map(friendId -> userService.getUserById(friendId))
                .filter(userObj -> userObj.isPresent())
                .map(userObj -> userObj.get())
                .collect(Collectors.toList());

        return ResponseEntity.ok(friends);
    }
    @GetMapping("/requests")
    public ResponseEntity<List<User>> getFriendRequests(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String userEmail = jwtHelper.getUsernameFromToken(token);
        System.out.println("Extracted Email: " + userEmail);

        User user = userService.getUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + userEmail));

        System.out.println("User ID: " + user.getId());

        List<User> requests = userService.getPendingRequests(user.getId());
        System.out.println("Pending Friend Requests: " + requests);

        return ResponseEntity.ok(requests);
    }
}