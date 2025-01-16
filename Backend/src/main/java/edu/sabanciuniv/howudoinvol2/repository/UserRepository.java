package edu.sabanciuniv.howudoinvol2.repository;

import edu.sabanciuniv.howudoinvol2.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository

public interface UserRepository extends MongoRepository<User, String>{

    Optional<User> findByEmail(String email);
    List<User> findAllById(List<String> ids);


}
