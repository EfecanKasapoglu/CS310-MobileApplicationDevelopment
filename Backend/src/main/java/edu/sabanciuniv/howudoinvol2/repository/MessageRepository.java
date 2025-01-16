package edu.sabanciuniv.howudoinvol2.repository;

import edu.sabanciuniv.howudoinvol2.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findBySenderIdAndReceiverId(String senderId, String receiverId);
    List<Message> findByGroupId(String groupId);
    List<Message> findBySenderIdInAndReceiverIdIn(List<String> senderIds, List<String> receiverIds);
    
}