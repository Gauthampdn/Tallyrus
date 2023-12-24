const Gallery = ({ template, onClick }) => {
  return (
    <div className="side-details" onClick={onClick}>
      <h4>{template.title}</h4>
      <p>{template.description}</p>
    </div>
  );
}

export default Gallery;