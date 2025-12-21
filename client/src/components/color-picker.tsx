import { useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
  className?: string;
}

const presetColors = [
  "#FF6B6B", "#FF8E53", "#FFC93C", "#52E3C2", "#4ECDC4",
  "#45B7D1", "#6C5CE7", "#A55EEA", "#EC4899", "#F472B6",
  "#8B5CF6", "#7C3AED", "#2DD4BF", "#10B981", "#14B8A6",
  "#0EA5E9", "#3B82F6", "#6366F1", "#1F1F2E", "#2D2D44",
  "#374151", "#4B5563", "#6B7280", "#9CA3AF", "#D1D5DB",
  "#F3F4F6", "#FFFFFF", "#000000", "#1E293B", "#0F172A",
];

export function ColorPicker({ color, onChange, label, className }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="h-10 w-10 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            style={{ backgroundColor: color }}
            data-testid={`color-picker-${label.toLowerCase().replace(/\s/g, '-')}`}
          />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset}
                  className={cn(
                    "h-8 w-8 rounded-md border transition-transform hover:scale-110",
                    color === preset ? "ring-2 ring-primary ring-offset-2" : "border-border"
                  )}
                  style={{ backgroundColor: preset }}
                  onClick={() => {
                    onChange(preset);
                    setIsOpen(false);
                  }}
                  data-testid={`color-preset-${preset}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t">
              <Label className="text-xs text-muted-foreground">Custom:</Label>
              <input
                ref={inputRef}
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 w-12 rounded cursor-pointer"
                data-testid={`color-input-${label.toLowerCase().replace(/\s/g, '-')}`}
              />
              <span className="text-xs font-mono text-muted-foreground uppercase">
                {color}
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Label className="text-sm">{label}</Label>
    </div>
  );
}

interface ColorControlsPanelProps {
  colorUp: string;
  colorDown: string;
  backgroundColor: string;
  onColorUpChange: (color: string) => void;
  onColorDownChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
}

export function ColorControlsPanel({
  colorUp,
  colorDown,
  backgroundColor,
  onColorUpChange,
  onColorDownChange,
  onBackgroundColorChange,
}: ColorControlsPanelProps) {
  return (
    <div className="space-y-4 p-4 rounded-xl bg-muted/30 border">
      <h4 className="font-medium text-sm text-muted-foreground mb-3">Customize Colors</h4>
      <div className="space-y-3">
        <ColorPicker
          color={colorUp}
          onChange={onColorUpChange}
          label="Gradient Top"
        />
        <ColorPicker
          color={colorDown}
          onChange={onColorDownChange}
          label="Gradient Bottom"
        />
        <ColorPicker
          color={backgroundColor}
          onChange={onBackgroundColorChange}
          label="Background"
        />
      </div>
    </div>
  );
}
