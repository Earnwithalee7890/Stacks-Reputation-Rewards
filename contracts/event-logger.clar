;; Title: Event Logger Implementation
;; Description: Stores and emits builder activity events for off-chain indexing

(impl-trait .event-logger-trait.event-logger-trait)

(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant CONTRACT_OWNER tx-sender)

(define-map Events
  uint
  {
    event-type: (string-ascii 50),
    user: principal,
    metadata: (string-ascii 100),
    timestamp: uint
  }
)

(define-data-var event-count uint u0)

(define-public (log-event (event-type (string-ascii 50)) (user principal) (metadata (string-ascii 100)))
  (let (
    (id (var-get event-count))
  )
    ;; In a real application, you'd restrict this to authorized contracts
    (map-set Events id {
      event-type: event-type,
      user: user,
      metadata: metadata,
      timestamp: stacks-block-height
    })
    (var-set event-count (+ id u1))
    (print {action: "log-event", type: event-type, user: user, metadata: metadata})
    (ok true)
  )
)

(define-read-only (get-event (id uint))
  (map-get? Events id)
)

(define-read-only (get-total-events)
  (var-get event-count)
)
