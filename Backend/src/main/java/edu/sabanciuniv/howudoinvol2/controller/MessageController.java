package edu.sabanciuniv.howudoinvol2.controller;
import java.util.Collections;

import edu.sabanciuniv.howudoinvol2.model.Message;
import edu.sabanciuniv.howudoinvol2.model.User;
import edu.sabanciuniv.howudoinvol2.repository.UserRepository;
import edu.sabanciuniv.howudoinvol2.security.JwtHelperUtils;
import edu.sabanciuniv.howudoinvol2.service.MessageService;
import edu.sabanciuniv.howudoinvol2.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private JwtHelperUtils jwtHelper;

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;


    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> request) {
        String senderId = request.get("senderId");
        String receiverId = request.get("receiverId");
        String content = request.get("content");

        if (!userService.areFriends(senderId, receiverId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only send messages to your friends.");
        }

        Message sentMessage = messageService.sendMessage(senderId, receiverId, content);
        return ResponseEntity.ok(sentMessage);
    }


    @PostMapping("/groups/{groupId}/send")
    public ResponseEntity<Message> sendGroupMessage(
            @RequestParam String senderId,
            @PathVariable String groupId,
            @RequestParam String content) {
        Message message = messageService.sendGroupMessage(senderId, groupId, content);
        return ResponseEntity.ok(message);
    }


    @GetMapping("/{friendId}")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String friendId, HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        String userEmail;
        try {
            userEmail = jwtHelper.getUsernameFromToken(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        try {
            User user = userService.getUserByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!userService.areFriends(user.getId(), friendId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }

            List<Message> messages = messageService.getConversation(user.getId(), friendId);

            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }


}