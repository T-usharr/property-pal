import * as React from "react";
import { Textarea } from "./textarea";

interface DebouncedTextareaProps extends Omit<React.ComponentProps<typeof Textarea>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export const DebouncedTextarea = React.forwardRef<HTMLTextAreaElement, DebouncedTextareaProps>(
  ({ value, onChange, debounceMs = 300, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value);
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    // Sync local value when external value changes (but not during typing)
    React.useEffect(() => {
      if (!timeoutRef.current) {
        setLocalValue(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onChange(newValue);
        timeoutRef.current = undefined;
      }, debounceMs);
    };

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <Textarea
        ref={ref}
        value={localValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

DebouncedTextarea.displayName = "DebouncedTextarea";
