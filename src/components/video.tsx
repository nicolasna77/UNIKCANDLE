const Video = ({
  src,
  captions,
  className,
  type,
}: {
  src: string;
  captions: string;
  className: string;
  type: string;
}) => {
  return (
    <video autoPlay muted loop playsInline preload="none" className={className}>
      <source src={src} type={type} />
      <track src={captions} kind="subtitles" srcLang="fr" label="Français" />
      Your browser does not support the video tag.
    </video>
  );
};

export default Video;
