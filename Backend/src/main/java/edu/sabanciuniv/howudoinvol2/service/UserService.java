package edu.sabanciuniv.howudoinvol2.service;

import edu.sabanciuniv.howudoinvol2.model.User;
import edu.sabanciuniv.howudoinvol2.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;


    public User createUser(User user) {
        return userRepository.save(user);
    }


    public User updateUser(User user) {
        return userRepository.save(user);
    }


    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }


    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
    public List<User> findFriendRequests(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> requestIds = user.getFriendRequests();
        if (requestIds == null || requestIds.isEmpty()) {
            return new ArrayList<>();
        }

        return userRepository.findAllById(requestIds);
    }
    public List<User> findFriends(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> friendIds = user.getFriends();
        if (friendIds == null || friendIds.isEmpty()) {
            return new ArrayList<>();
        }

        return userRepository.findAllById(friendIds);
    }
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getFriends(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> friendIds = user.getFriends();
        if (friendIds.isEmpty()) {
            return new ArrayList<>();
        }

        return userRepository.findAllById(friendIds);
    }



    public List<User> getPendingRequests(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> requestIds = user.getFriendRequests();
        if (requestIds == null || requestIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<User> requests = userRepository.findAllById(requestIds);
        System.out.println("Pending requests for user ID " + userId + ": " + requests);
        return requests;
    }


    public void sendFriendRequest(String senderId, String receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (receiver.getFriendRequests().contains(senderId)) {
            throw new RuntimeException("Friend request already sent.");
        }

        receiver.getFriendRequests().add(senderId);
        userRepository.save(receiver);

        System.out.println("Friend request sent. Receiver's updated friendRequests: " + receiver.getFriendRequests());
    }


    public void acceptFriendRequest(String receiverId, String senderId) {
        if (receiverId == null || senderId == null) {
            throw new RuntimeException("Sender ID or Receiver ID is null");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (!receiver.getFriendRequests().contains(senderId)) {
            throw new RuntimeException("Friend request not found.");
        }

        receiver.getFriendRequests().remove(senderId);

        if (!receiver.getFriends().contains(senderId)) {
            receiver.getFriends().add(senderId);
        }
        if (!sender.getFriends().contains(receiverId)) {
            sender.getFriends().add(receiverId);
        }

        userRepository.save(receiver);
        userRepository.save(sender);

        System.out.println("Friend request accepted. Receiver's friends: " + receiver.getFriends());
        System.out.println("Sender's friends: " + sender.getFriends());
    }
    public List<User> getFriendRequests(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> requestIds = user.getFriendRequests();
        if (requestIds.isEmpty()) {
            return new ArrayList<>();
        }

        return userRepository.findAllById(requestIds);
    }

    public boolean areFriends(String userId1, String userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId1));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId2));

        return user1.getFriends() != null && user1.getFriends().contains(userId2)
                && user2.getFriends() != null && user2.getFriends().contains(userId1);
    }
}