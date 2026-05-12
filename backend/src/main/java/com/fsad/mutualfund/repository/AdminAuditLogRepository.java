package com.fsad.mutualfund.repository;

import com.fsad.mutualfund.entity.AdminAuditLog;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {
    List<AdminAuditLog> findTop25ByOrderByCreatedAtDesc();

    @Modifying
    @Transactional
    @Query("update AdminAuditLog log set log.targetUser = null where log.targetUser.id = :userId")
    int clearTargetUserReferences(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("update AdminAuditLog log set log.actor = null where log.actor.id = :userId")
    int clearActorReferences(@Param("userId") Long userId);
}
