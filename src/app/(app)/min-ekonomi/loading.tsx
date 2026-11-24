export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-10 w-full max-w-xl" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="skeleton h-96 lg:col-span-2" />
        <div className="skeleton h-96" />
      </div>
      <div className="skeleton h-64" />
    </div>
  );
}
