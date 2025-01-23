export const TreeShaker = () => {
  // The tailwind tree shaking was cutting out our card rotation classes
  // this ensures they are all included in the site

  return (
    <div className="hidden">
      <div className="rotate-card-1"></div>
      <div className="rotate-card-2"></div>
      <div className="rotate-card-3"></div>
      <div className="rotate-card-4"></div>
      <div className="rotate-card-5"></div>
      <div className="rotate-card-6"></div>
      <div className="rotate-card-7"></div>
      <div className="rotate-card-8"></div>
      <div className="rotate-card-9"></div>
    </div>
  );
};
