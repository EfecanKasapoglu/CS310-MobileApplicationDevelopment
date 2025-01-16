package edu.sabanciuniv.howudoinvol2.service;

import edu.sabanciuniv.howudoinvol2.model.Message;
import edu.sabanciuniv.howudoinvol2.model.User;
import edu.sabanciuniv.howudoinvol2.repository.MessageRepository;
import edu.sabanciuniv.howudoinvol2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;


    public List<Message> getMessagesBetweenFriends(String userId, List<String> friendIds) {
        List<Message> messages = messageRepository.findBySenderIdInAndReceiverIdIn(
                List.of(userId), friendIds
        );
        messages.addAll(messageRepository.findBySenderIdInAndReceiverIdIn(
                friendIds, List.of(userId)
        ));
        return messages;
    }


    public Message sendMessage(String senderId, String receiverId, String content) {
        if (!userService.areFriends(senderId, receiverId)) {
            throw new RuntimeException("Cannot send message: Users are not friends.");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        return messageRepository.save(message);
    }

    public List<Message> getConversation(String userId, String friendId) {
        List<Message> sentMessages = messageRepository.findBySenderIdAndReceiverId(userId, friendId);
        List<Message> receivedMessages = messageRepository.findBySenderIdAndReceiverId(friendId, userId);


        List<Message> allMessages = new ArrayList<>();
        allMessages.addAll(sentMessages);
        allMessages.addAll(receivedMessages);

        allMessages.sort(Comparator.comparing(Message::getTimestamp));

        return allMessages;
    }



    public Message sendGroupMessage(String senderId, String groupId, String content) {
        Message message = new Message();
        message.setSenderId(senderId);
        message.setGroupId(groupId);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        return messageRepository.save(message);
    }


    public List<Message> getGroupMessages(String groupId) {
        return messageRepository.findByGroupId(groupId);
    }
}