import type { SVGProps } from 'react';

export function AtomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <path d="M20.2 20.2c2.04-2.03.02-5.91-2.98-8.91s-6.88-5.02-8.91-2.98" />
      <path d="M3.8 3.8c-2.04 2.03-.02 5.91 2.98 8.91s6.88 5.02 8.91 2.98" />
      <path d="M3.8 20.2c-2.03-2.03 5.91-.02 8.91-2.98s5.02-6.88 2.98-8.91" />
      <path d="M20.2 3.8c2.03 2.03-5.91.02-8.91 2.98s-5.02 6.88-2.98 8.91" />
    </svg>
  );
}
