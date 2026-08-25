import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Rastro SQL — início">
      <span className="brand-mark" aria-hidden="true">
        <span>R</span>
      </span>
      <span className="brand-copy">
        <strong>RASTRO</strong>
        <small>SQL / CENTRAL DE DADOS</small>
      </span>
    </Link>
  );
}

