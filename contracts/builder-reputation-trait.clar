;; Title: Builder Reputation Trait
;; Description: Interface for querying cross-project reputation scores

(define-trait builder-reputation-trait
  (
    (get-reputation (principal) (response uint uint))
    (get-tier (principal) (response (string-ascii 20) uint))
    (is-verified (principal) (response bool uint))
  )
)
