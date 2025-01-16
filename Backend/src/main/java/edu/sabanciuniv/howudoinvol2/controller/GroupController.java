package edu.sabanciuniv.howudoinvol2.controller;

import edu.sabanciuniv.howudoinvol2.model.*;
import edu.sabanciuniv.howudoinvol2.repository.GroupRepository;
import edu.sabanciuniv.howudoinvol2.repository.UserRepository;
import org.springframework.http.HttpStatus;
import edu.sabanciuniv.howudoinvol2.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import edu.sabanciuniv.howudoinvol2.service.GroupService;
import edu.sabanciuniv.howudoinvol2.security.JwtHelperUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.util.*;

@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private JwtHelperUtils jwtHelper;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;
    private String getUserEmailFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header is missing or invalid");
        }

        token = token.substring(7);

        try {
            String userEmail = jwtHelper.getUsernameFromToken(token);
            System.out.println("User email extracted from token: " + userEmail);
            return userEmail;
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired token");
        }
    }



    @PostMapping("/create")
    public ResponseEntity<?> createGroup(
            @RequestBody GroupRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String userId = jwtHelper.getUserIdFromToken(token.substring(7));

            List<String> members = request.getMembers();
            Set<String> uniqueMembers = new HashSet<>(members);
            if (uniqueMembers.size() != members.size()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Duplicate member IDs are not allowed.");
            }

            for (String memberId : uniqueMembers) {
                boolean isFriend = userService.areFriends(userId, memberId);
                if (!isFriend) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You can only add friends to the group.");
                }
            }

            Group group = groupService.createGroup(request.getName(), new ArrayList<>(uniqueMembers), userId);
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }




    @PostMapping("/{groupId}/add-member")
    public ResponseEntity<?> addMember(HttpServletRequest request, @PathVariable String groupId, @RequestBody Map<String, String> body) {
        try {
            String token = request.getHeader("Authorization").substring(7);
            String adderId = jwtHelper.getUserIdFromToken(token);

            String newMemberId = body.get("userId");

            boolean isFriend = userService.areFriends(adderId, newMemberId);
            if (!isFriend) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You can only add friends to the group.");
            }

            Group updatedGroup = groupService.addMember(groupId, newMemberId);
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @PostMapping("/{groupId}/send")
    public ResponseEntity<Message> sendMessageToGroup(HttpServletRequest request, @PathVariable String groupId, @RequestBody MessageRequest messageRequest) {
        String userEmail = getUserEmailFromToken(request);

        Message message = groupService.sendMessageToGroup(groupId, messageRequest.getSenderId(), messageRequest.getContent());
        return ResponseEntity.ok(message);
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<User>> getGroupMembers(HttpServletRequest request, @PathVariable String groupId) {
        String userEmail = getUserEmailFromToken(request);

        List<User> members = groupService.getGroupMembersDetails(groupId); // Üye detaylarını al
        return ResponseEntity.ok(members);
    }
    @GetMapping("/{groupId}/details")
    public ResponseEntity<Map<String, Object>> getGroupDetails(@PathVariable String groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        List<Map<String, String>> members = group.getMemberIds().stream()
                .map(memberId -> userRepository.findById(memberId)
                        .map(user -> Map.of(
                                "id", user.getId(),
                                "firstName", user.getFirstName(),
                                "lastName", user.getLastName(),
                                "email", user.getEmail()))
                        .orElseThrow(() -> new RuntimeException("User not found: " + memberId)))
                .toList();

        Map<String, Object> groupDetails = Map.of(
                "id", group.getId(),
                "name", group.getName(),
                "createdTime", group.getCreatedTime(),
                "members", members
        );

        return ResponseEntity.ok(groupDetails);
    }
    @GetMapping("/all")
    public ResponseEntity<List<Group>> getAllGroups(HttpServletRequest request) {
        String userId = jwtHelper.getUserIdFromToken(request.getHeader("Authorization").substring(7));
        List<Group> groups = groupService.getGroupsByUserId(userId);
        return ResponseEntity.ok(groups);
    }
    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<Message>> getGroupMessages(HttpServletRequest request, @PathVariable String groupId) {
        try {
            String token = request.getHeader("Authorization").substring(7);
            String userId = jwtHelper.getUserIdFromToken(token);

            Group group = groupRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            if (!group.getMemberIds().contains(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }

            List<Message> messages = groupService.getGroupMessages(groupId);
            messages.forEach(message -> {
                if (message.getSenderName() == null || message.getSenderName().isEmpty()) {
                    User sender = userRepository.findById(message.getSenderId())
                            .orElseThrow(() -> new RuntimeException("Sender not found"));
                    message.setSenderName(sender.getFirstName() + " " + sender.getLastName());
                }
            });

            return ResponseEntity.ok(messages);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }



}
