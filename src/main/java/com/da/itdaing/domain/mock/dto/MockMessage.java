package com.da.itdaing.domain.mock.dto;

import java.util.List;

public record MockMessage(
    String messageId,
    long authorId,
    String authorRole,
    String body,
    String createdAt,
    List<MockMessageAttachment> attachments
) {
}

