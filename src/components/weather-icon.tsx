import { Sun, Cloud, CloudSun, CloudRain, CloudLightning, CloudSnow, CloudFog } from "lucide-react";
import type { WeatherCond } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap: Record<WeatherCond, typeof Sun> = {
  sun: Sun,
  cloud: Cloud,
  partly: CloudSun,
  rain: CloudRain,
  storm: CloudLightning,
  snow: CloudSnow,
  fog: CloudFog,
};

const animMap: Record<WeatherCond, string> = {
  sun: "anim-sun",
  cloud: "anim-cloud",
  partly: "anim-partly",
  rain: "anim-rain",
  storm: "anim-storm",
  snow: "anim-snow",
  fog: "anim-fog",
};

export function WeatherIcon({
  cond,
  className,
  animated = true,
}: {
  cond: WeatherCond;
  className?: string;
  animated?: boolean;
}) {
  const Icon = iconMap[cond];
  return <Icon className={cn("text-foreground", className, animated && animMap[cond])} />;
}
