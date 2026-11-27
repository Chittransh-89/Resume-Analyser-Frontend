const PageFallback = () => {
  return (
    <div
      className="shell flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Loading page"
    >
      <span
        className="spinner h-6 w-6 rounded-full border-2 border-cyan/25 border-t-cyan"
        aria-hidden="true"
      />
    </div>
  )
}

export default PageFallback
