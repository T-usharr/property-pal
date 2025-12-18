import * as React from "react";
import { Input } from "./input";

interface DebouncedInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export const DebouncedInput = React.forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ value, onChange, debounceMs = 300, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value);
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    // Sync local value when external value changes (but not during typing)
    React.useEffect(() => {
      if (!timeoutRef.current) {
        setLocalValue(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <Input
        ref={ref}
        value={localValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

DebouncedInput.displayName = "DebouncedInput";
