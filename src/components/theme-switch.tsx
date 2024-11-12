import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme, themes } = useTheme();
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Select defaultValue={theme} onValueChange={(v) => setTheme(v)}>
      <SelectTrigger className="focus:ring-none h-8 w-20 p-0 pl-2 focus:ring-0">
        {theme}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {themes.map((theme) => (
            <SelectItem key={theme} value={theme}>
              {theme}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default ThemeSwitch;
