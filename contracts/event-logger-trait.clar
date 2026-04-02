;; Title: Event Logger Trait
;; Description: Standard interface for logging builder events

(define-trait event-logger-trait
  (
    (log-event (string-ascii 50) principal (string-ascii 100) (ok bool))
  )
)
