export default function Badge({ children, variant = 'info', className = '' }) {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
  }
  
  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
