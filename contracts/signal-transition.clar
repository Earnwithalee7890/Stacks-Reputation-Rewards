;; Title: Nakamoto Transition Signer
;; Description: A simple zero-fee contract for users to signal their transition to the Nakamoto era.
;; This contract takes 0 fees, only standard Stacks transaction fees (gas) apply.
;; Produced for "EarnWithAlee" - Stacks Reputation Engine.

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_ALREADY_SIGNALLED (err u100))
(define-constant ERR_UNAUTHORIZED (err u101))

;; Map to track transition signals per user
(define-map TransitionSignals principal { block: uint, status: (string-ascii 20) })
(define-data-var total-signals uint u0)

;; @desc Sign the transition. Zero protocol fees.
(define-public (signal-transition)
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
    (print { action: "transition-signal", user: tx-sender, block: stacks-block-height })
    (ok true)
  )
)

;; --- Read-Only Functions ---

;; @desc Check if a user has signalled the transition
(define-read-only (get-signal-status (user principal))
  (map-get? TransitionSignals user)
)

;; @desc Get total amount of signals recorded
(define-read-only (get-total-signals)
  (var-get total-signals)
)

;; @desc Check if the transition is active (placeholder logic)
(define-read-only (is-transition-active)
  (ok true)
)
