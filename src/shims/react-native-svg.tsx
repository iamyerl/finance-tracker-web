/* Веб-шим react-native-svg: тонкие обёртки над нативными SVG-элементами DOM. */
import React from 'react';

type AnyProps = { [key: string]: any };

const Svg = ({ children, style, ...rest }: AnyProps) => (
  <svg style={{ display: 'block', ...style }} {...rest}>
    {children}
  </svg>
);

export const Path = (props: AnyProps) => <path {...props} />;
export const Circle = (props: AnyProps) => <circle {...props} />;
export const Rect = (props: AnyProps) => <rect {...props} />;
export const Line = (props: AnyProps) => <line {...props} />;
export const Ellipse = (props: AnyProps) => <ellipse {...props} />;
export const G = (props: AnyProps) => <g {...props} />;
export const Defs = ({ children }: AnyProps) => <defs>{children}</defs>;
export const Stop = (props: AnyProps) => <stop {...props} />;
export const LinearGradient = ({ children, ...rest }: AnyProps) => (
  <linearGradient {...rest}>{children}</linearGradient>
);

const pct = (v: string | number): number => {
  if (typeof v === 'number') return v;
  const n = parseFloat(v);
  return v.trim().endsWith('%') ? n / 100 : n;
};

/**
 * В react-native-svg RadialGradient поддерживает эллипс через rx/ry.
 * DOM-овский radialGradient умеет только круг (r), поэтому эллипс
 * эмулируется через gradientTransform: масштабирование по Y вокруг центра.
 */
export const RadialGradient = ({ children, cx, cy, rx, ry, fx, fy, r, ...rest }: AnyProps) => {
  const cxF = pct(cx ?? '50%');
  const cyF = pct(cy ?? '50%');
  let rF = r != null ? pct(r) : undefined;
  let transform: string | undefined;
  if (rx != null) {
    const rxF = pct(rx);
    const ryF = ry != null ? pct(ry) : rxF;
    rF = rxF;
    if (ryF !== rxF) {
      const k = ryF / rxF;
      transform = `translate(${cxF} ${cyF}) scale(1 ${k}) translate(${-cxF} ${-cyF})`;
    }
  }
  return (
    <radialGradient
      cx={cxF}
      cy={cyF}
      r={rF}
      fx={fx != null ? pct(fx) : undefined}
      fy={fy != null ? pct(fy) : undefined}
      gradientUnits="objectBoundingBox"
      gradientTransform={transform}
      {...rest}
    >
      {children}
    </radialGradient>
  );
};

export default Svg;
