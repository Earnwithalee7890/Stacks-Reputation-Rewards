;; Title: Audit Log Trait
;; Description: Standard for protocols to implement audit-friendly event emission

(define-trait audit-log-trait
  (
    (log-security-event (string-ascii 50) principal (string-ascii 100) (ok bool))
    (log-privileged-call (principal) (string-ascii 50) (ok bool))
  )
)
