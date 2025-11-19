package com.da.itdaing.domain.audit.repository;

import com.da.itdaing.domain.audit.entity.ApprovalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalRecordRepository extends JpaRepository<ApprovalRecord, Long> {
}

