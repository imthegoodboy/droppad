// Decorative die-cut stickers. Each shape is drawn twice: once as a fat white
// silhouette (the sticker border) and once in colour on top.

const Face = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="-8" cy="0" rx="2.8" ry="3.6" fill="#5b2342" />
    <ellipse cx="8" cy="0" rx="2.8" ry="3.6" fill="#5b2342" />
    <circle cx="-7" cy="-1.3" r="1" fill="#fff" />
    <circle cx="9" cy="-1.3" r="1" fill="#fff" />
    <ellipse cx="-14" cy="6" rx="4.5" ry="2.6" fill="#ff7aa8" opacity=".55" />
    <ellipse cx="14" cy="6" rx="4.5" ry="2.6" fill="#ff7aa8" opacity=".55" />
    <path d="M-4 5Q0 9 4 5" stroke="#5b2342" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </g>
);

const Sticker = ({ shape, children, style, className }) => (
  <svg className={className} viewBox="0 0 100 100" style={style} aria-hidden="true">
    <g className="sil">{shape}</g>
    {shape}
    {children}
  </svg>
);

const HEART = 'M50 84C22 66 10 48 18 31C26 15 44 17 50 31C56 17 74 15 82 31C90 48 78 66 50 84Z';
const PETAL = 'M50 50C39 41 36 24 45 15L50 20L55 15C64 24 61 41 50 50Z';
const SPARKLE = 'M50 8C54 40 60 46 92 50C60 54 54 60 50 92C46 60 40 54 8 50C40 46 46 40 50 8Z';

const heart = <path d={HEART} fill="#ff7eb6" />;
const heartBits = (
  <>
    <ellipse cx="31" cy="33" rx="6" ry="3.5" transform="rotate(-35 31 33)" fill="#fff" opacity=".6" />
    <Face x={50} y={48} />
  </>
);

const strawberry = (
  <>
    <path d="M50 90C28 82 16 60 22 44C27 32 40 31 50 34C60 31 73 32 78 44C84 60 72 82 50 90Z" fill="#ff5c8a" />
    <path
      d="M50 38L36 26L45 28L44 15L50 24L56 15L55 28L64 26Z"
      fill="#58c878"
      stroke="#58c878"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </>
);

const cloud = <path d="M28 72C14 72 12 52 26 50C24 36 42 28 52 38C58 26 80 30 78 46C92 46 92 72 76 72Z" fill="#bfe3ff" />;

const daisy = (
  <>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <ellipse
        key={a}
        cx="50"
        cy="27"
        rx="10"
        ry="17"
        transform={`rotate(${a} 50 50)`}
        fill="#fff"
        stroke="#ffd0e4"
        strokeWidth="1.5"
      />
    ))}
    <circle cx="50" cy="50" r="17" fill="#ffd75e" />
  </>
);

const star = (
  <path
    d="M50 12L61.2 36.6L88 39.6L68.1 57.9L73.5 84.4L50 71L26.5 84.4L31.9 57.9L12 39.6L38.8 36.6Z"
    fill="#ffd95e"
    stroke="#ffd95e"
    strokeWidth="6"
    strokeLinejoin="round"
  />
);

const bunny = (
  <>
    <ellipse cx="37" cy="30" rx="9" ry="21" transform="rotate(-10 37 30)" fill="#fff" stroke="#ffc2da" strokeWidth="2" />
    <ellipse cx="63" cy="30" rx="9" ry="21" transform="rotate(10 63 30)" fill="#fff" stroke="#ffc2da" strokeWidth="2" />
    <ellipse cx="50" cy="64" rx="31" ry="25" fill="#fff" stroke="#ffc2da" strokeWidth="2" />
  </>
);

const sakura = (
  <>
    {[0, 72, 144, 216, 288].map((a) => (
      <path key={a} d={PETAL} transform={`rotate(${a} 50 50)`} fill="#ffb3d1" />
    ))}
  </>
);
const sakuraBits = (
  <>
    <circle cx="50" cy="50" r="7" fill="#ff7eb6" />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx="50" cy="38" r="1.8" fill="#ff5c9f" transform={`rotate(${a + 36} 50 50)`} />
    ))}
  </>
);

const sparkle = (color) => <path d={SPARKLE} fill={color} />;

const pos = ({ w, r, d, ...o }) => ({ ...o, '--w': w, '--r': r, animationDelay: d });

export default function Stickers() {
  return (
    <div className="stickers">
      <Sticker shape={heart} style={pos({ top: '13%', left: '6%', w: '96px', r: '-12deg', d: '0s' })}>
        {heartBits}
      </Sticker>
      <Sticker shape={strawberry} style={pos({ top: '56%', left: '4%', w: '84px', r: '10deg', d: '-2s' })}>
        {[[30, 50], [70, 50], [36, 72], [64, 72], [50, 83]].map(([x, y]) => (
          <ellipse key={x + '' + y} cx={x} cy={y} rx="1.8" ry="2.6" fill="#ffe38a" />
        ))}
        <Face x={50} y={58} s={0.9} />
      </Sticker>
      <Sticker shape={cloud} style={pos({ top: '11%', right: '6%', w: '110px', r: '6deg', d: '-1s' })}>
        <Face x={52} y={58} s={0.9} />
      </Sticker>
      <Sticker shape={daisy} style={pos({ bottom: '24%', right: '5%', w: '92px', r: '-8deg', d: '-3s' })}>
        <Face x={50} y={51} s={0.75} />
      </Sticker>
      <Sticker
        className="hide-sm"
        shape={star}
        style={pos({ top: '40%', right: '13%', w: '64px', r: '14deg', d: '-4s' })}
      >
        <Face x={50} y={54} s={0.8} />
      </Sticker>
      <Sticker shape={bunny} style={pos({ bottom: '18%', left: '9%', w: '92px', r: '-6deg', d: '-2.5s' })}>
        <ellipse cx="37" cy="27" rx="4.5" ry="11" transform="rotate(-10 37 27)" fill="#ffb3cf" />
        <ellipse cx="63" cy="27" rx="4.5" ry="11" transform="rotate(10 63 27)" fill="#ffb3cf" />
        <Face x={50} y={66} />
      </Sticker>
      <Sticker
        className="hide-sm"
        shape={sakura}
        style={pos({ top: '33%', left: '17%', w: '54px', r: '20deg', d: '-1.5s' })}
      >
        {sakuraBits}
      </Sticker>
      <Sticker
        className="hide-sm"
        shape={sakura}
        style={pos({ top: '72%', right: '19%', w: '44px', r: '-15deg', d: '-3.5s' })}
      >
        {sakuraBits}
      </Sticker>
      <Sticker shape={sparkle('#fff')} style={pos({ top: '26%', left: '27%', w: '26px', r: '0deg', d: '-1s' })} />
      <Sticker shape={sparkle('#ff9cc6')} style={pos({ top: '21%', right: '25%', w: '30px', r: '0deg', d: '-2s' })} />
      <Sticker
        className="hide-sm"
        shape={sparkle('#fff')}
        style={pos({ top: '66%', left: '22%', w: '20px', r: '0deg', d: '-3s' })}
      />
      <Sticker
        className="hide-sm"
        shape={sparkle('#ffd95e')}
        style={pos({ top: '52%', right: '29%', w: '18px', r: '0deg', d: '-4s' })}
      />
    </div>
  );
}

export const HeartSticker = () => <Sticker shape={heart}>{heartBits}</Sticker>;

export const MiniHeart = () => (
  <svg width="18" height="18" viewBox="0 0 100 100" aria-hidden="true">
    <path d={HEART} fill="#ff5c9f" />
  </svg>
);
