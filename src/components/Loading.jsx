import { MoonLoader } from 'react-spinners';

/**
 * Reusable Loading Component with MoonLoader
 * @param {Object} props - Component props
 * @param {number} props.size - Size of the loader (default: 50)
 * @param {string} props.color - Color of the loader (default: '#3b82f6' - blue)
 * @param {boolean} props.loading - Loading state (default: true)
 * @param {string} props.text - Optional text to display below loader
 * @param {boolean} props.fullScreen - Whether to show as full screen overlay (default: false)
 * @param {string} props.className - Additional CSS classes
 */
export default function Loading({ 
  size = 50, 
  color = '#3b82f6', 
  loading = true,
  text = '',
  fullScreen = false,
  className = ''
}) {
  if (!loading) return null;

  const loaderContent = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <MoonLoader 
        color={color} 
        loading={loading} 
        size={size}
        speedMultiplier={0.8}
      />
      {text && (
        <p className="text-sm text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}

// Export variants for common use cases
export function LoadingFullScreen({ text = 'Loading...', ...props }) {
  return <Loading fullScreen={true} text={text} {...props} />;
}

export function LoadingInline({ size = 30, ...props }) {
  return <Loading size={size} {...props} />;
}

export function LoadingSmall({ size = 20, ...props }) {
  return <Loading size={size} {...props} />;
}

export function LoadingLarge({ size = 80, ...props }) {
  return <Loading size={size} {...props} />;
}