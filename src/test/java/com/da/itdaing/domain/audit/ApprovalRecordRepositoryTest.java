package com.da.itdaing.domain.audit;

import com.da.itdaing.domain.audit.entity.ApprovalRecord;
import com.da.itdaing.domain.audit.repository.ApprovalRecordRepository;
import com.da.itdaing.domain.common.enums.DecisionType;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.support.MvcNoSecurityTest;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static com.da.itdaing.domain.common.enums.ApprovalTargetType.POPUP;
import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class ApprovalRecordRepositoryTest extends MvcNoSecurityTest {

    @Autowired
    private ApprovalRecordRepository approvalRecordRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void 승인_기록을_저장하고_조회할_수_있다() {
        // given
        Users admin = Users.builder()
                .loginId("admin")
                .password("pass")
                .email("admin@example.com")
                .role(UserRole.ADMIN)
                .build();
        userRepository.save(admin);

        ApprovalRecord record = ApprovalRecord.builder()
                .targetType(POPUP)
                .targetId(123L)
                .decision(DecisionType.APPROVE)
                .reason("모든 조건을 충족함")
                .admin(admin)
                .build();

        // when
        ApprovalRecord saved = approvalRecordRepository.save(record);
        ApprovalRecord found = approvalRecordRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getTargetType()).isEqualTo(POPUP);
        assertThat(found.getTargetId()).isEqualTo(123L);
        assertThat(found.getDecision()).isEqualTo(DecisionType.APPROVE);
        assertThat(found.getReason()).isEqualTo("모든 조건을 충족함");
        assertThat(found.getAdmin().getId()).isEqualTo(admin.getId());
        assertThat(found.getCreatedAt()).isNotNull();
    }
}

