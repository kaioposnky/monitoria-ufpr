import { useEffect, useRef, useState } from 'react';

export function useDraftReview() {
  const [reviewing, setReviewing] = useState(false);
  const formHeadingRef = useRef<HTMLHeadingElement>(null);
  const shouldRestoreFormFocus = useRef(false);

  useEffect(() => {
    if (reviewing || !shouldRestoreFormFocus.current) return;
    shouldRestoreFormFocus.current = false;
    formHeadingRef.current?.focus();
  }, [reviewing]);

  return {
    reviewing,
    formHeadingRef,
    showReview: () => setReviewing(true),
    editDraft: () => {
      shouldRestoreFormFocus.current = true;
      setReviewing(false);
    },
  };
}
