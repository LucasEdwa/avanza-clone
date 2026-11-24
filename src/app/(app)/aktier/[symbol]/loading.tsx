export default function Loading() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="skeleton h-12 w-72" />
        <div className="skeleton h-[420px]" />
        <div className="skeleton h-40" />
      </div>
      <div className="space-y-5">
        <div className="skeleton h-96" />
        <div className="skeleton h-56" />
      </div>
    </div>
  );
}
