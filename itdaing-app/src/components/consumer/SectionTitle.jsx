import PropTypes from 'prop-types';

const SectionTitle = ({ title, highlight }) => {
  return (
    <h2 className="font-display text-2xl sm:text-[26px] font-black text-[#111] leading-tight tracking-tight">
      {title}
      {highlight && <span className="text-brand ml-1">{highlight}</span>}
    </h2>
  );
};

SectionTitle.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  highlight: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

export default SectionTitle;
