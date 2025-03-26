export function Video(src: string, type: string) {
  return (
    <video width="320" height="240" controls preload="none">
      <source src={src} type={`video/${type}`} />
      <track
        src="/path/to/captions.vtt"
        kind="subtitles"
        srcLang="en"
        label="English"
      />
      Your browser does not support the video tag.
    </video>
  );
}
