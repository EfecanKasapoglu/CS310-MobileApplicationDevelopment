package edu.sabanciuniv.howudoinvol2.repository;

import edu.sabanciuniv.howudoinvol2.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findByMemberIdsContaining(String userId);
}


