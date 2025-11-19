package com.da.itdaing.domain.mock.dto;

import java.util.List;

public record MockMessageThread(
    String threadId,
    MockMessageParticipants participants,
    String subject,
    List<MockMessage> messages,
    List<Long> unreadBy,
    String updatedAt
) {
}

