import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
  forwardRef,
  useId,
} from 'react'

// ── Shared props ───────────────────────────────────────────────────────────
interface BaseFieldProps {
  label?: string
  hint?: string
  error?: string
  /** Left icon (Material Symbol name) */
  leadingIcon?: string
  /** Right icon (Material Symbol name) */
  trailingIcon?: string
  /** Filled (FILL=1) leading icon */
  leadingIconFilled?: boolean
  required?: boolean
  fullWidth?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// Input
// ═══════════════════════════════════════════════════════════════════════════
export interface InputProps
  extends BaseFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leadingIcon,
    trailingIcon,
    leadingIconFilled = false,
    required,
    fullWidth = false,
    className = '',
    disabled,
    ...props
  },
  ref,
) {
  const uid = useId()

  return (
    <FieldWrapper fullWidth={fullWidth}>
      {label && (
        <FieldLabel htmlFor={uid} required={required}>
          {label}
        </FieldLabel>
      )}

      <div className="relative flex items-center">
        {/* Leading icon */}
        {leadingIcon && (
          <span
            className="material-symbols-outlined absolute left-3 text-[20px] text-outline pointer-events-none"
            style={{ fontVariationSettings: leadingIconFilled ? "'FILL' 1" : "'FILL' 0" }}
          >
            {leadingIcon}
          </span>
        )}

        <input
          ref={ref}
          id={uid}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${uid}-error` : hint ? `${uid}-hint` : undefined}
          className={[
            // base
            'w-full bg-surface-bright border rounded-lg font-body-md text-body-md text-on-surface',
            'placeholder:text-outline-variant transition-all duration-200 outline-none',
            // padding
            leadingIcon ? 'pl-10' : 'pl-4',
            trailingIcon ? 'pr-10' : 'pr-4',
            'py-3',
            // state: normal
            !error && !disabled
              ? 'border-outline-variant hover:border-outline focus:border-secondary focus:ring-1 focus:ring-secondary'
              : '',
            // state: error
            error ? 'border-error focus:border-error focus:ring-1 focus:ring-error' : '',
            // state: disabled
            disabled ? 'opacity-50 cursor-not-allowed bg-surface-container-low' : '',
            className,
          ].join(' ')}
          {...props}
        />

        {/* Trailing icon */}
        {trailingIcon && (
          <span className="material-symbols-outlined absolute right-3 text-[20px] text-outline pointer-events-none">
            {trailingIcon}
          </span>
        )}
      </div>

      <FieldMeta uid={uid} hint={hint} error={error} />
    </FieldWrapper>
  )
})

// ═══════════════════════════════════════════════════════════════════════════
// Textarea
// ═══════════════════════════════════════════════════════════════════════════
export interface TextareaProps
  extends BaseFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  rows?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    required,
    fullWidth = false,
    className = '',
    disabled,
    rows = 4,
    ...props
  },
  ref,
) {
  const uid = useId()

  return (
    <FieldWrapper fullWidth={fullWidth}>
      {label && (
        <FieldLabel htmlFor={uid} required={required}>
          {label}
        </FieldLabel>
      )}

      <textarea
        ref={ref}
        id={uid}
        rows={rows}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${uid}-error` : hint ? `${uid}-hint` : undefined}
        className={[
          'w-full bg-surface-bright border rounded-lg px-4 py-3',
          'font-body-md text-body-md text-on-surface placeholder:text-outline-variant',
          'transition-all duration-200 outline-none resize-y',
          !error && !disabled
            ? 'border-outline-variant hover:border-outline focus:border-secondary focus:ring-1 focus:ring-secondary'
            : '',
          error ? 'border-error focus:border-error focus:ring-1 focus:ring-error' : '',
          disabled ? 'opacity-50 cursor-not-allowed bg-surface-container-low' : '',
          className,
        ].join(' ')}
        {...props}
      />

      <FieldMeta uid={uid} hint={hint} error={error} />
    </FieldWrapper>
  )
})

// ═══════════════════════════════════════════════════════════════════════════
// Select
// ═══════════════════════════════════════════════════════════════════════════
export interface SelectProps
  extends BaseFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hint,
    error,
    required,
    fullWidth = false,
    className = '',
    disabled,
    children,
    ...props
  },
  ref,
) {
  const uid = useId()

  return (
    <FieldWrapper fullWidth={fullWidth}>
      {label && (
        <FieldLabel htmlFor={uid} required={required}>
          {label}
        </FieldLabel>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={uid}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${uid}-error` : hint ? `${uid}-hint` : undefined}
          className={[
            'w-full appearance-none bg-surface-bright border rounded-lg px-4 py-3 pr-10',
            'font-body-md text-body-md text-on-surface',
            'transition-all duration-200 outline-none cursor-pointer',
            !error && !disabled
              ? 'border-outline-variant hover:border-outline focus:border-secondary focus:ring-1 focus:ring-secondary'
              : '',
            error ? 'border-error focus:border-error focus:ring-1 focus:ring-error' : '',
            disabled ? 'opacity-50 cursor-not-allowed bg-surface-container-low' : '',
            className,
          ].join(' ')}
          {...props}
        >
          {children}
        </select>

        {/* Chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-outline">
          <span className="material-symbols-outlined text-[20px]">expand_more</span>
        </div>
      </div>

      <FieldMeta uid={uid} hint={hint} error={error} />
    </FieldWrapper>
  )
})

// ═══════════════════════════════════════════════════════════════════════════
// Shared internals
// ═══════════════════════════════════════════════════════════════════════════
function FieldWrapper({ fullWidth, children }: { fullWidth: boolean; children: ReactNode }) {
  return <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>{children}</div>
}

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-label-md text-label-md text-on-surface-variant select-none"
    >
      {children}
      {required && (
        <span className="text-error ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

function FieldMeta({ uid, hint, error }: { uid: string; hint?: string; error?: string }) {
  if (!hint && !error) return null
  return (
    <p
      id={error ? `${uid}-error` : `${uid}-hint`}
      className={`font-caption text-caption ${error ? 'text-error' : 'text-outline'}`}
      role={error ? 'alert' : undefined}
    >
      {error ?? hint}
    </p>
  )
}

// ─── Default export for convenience ───────────────────────────────────────
export default Input
