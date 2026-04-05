;; Title: Nakamoto Transition Signer v3
;; Description: Simple zero-fee contract for users to signal their transition with advanced tracking.
;; This contract takes 0 fees, only standard Stacks transaction fees (gas) apply.

(define-constant ERR_ALREADY_SIGNALLED (err u100))

;; Map to track transition signals per user
(define-map TransitionSignals principal { block: uint, status: (string-ascii 20) })
(define-data-var total-signals uint u0)

;; @desc Sign the transition. Function name matches contract name.
(define-public (signal-transition-v3)
  (begin
    ;; Ensure user hasn't already signalled
    (asserts! (is-none (map-get? TransitionSignals tx-sender)) ERR_ALREADY_SIGNALLED)
    
    ;; Record the signal
    (map-set TransitionSignals tx-sender {
      block: stacks-block-height,
      status: "nakamoto-ready"
    })
    
    ;; Increment overall count
    (var-set total-signals (+ (var-get total-signals) u1))
    
    ;; Emit event log
    (print { action: "transition-signal-v3", user: tx-sender, block: stacks-block-height })
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-signal-status (user principal))
  (map-get? TransitionSignals user)
)

(define-read-only (get-total-signals)
  (ok (var-get total-signals))
)

(define-read-only (has-user-signalled (user principal))
  (ok (is-some (map-get? TransitionSignals user)))
)
