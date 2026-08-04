/**
 * ModuleBadge — unified wrapper around 16×16 pixel-art badge icons.
 */

import React from "react";
import {
  PerceptronBadge,
  GradientBadge,
  NeuralNetBadge,
} from "./ModuleBadges";

type ModuleId = "perceptron" | "gradient-descent" | "neural-net";

interface ModuleBadgeProps {
  moduleId: ModuleId;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ModuleBadge: React.FC<ModuleBadgeProps> = ({
  moduleId,
  scale = 2,
  className = "",
  style = {},
}) => {
  switch (moduleId) {
    case "perceptron":
      return <PerceptronBadge scale={scale} className={className} style={style} />;
    case "gradient-descent":
      return <GradientBadge scale={scale} className={className} style={style} />;
    case "neural-net":
      return <NeuralNetBadge scale={scale} className={className} style={style} />;
    default:
      return null;
  }
};
