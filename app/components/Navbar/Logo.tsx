import Link from "next/link";

interface LogoProps {
  onClick?: () => void;
  className?: string;
}

export default function Logo({ onClick, className = "" }: LogoProps) {
  return (
    <Link href="/" onClick={onClick} className={`text-md font-black tracking-[0.25em] uppercase ${className}`}>
      9TSEVEN
    </Link>
  );
}
