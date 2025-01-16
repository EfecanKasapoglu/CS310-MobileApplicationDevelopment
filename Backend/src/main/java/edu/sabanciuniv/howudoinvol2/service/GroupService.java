package edu.sabanciuniv.howudoinvol2.service;

import edu.sabanciuniv.howudoinvol2.model.Group;
import edu.sabanciuniv.howudoinvol2.model.Message;
import edu.sabanciuniv.howudoinvol2.model.User;
import edu.sabanciuniv.howudoinvol2.repository.GroupRepository;
import edu.sabanciuniv.howudoinvol2.repository.MessageRepository;
import edu.sabanciuniv.howudoinvol2.repository.UserRepository;
import edu.sabanciuniv.howudoinvol2.security.JwtHelperUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtHelperUtils jwtHelper;

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
    public List<User> getGroupMembersDetails(String groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        List<User> members = new ArrayList<>();
        for (String memberId : group.getMemberIds()) {
            userRepository.findById(memberId).ifPresent(members::add);
        }
        return members;
    }

    public Group createGroup(String name, List<String> members, String creatorId) {
        Group group = new Group();
        group.setName(name);

        if (!members.contains(creatorId)) {
            members.add(creatorId);
        }

        group.setMemberIds(members);
        group.setCreatedTime(LocalDateTime.now());
        return groupRepository.save(group);
    }


    public boolean areFriends(String userId1, String userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user1.getFriends().contains(userId2);
    }

    public Group addMember(String groupId, String userId) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getMemberIds().contains(userId)) {
            throw new Exception("User is already a member of this group.");
        }

        group.getMemberIds().add(userId);
        return groupRepository.save(group);
    }

    public List<Message> getGroupMessages(String groupId) {
        return messageRepository.findByGroupId(groupId)
                .stream()
                .sorted((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                .toList();
    }
    public Message sendMessageToGroup(String groupId, String senderId, String content) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Message message = new Message();
        message.setGroupId(groupId);
        message.setSenderId(senderId);
        message.setSenderName(sender.getFirstName() + " " + sender.getLastName());
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());

        return messageRepository.save(message);
    }

    public List<String> getGroupMembers(String groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getMemberIds() == null || group.getMemberIds().isEmpty()) {
            throw new RuntimeException("No members found in this group.");
        }

        return group.getMemberIds();
    }
    public List<Group> getGroupsByUserId(String userId) {
        return groupRepository.findByMemberIdsContaining(userId);
    }


}
