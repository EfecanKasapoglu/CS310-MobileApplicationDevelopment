package edu.sabanciuniv.howudoinvol2.model;

import lombok.Data;

@Data
public class MessageRequest {
    private String senderId;
    private String content;
}