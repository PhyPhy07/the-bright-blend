interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <p
      className="rounded-lg border-2 border-red-500 bg-red-100 px-4 py-3 text-center text-red-800 font-[family-name:var(--font-typewriter)]"
      role="alert"
    >
      {message}
    </p>
  );
}
